import datetime
import json
import re

def utc_now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

class Field:
    def __init__(self, name: str):
        self.name = name

    def __eq__(self, other):
        return QueryExpr({self.name: other})

    def __ne__(self, other):
        return QueryExpr({self.name: {"$ne": other}})

    def __gt__(self, other):
        return QueryExpr({self.name: {"$gt": other}})

    def __ge__(self, other):
        return QueryExpr({self.name: {"$gte": other}})

    def __lt__(self, other):
        return QueryExpr({self.name: {"$lt": other}})

    def __le__(self, other):
        return QueryExpr({self.name: {"$lte": other}})

    def ilike(self, pattern: str):
        if not pattern:
            return QueryExpr({self.name: ""})
        if pattern.startswith("%") or pattern.endswith("%"):
            clean = pattern.strip("%")
            regex = re.escape(clean)
        else:
            regex = f"^{re.escape(pattern)}$"
        return QueryExpr({self.name: {"$regex": regex, "$options": "i"}})

    def in_(self, values):
        return QueryExpr({self.name: {"$in": list(values)}})

    def desc(self):
        return (self.name, -1)

    def asc(self):
        return (self.name, 1)


class QueryExpr:
    def __init__(self, query: dict):
        self.query = query

    def to_mongo(self) -> dict:
        return self.query

    def __or__(self, other):
        q1 = self.query
        q2 = other.to_mongo() if hasattr(other, "to_mongo") else (other.query if isinstance(other, QueryExpr) else other)
        list1 = q1.get("$or", [q1]) if (isinstance(q1, dict) and len(q1) == 1 and "$or" in q1) else [q1]
        list2 = q2.get("$or", [q2]) if (isinstance(q2, dict) and len(q2) == 1 and "$or" in q2) else [q2]
        return QueryExpr({"$or": list1 + list2})

    def __and__(self, other):
        q1 = self.query
        q2 = other.to_mongo() if hasattr(other, "to_mongo") else (other.query if isinstance(other, QueryExpr) else other)
        list1 = q1.get("$and", [q1]) if (isinstance(q1, dict) and len(q1) == 1 and "$and" in q1) else [q1]
        list2 = q2.get("$and", [q2]) if (isinstance(q2, dict) and len(q2) == 1 and "$and" in q2) else [q2]
        return QueryExpr({"$and": list1 + list2})


class ModelMeta(type):
    def __getattr__(cls, name: str):
        return Field(name)


class _DummyMetadata:
    def create_all(self, bind=None):
        pass


class Base:
    metadata = _DummyMetadata()


class Document(Base, metaclass=ModelMeta):
    __tablename__ = "documents"

    def __init__(self, **kwargs):
        for k, v in self.default_values().items():
            setattr(self, k, v)
        for k, v in kwargs.items():
            setattr(self, k, self._clean_val(v))

    @classmethod
    def default_values(cls) -> dict:
        return {}

    @staticmethod
    def _clean_val(v):
        if isinstance(v, str) and (
            (v.startswith("{") and v.endswith("}")) or (v.startswith("[") and v.endswith("]"))
        ):
            try:
                return json.loads(v)
            except Exception:
                return v
        return v

    def to_dict(self) -> dict:
        d = {}
        for k, v in self.__dict__.items():
            if k.startswith("_"):
                continue
            d[k] = v
        return d

    @classmethod
    def from_doc(cls, doc: dict):
        if not doc:
            return None
        data = {k: cls._clean_val(v) for k, v in doc.items() if k != "_id"}
        return cls(**data)


class User(Document):
    __tablename__ = "users"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "name": "",
            "email": "",
            "password_hash": "",
            "is_onboarded": False,
            "target_career_id": None,
            "created_at": utc_now_iso(),
            "updated_at": utc_now_iso(),
        }


class CareerProfile(Document):
    __tablename__ = "career_profiles"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "education": {},
            "technical_skills": [],
            "soft_skills": [],
            "interests": [],
            "experience": {},
            "career_goals": {},
            "work_preferences": {},
            "readiness_score": 50,
            "readiness_breakdown": {},
            "current_direction": "Software Developer",
            "match_percentage": 70,
            "direction_explanation": "",
            "biggest_opportunity": "",
            "next_best_action": "",
            "created_at": utc_now_iso(),
            "updated_at": utc_now_iso(),
        }


class CareerRole(Document):
    __tablename__ = "career_roles"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "title": "",
            "slug": "",
            "category": "",
            "description": "",
            "what_they_do": [],
            "core_technical_skills": [],
            "soft_skills": [],
            "common_tools": [],
            "entry_level_expectations": [],
            "suggested_projects": [],
            "career_progression": [],
            "related_careers": [],
        }


class Assessment(Document):
    __tablename__ = "assessments"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "current_question_index": 0,
            "is_completed": False,
            "answers": [],
            "category_scores": {},
            "ai_analysis": {},
            "started_at": utc_now_iso(),
            "completed_at": None,
        }


class LearningResource(Document):
    __tablename__ = "learning_resources"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "title": "",
            "provider": "",
            "url": "",
            "category": "",
            "difficulty": "",
            "estimated_duration": "",
            "resource_type": "Guide",
            "related_skills": [],
            "is_verified": True,
        }


class LearningRoadmap(Document):
    __tablename__ = "learning_roadmaps"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "target_career_id": "",
            "target_career_title": "",
            "phases": [],
            "overall_progress": 0,
            "generated_at": utc_now_iso(),
            "updated_at": utc_now_iso(),
        }


class SkillEvidence(Document):
    __tablename__ = "skill_evidences"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "skill_name": "",
            "evidence_type": "",
            "title": "",
            "url": None,
            "description": "",
            "verified_status": "Evidence Added",
            "strength": "Moderate",
            "created_at": utc_now_iso(),
        }


class Interview(Document):
    __tablename__ = "interviews"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "career_title": "",
            "difficulty": "Entry-Level",
            "interview_type": "Technical",
            "status": "in_progress",
            "questions": [],
            "answers": [],
            "final_summary": None,
            "created_at": utc_now_iso(),
            "completed_at": None,
        }


class ResumeAnalysis(Document):
    __tablename__ = "resume_analyses"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "target_role": "",
            "file_name": "Pasted_Resume",
            "overall_score": 0,
            "completeness_score": 0,
            "keyword_match_score": 0,
            "impact_score": 0,
            "detected_skills": [],
            "missing_skills": [],
            "soft_skills_detected": [],
            "sections": [],
            "suggestions": [],
            "bullet_point_rewrites": [],
            "analyzed_at": utc_now_iso(),
        }


class ChatMessage(Document):
    __tablename__ = "chat_history"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "role": "",
            "content": "",
            "mode": "local_engine",
            "timestamp": utc_now_iso(),
        }


class CareerAnalysis(Document):
    __tablename__ = "career_analyses"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "analysis_date": utc_now_iso(),
            "recommended_roles": [],
            "readiness_score": 0,
            "target_role": "",
        }


class CareerInsight(Document):
    __tablename__ = "career_insights"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "title": "",
            "observation": "",
            "suggested_action": "",
            "action_route": "/roadmap",
            "category": "readiness",
            "is_read": False,
            "created_at": utc_now_iso(),
        }


class ProgressTimeline(Document):
    __tablename__ = "progress_timeline"

    @classmethod
    def default_values(cls):
        return {
            "id": "",
            "user_id": "",
            "type": "",
            "title": "",
            "description": "",
            "timestamp": utc_now_iso(),
            "meta": {},
        }
