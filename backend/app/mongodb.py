import os
import ssl
import logging
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Ensure backend/.env is loaded
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip("\"'"))

# Apply SNI routing patch for AWS ap-south-1 multi-tenant M0 Atlas cluster certificates
_orig_wrap_socket = ssl.SSLContext.wrap_socket

def _custom_wrap_socket(self, sock, *args, **kwargs):
    host = kwargs.get("server_hostname")
    if host and "ac-zdpv1ro-shard-00-0" in host:
        idx = host.split("ac-zdpv1ro-shard-00-0")[1][0]
        kwargs["server_hostname"] = f"mtm-aws-aps1-3-m0-4-shard-00-0{idx}.w7gle.mongodb.net"
    return _orig_wrap_socket(self, sock, *args, **kwargs)

ssl.SSLContext.wrap_socket = _custom_wrap_socket

_client = None
_db = None
_last_check_time = 0
_last_check_result = False

def get_mongo_uri() -> str:
    uri = os.getenv("MONGODB_URI") or os.getenv("DATABASE_URL", "")
    if uri.startswith("mongodb"):
        return uri
    return ""

def get_database_name() -> str:
    return os.getenv("DATABASE_NAME", "career_guidance")

def get_mongo_client():
    """
    Returns a singleton MongoClient with TLS certifi configuration and connection pooling.
    Safely closes unauthenticated connection attempts to avoid background retry noise.
    """
    global _client, _db, _last_check_time, _last_check_result
    import time
    now = time.time()

    if _client is not None:
        return _client

    # Throttle failed connection attempts by 20 seconds to prevent background thread spam
    if not _last_check_result and (now - _last_check_time) < 20:
        return None

    _last_check_time = now
    uri = get_mongo_uri()
    if not uri:
        _last_check_result = False
        return None

    temp_client = None
    try:
        import certifi
        from pymongo import MongoClient

        connect_kwargs = {
            "tlsCAFile": certifi.where(),
            "serverSelectionTimeoutMS": 5000,
            "connectTimeoutMS": 5000,
            "maxPoolSize": 50,
            "minPoolSize": 5,
        }
        if "replicaSet" not in uri and "cluster0.ewte6cm.mongodb.net" in uri:
            connect_kwargs["replicaSet"] = "atlas-m6wj4i-shard-0"

        temp_client = MongoClient(uri, **connect_kwargs)
        # Verify connectivity
        temp_client.admin.command("ping")
        _client = temp_client
        _db = _client[get_database_name()]
        _last_check_result = True
        logger.info("Successfully connected to MongoDB (%s)", get_database_name())
        return _client
    except Exception as exc:
        _last_check_result = False
        logger.warning("MongoDB connection could not be established: %s", exc)
        if temp_client is not None:
            try:
                temp_client.close()
            except Exception:
                pass
        _client = None
        _db = None
        return None

def get_mongo_db():
    """Returns the MongoDB database instance or None if not connected."""
    global _db
    if _db is not None:
        return _db
    client = get_mongo_client()
    if client is not None:
        _db = client[get_database_name()]
        return _db
    return None

_last_ping_time = 0
_last_ping_status = False

def is_mongo_connected() -> bool:
    global _last_ping_time, _last_ping_status
    import time
    now = time.time()
    if _last_ping_status and (now - _last_ping_time) < 30:
        return True
    try:
        client = get_mongo_client()
        if client:
            client.admin.command("ping")
            _last_ping_status = True
            _last_ping_time = now
            return True
        return False
    except Exception:
        _last_ping_status = False
        return False

def init_mongo_indexes():
    """Creates essential performance and uniqueness indexes on MongoDB collections."""
    db = get_mongo_db()
    if db is None:
        return False

    try:
        from pymongo import ASCENDING, DESCENDING
        # Users collection
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.users.create_index([("id", ASCENDING)], unique=True)

        # Career profiles
        db.career_profiles.create_index([("user_id", ASCENDING)], unique=True)

        # Assessments
        db.assessments.create_index([("user_id", ASCENDING)])
        db.assessments.create_index([("id", ASCENDING)], unique=True)

        # Interviews
        db.interviews.create_index([("user_id", ASCENDING)])
        db.interviews.create_index([("id", ASCENDING)], unique=True)
        db.interviews.create_index([("status", ASCENDING)])

        # Chat history
        db.chat_history.create_index([("user_id", ASCENDING), ("timestamp", ASCENDING)])
        db.chat_history.create_index([("id", ASCENDING)], unique=True)

        # Learning roadmaps
        db.learning_roadmaps.create_index([("user_id", ASCENDING)])

        # Skill evidences
        db.skill_evidences.create_index([("user_id", ASCENDING)])

        # Resume analyses
        db.resume_analyses.create_index([("user_id", ASCENDING)])

        logger.info("MongoDB indexes verified successfully.")
        return True
    except Exception as e:
        logger.warning("Failed to create MongoDB indexes: %s", e)
        return False

def sync_instance_to_mongo(instance, action: str = "upsert"):
    """Synchronize an ORM model instance with its corresponding MongoDB collection."""
    try:
        db = get_mongo_db()
        if db is None:
            return

        table_name = getattr(instance, "__tablename__", None)
        if not table_name:
            return

        col_name = "chat_history" if table_name == "chat_messages" else table_name
        doc_id = getattr(instance, "id", None)
        if not doc_id:
            return

        col = db[col_name]
        if action == "delete":
            col.delete_one({"id": str(doc_id)})
            return

        doc = {}
        for col_def in instance.__table__.columns:
            val = getattr(instance, col_def.name, None)
            doc[col_def.name] = val

        col.update_one({"id": str(doc_id)}, {"$set": doc}, upsert=True)
    except Exception as exc:
        logger.debug("Mongo sync error on %s: %s", getattr(instance, "__tablename__", "unknown"), exc)

def setup_mongo_orm_sync():
    """No-op retained for backwards compatibility: Mongo is now the native primary store."""
    pass

