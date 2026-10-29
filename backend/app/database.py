import os
import re
import uuid
import threading
from typing import Any, Dict, List, Optional
from backend.app.mongodb import get_mongo_db, is_mongo_connected
from backend.app.models import Document, QueryExpr, Base


class _InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []
        self._lock = threading.Lock()

    def _matches_cond(self, doc_val, cond):
        if isinstance(cond, dict):
            for op, val in cond.items():
                if op == "$ne" and doc_val == val:
                    return False
                if op == "$in" and doc_val not in val:
                    return False
                if op == "$regex":
                    flags = re.IGNORECASE if cond.get("$options") == "i" else 0
                    if not re.search(val, str(doc_val or ""), flags=flags):
                        return False
            return True
        return doc_val == cond

    def _matches(self, doc: Dict[str, Any], filter_dict: Dict[str, Any]) -> bool:
        if not filter_dict:
            return True
        if "$or" in filter_dict:
            return any(self._matches(doc, branch) for branch in filter_dict["$or"])
        if "$and" in filter_dict:
            return all(self._matches(doc, branch) for branch in filter_dict["$and"])

        for k, cond in filter_dict.items():
            if k in ("$or", "$and"):
                continue
            doc_val = doc.get(k)
            if not self._matches_cond(doc_val, cond):
                return False
        return True

    def find(self, filter_dict=None):
        filter_dict = filter_dict or {}
        with self._lock:
            matched = [dict(d) for d in self.docs if self._matches(d, filter_dict)]
        return _InMemoryCursor(matched)

    def find_one(self, filter_dict=None, sort=None):
        cursor = self.find(filter_dict)
        if sort:
            cursor.sort(sort)
        docs = list(cursor)
        return docs[0] if docs else None

    def count_documents(self, filter_dict=None):
        return len(list(self.find(filter_dict)))

    def replace_one(self, filter_dict, doc, upsert=False):
        with self._lock:
            for idx, existing in enumerate(self.docs):
                if self._matches(existing, filter_dict):
                    self.docs[idx] = dict(doc)
                    return
            if upsert:
                self.docs.append(dict(doc))

    def insert_one(self, doc):
        with self._lock:
            self.docs.append(dict(doc))

    def delete_one(self, filter_dict):
        with self._lock:
            for idx, existing in enumerate(self.docs):
                if self._matches(existing, filter_dict):
                    self.docs.pop(idx)
                    return

    def delete_many(self, filter_dict):
        with self._lock:
            self.docs = [d for d in self.docs if not self._matches(d, filter_dict)]


class _InMemoryCursor:
    def __init__(self, docs: List[Dict[str, Any]]):
        self._docs = docs

    def sort(self, sort_spec):
        if not sort_spec:
            return self
        if isinstance(sort_spec, tuple):
            sort_spec = [sort_spec]
        for key, direction in reversed(sort_spec):
            self._docs.sort(key=lambda d: d.get(key) or "", reverse=(direction < 0))
        return self

    def limit(self, n: int):
        if n is not None:
            self._docs = self._docs[:n]
        return self

    def __iter__(self):
        return iter(self._docs)


class _InMemoryDb:
    def __init__(self):
        self.collections: Dict[str, _InMemoryCollection] = {}
        self._lock = threading.Lock()

    def __getitem__(self, name: str) -> _InMemoryCollection:
        with self._lock:
            if name not in self.collections:
                self.collections[name] = _InMemoryCollection(name)
            return self.collections[name]


_fallback_db = _InMemoryDb()


def get_active_mongo_db():
    """Returns the live MongoDB database instance, or thread-safe fallback if unavailable."""
    db = get_mongo_db()
    if db is not None:
        return db
    return _fallback_db


class MongoQuery:
    def __init__(self, model_cls, collection, session):
        self.model_cls = model_cls
        self.collection = collection
        self.session = session
        self._filter: Dict[str, Any] = {}
        self._sort: List[Any] = []
        self._limit: Optional[int] = None

    def filter(self, *expressions):
        for expr in expressions:
            if expr is None:
                continue
            q = expr.to_mongo() if hasattr(expr, "to_mongo") else (expr.query if isinstance(expr, QueryExpr) else expr)
            if not self._filter:
                self._filter = dict(q)
            else:
                if "$and" in self._filter:
                    self._filter["$and"].append(q)
                else:
                    self._filter = {"$and": [self._filter, q]}
        return self

    def order_by(self, *sort_items):
        for item in sort_items:
            if isinstance(item, tuple):
                self._sort.append(item)
            elif hasattr(item, "name"):
                self._sort.append((item.name, 1))
        return self

    def limit(self, limit: int):
        self._limit = limit
        return self

    def first(self):
        doc = self.collection.find_one(self._filter, sort=self._sort if self._sort else None)
        if doc:
            obj = self.model_cls.from_doc(doc)
            self.session._track(obj)
            return obj
        return None

    def all(self):
        cursor = self.collection.find(self._filter)
        if self._sort:
            cursor = cursor.sort(self._sort)
        if self._limit is not None:
            cursor = cursor.limit(self._limit)
        results = []
        for doc in cursor:
            obj = self.model_cls.from_doc(doc)
            self.session._track(obj)
            results.append(obj)
        return results

    def count(self) -> int:
        return self.collection.count_documents(self._filter)

    def delete(self):
        return self.collection.delete_many(self._filter)


class MongoSession:
    def __init__(self, db=None):
        self.db = db if db is not None else get_active_mongo_db()
        self._tracked: Dict[str, Any] = {}
        self._to_delete: set = set()

    def _track(self, obj):
        if obj and getattr(obj, "id", None):
            self._tracked[obj.id] = obj

    def query(self, model_cls):
        col_name = getattr(model_cls, "__tablename__", "documents")
        collection = self.db[col_name]
        return MongoQuery(model_cls, collection, self)

    def add(self, obj):
        if obj:
            if not getattr(obj, "id", None):
                obj.id = "doc_" + uuid.uuid4().hex[:10]
            self._tracked[obj.id] = obj
            self._to_delete.discard(obj.id)

    def delete(self, obj):
        if obj and getattr(obj, "id", None):
            self._to_delete.add(obj.id)
            self._tracked.pop(obj.id, None)
            col_name = getattr(obj, "__tablename__", "documents")
            self.db[col_name].delete_one({"id": obj.id})

    def commit(self):
        for obj_id, obj in list(self._tracked.items()):
            col_name = getattr(obj, "__tablename__", "documents")
            doc = obj.to_dict()
            self.db[col_name].replace_one({"id": obj.id}, doc, upsert=True)
        self._to_delete.clear()

    def refresh(self, obj):
        if obj and getattr(obj, "id", None):
            col_name = getattr(obj, "__tablename__", "documents")
            fresh = self.db[col_name].find_one({"id": obj.id})
            if fresh:
                for k, v in Document._clean_val(fresh).items():
                    if k != "_id":
                        setattr(obj, k, v)

    def rollback(self):
        self._tracked.clear()
        self._to_delete.clear()

    def close(self):
        self._tracked.clear()
        self._to_delete.clear()


Session = MongoSession


def SessionLocal():
    return MongoSession()


def get_db():
    session = MongoSession()
    try:
        yield session
    finally:
        session.close()


class _EngineDialect:
    name = "mongodb"


class _EngineConnection:
    def execute(self, statement):
        return True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


class _StubEngine:
    dialect = _EngineDialect()

    def connect(self):
        return _EngineConnection()


engine = _StubEngine()
