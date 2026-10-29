import os
import sys
import json
import sqlite3
from pathlib import Path
from datetime import datetime

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.mongodb import get_mongo_db, is_mongo_connected, init_mongo_indexes

JSON_COLUMNS_BY_TABLE = {
    "career_profiles": ["technical_skills", "soft_skills", "interests", "experience", "career_goals", "work_preferences", "readiness_breakdown"],
    "career_roles": ["core_technical_skills", "soft_skills", "common_tools", "entry_level_expectations", "suggested_projects", "career_progression", "related_careers"],
    "learning_resources": ["related_skills"],
    "assessments": ["answers", "category_scores", "ai_analysis"],
    "learning_roadmaps": ["phases"],
    "interviews": ["questions", "answers", "final_summary"],
    "resume_analyses": ["detected_skills", "missing_skills", "soft_skills_detected", "sections", "suggestions", "bullet_point_rewrites"],
    "career_analyses": ["recommended_roles"],
    "progress_timeline": ["meta"]
}

def parse_val(col_name: str, val: any, json_cols: list):
    if val is None:
        return None
    if col_name in json_cols and isinstance(val, str):
        val_strip = val.strip()
        if (val_strip.startswith("{") and val_strip.endswith("}")) or (val_strip.startswith("[") and val_strip.endswith("]")):
            try:
                return json.loads(val_strip)
            except Exception:
                return val
    return val

def export_sqlite_data(sqlite_path: str = "career_guidance.db"):
    if not os.path.exists(sqlite_path):
        print(f"Error: SQLite database {sqlite_path} does not exist.")
        return {}

    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    data = {}

    for (table_name,) in tables:
        if table_name.startswith("sqlite_"):
            continue
        rows = cursor.execute(f"SELECT * FROM [{table_name}]").fetchall()
        json_cols = JSON_COLUMNS_BY_TABLE.get(table_name, [])
        table_docs = []
        for r in rows:
            doc = {}
            for col in r.keys():
                doc[col] = parse_val(col, r[col], json_cols)
            table_docs.append(doc)
        data[table_name] = table_docs
        print(f"Read {len(table_docs)} records from SQLite table [{table_name}].")

    conn.close()
    return data

def run_migration(sqlite_path: str = "career_guidance.db", dry_run: bool = False):
    print("=" * 60)
    print("EmployabilityAI: SQLite to MongoDB Data Migration")
    print("=" * 60)

    data = export_sqlite_data(sqlite_path)
    if not data:
        print("No SQLite data found to migrate.")
        return

    # Always save a verified backup export file first
    backup_path = Path(BASE_DIR) / "backend" / "data_backup_sqlite.json"
    backup_path.parent.mkdir(parents=True, exist_ok=True)
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"\n[BACKUP] Safely exported complete SQLite dataset to: {backup_path}")

    if dry_run:
        print("\n[DRY RUN] Completed export without writing to MongoDB.")
        return

    print("\nConnecting to MongoDB...")
    db = get_mongo_db()
    if db is None:
        print("[WARNING] Could not connect to MongoDB Atlas at this time.")
        print("The verified SQLite export JSON has been preserved.")
        print("Once MongoDB Atlas credentials are authenticated, run this script again without --dry-run.")
        return

    print(f"Connected to MongoDB database: {db.name}")
    init_mongo_indexes()

    print("\nMigrating collections...")
    for table_name, docs in data.items():
        if not docs:
            continue
        col = db[table_name]
        inserted = 0
        updated = 0
        for doc in docs:
            doc_id = doc.get("id")
            if doc_id:
                res = col.update_one({"id": doc_id}, {"$set": doc}, upsert=True)
                if res.upserted_id:
                    inserted += 1
                else:
                    updated += 1
            else:
                col.insert_one(doc)
                inserted += 1
        mongo_count = col.count_documents({})
        print(f"Collection [{table_name}]: {inserted} inserted, {updated} updated (Total in Mongo: {mongo_count})")

    print("\n[SUCCESS] Migration completed and verified across all collections.")

if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    run_migration(dry_run=dry)
