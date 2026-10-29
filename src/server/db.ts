import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import seedData from '../data/seedData.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env with override: true so container environment placeholders are overridden by .env values
const rootEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
}
const backendEnvPath = path.resolve(process.cwd(), 'backend/.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://tmhv7231_db_user:L5Q3tbuzdZ7ldD7L@ai-career-guidance.cuipauf.mongodb.net/career_guidance?retryWrites=true&w=majority';
const DATABASE_NAME = process.env.DATABASE_NAME || 'career_guidance';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

export async function connectMongo(): Promise<Db | null> {
  if (db && isConnected) return db;
  try {
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(DATABASE_NAME);
    isConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to database: ${DATABASE_NAME}`);
    await initMongoDatabase(db);
    return db;
  } catch (err: any) {
    console.warn(`[MongoDB Atlas] Connection notice: ${err?.message || err}. Operating in resilient hybrid mode.`);
    isConnected = false;
    return null;
  }
}

export function getDb(): Db | null {
  return db;
}

export function isMongoReady(): boolean {
  return isConnected && db !== null;
}

// ----------------------------------------------------
// Database Initialization & Indexing
// ----------------------------------------------------
async function initMongoDatabase(database: Db): Promise<void> {
  try {
    // 1. Ensure indexes for efficient querying
    await database.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true }).catch(() => {});
    await database.collection('users').createIndex({ id: 1 }).catch(() => {});
    await database.collection('career_profiles').createIndex({ userId: 1 }).catch(() => {});
    await database.collection('assessments').createIndex({ userId: 1, completedAt: -1 }).catch(() => {});
    await database.collection('learning_roadmaps').createIndex({ userId: 1 }).catch(() => {});
    await database.collection('skill_evidences').createIndex({ userId: 1, createdAt: -1 }).catch(() => {});
    await database.collection('interviews').createIndex({ userId: 1, createdAt: -1 }).catch(() => {});
    await database.collection('resume_analyses').createIndex({ userId: 1, analyzedAt: -1 }).catch(() => {});
    await database.collection('progress_timeline').createIndex({ userId: 1, timestamp: -1 }).catch(() => {});
    await database.collection('chat_history').createIndex({ userId: 1, timestamp: 1 }).catch(() => {});

    // 2. Seed initial careers if empty
    const careerCount = await database.collection('career_roles').countDocuments();
    if (careerCount === 0 && seedData.INITIAL_CAREERS) {
      console.log(`[MongoDB] Seeding ${seedData.INITIAL_CAREERS.length} career benchmark roles into MongoDB...`);
      await database.collection('career_roles').insertMany(
        seedData.INITIAL_CAREERS.map((c: any) => ({
          ...c,
          _id: undefined,
          id: c.id || c.slug,
          seededAt: new Date().toISOString(),
        }))
      );
    }

    // 3. Seed demo student user Alex Chen if not present
    const demoUser = await database.collection('users').findOne({ id: 'usr_demo_alex_chen' });
    if (!demoUser) {
      console.log('[MongoDB] Seeding demo student Alex Chen into MongoDB...');
      await database.collection('users').insertOne({
        id: 'usr_demo_alex_chen',
        name: 'Alex Chen',
        email: 'alex.chen@university.edu',
        role: 'student',
        targetCareerId: 'software-developer',
        isOnboarded: true,
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Seed demo profile if not present
    const demoProfile = await database.collection('career_profiles').findOne({ userId: 'usr_demo_alex_chen' });
    if (!demoProfile) {
      console.log('[MongoDB] Seeding initial profile for Alex Chen into MongoDB...');
      await database.collection('career_profiles').insertOne({
        id: 'prof_demo_alex',
        userId: 'usr_demo_alex_chen',
        fullName: 'Alex Chen',
        email: 'alex.chen@university.edu',
        currentDirection: 'Software Developer',
        targetCareerId: 'software-developer',
        readinessScore: 84,
        education: {
          degree: 'B.Tech in Computer Science & Engineering',
          department: 'Computer Science',
          institution: 'State University of Technology',
          graduationYear: 2026,
          academicPerformance: '8.8 CGPA (First Class with Distinction)',
        },
        technicalSkills: [
          { name: 'JavaScript / TypeScript', level: 85, category: 'Programming', verified: true },
          { name: 'React / Modern Frontend', level: 80, category: 'Web Development', verified: true },
          { name: 'Node.js & Express', level: 75, category: 'Web Development', verified: false },
          { name: 'SQL & Relational DBs', level: 70, category: 'Databases', verified: false },
          { name: 'Data Structures & Algorithms', level: 80, category: 'Programming', verified: true },
          { name: 'Git Version Control', level: 88, category: 'Tools & Others', verified: true },
          { name: 'Docker & Containerization', level: 55, category: 'Cloud & DevOps', verified: false },
          { name: 'Automated Testing (Jest/Mocha)', level: 50, category: 'Tools & Others', verified: false },
        ],
        softSkills: [
          'Analytical Problem Solving',
          'Clear Technical Communication',
          'Constructive Code Review Feedback',
          'Autonomous Debugging & Research',
        ],
        interests: [
          'Full-Stack Web Development',
          'Cloud Architecture',
          'Scalable Microservices',
          'Open Source Contribution',
        ],
        careerGoals: {
          desiredRole: 'Software Developer',
          timeframe: '6 Months',
          preferredWorkStyle: 'Hybrid / Remote',
          targetIndustry: 'Technology & Cloud Platforms',
        },
        updatedAt: new Date().toISOString(),
      });
    }

    console.log('[MongoDB] Atlas schema and collections ready.');
  } catch (err: any) {
    console.warn('[MongoDB] Initialization notice:', err?.message || err);
  }
}

// ----------------------------------------------------
// MongoDB DAO Helpers for Platform Entities
// ----------------------------------------------------

// ----------------------------------------------------
// MongoDB DAO Helpers for Platform Entities
// ----------------------------------------------------

function buildUserFilter(userId: string) {
  return {
    $or: [
      { userId },
      { user_id: userId },
      { userId: 'usr_demo_alex_chen' },
      { user_id: 'usr_alexchen_demo' },
      { id: 'usr_demo_alex_chen' },
      { id: 'usr_alexchen_demo' },
    ],
  };
}

export async function mongoGetProfile(userId: string): Promise<any | null> {
  const database = await connectMongo();
  if (!database) return null;
  const doc = await database.collection('career_profiles').findOne(buildUserFilter(userId), { projection: { _id: 0 } });
  if (!doc) return null;

  let education = doc.education;
  if (typeof education === 'string') {
    try {
      education = JSON.parse(education);
    } catch {}
  }

  return {
    id: doc.id || 'prof_demo_alex',
    userId: doc.userId || doc.user_id || userId,
    fullName: doc.fullName || doc.name || 'Alex Chen',
    email: doc.email || 'alex.chen@university.edu',
    currentDirection: doc.currentDirection || doc.current_direction || 'Software Developer',
    targetCareerId: doc.targetCareerId || 'software-developer',
    readinessScore: doc.readinessScore || doc.readiness_score || 84,
    education: education || {
      degree: 'B.Tech in Computer Science & Engineering',
      department: 'Computer Science',
      institution: 'State University of Technology',
      graduationYear: 2026,
      academicPerformance: '8.8 CGPA (First Class with Distinction)',
    },
    technicalSkills: (doc.technicalSkills || doc.technical_skills || []).map((s: any) => ({
      name: s.name,
      level: s.level || 75,
      category: s.category || 'General',
      verified: Boolean(s.verified),
    })),
    softSkills: doc.softSkills || doc.soft_skills || [
      'Analytical Problem Solving',
      'Clear Technical Communication',
      'Constructive Code Review Feedback',
      'Autonomous Debugging & Research',
    ],
    interests: doc.interests || [
      'Full-Stack Web Development',
      'Cloud Architecture',
      'Scalable Microservices',
      'Open Source Contribution',
    ],
    careerGoals: doc.careerGoals || doc.career_goals || {
      desiredRole: 'Software Developer',
      timeframe: '6 Months',
      preferredWorkStyle: 'Hybrid / Remote',
      targetIndustry: 'Technology & Cloud Platforms',
    },
    updatedAt: doc.updatedAt || doc.updated_at || new Date().toISOString(),
  };
}

export async function mongoUpsertProfile(profile: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !profile) return false;
  const userId = profile.userId || 'usr_demo_alex_chen';
  const clean = {
    ...profile,
    userId,
    user_id: 'usr_alexchen_demo',
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('career_profiles').updateOne(
    buildUserFilter(userId),
    { $set: clean },
    { upsert: true }
  );
  return true;
}

export async function mongoGetLatestAssessment(userId: string): Promise<any | null> {
  const database = await connectMongo();
  if (!database) return null;
  return database.collection('assessments').findOne(
    buildUserFilter(userId),
    { sort: { completedAt: -1, created_at: -1 }, projection: { _id: 0 } }
  );
}

export async function mongoSaveAssessment(assessment: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !assessment) return false;
  const clean = {
    ...assessment,
    userId: assessment.userId || 'usr_demo_alex_chen',
    user_id: 'usr_alexchen_demo',
    savedAt: new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('assessments').insertOne(clean);
  return true;
}

export async function mongoGetResumes(userId: string): Promise<any[]> {
  const database = await connectMongo();
  if (!database) return [];
  return database.collection('resume_analyses')
    .find(buildUserFilter(userId), { projection: { _id: 0 } })
    .sort({ analyzedAt: -1, created_at: -1 })
    .limit(10)
    .toArray();
}

export async function mongoSaveResume(resume: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !resume) return false;
  const clean = {
    ...resume,
    userId: resume.userId || 'usr_demo_alex_chen',
    user_id: 'usr_alexchen_demo',
    analyzedAt: resume.analyzedAt || new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('resume_analyses').insertOne(clean);
  return true;
}

export async function mongoGetInterviews(userId: string): Promise<any[]> {
  const database = await connectMongo();
  if (!database) return [];
  const list = await database.collection('interviews')
    .find(buildUserFilter(userId), { projection: { _id: 0 } })
    .sort({ createdAt: -1, created_at: -1 })
    .limit(20)
    .toArray();
  return list.map((doc: any) => ({
    id: doc.id || ('int_' + Math.random().toString(36).slice(2, 8)),
    userId: doc.userId || doc.user_id || userId,
    careerTitle: doc.careerTitle || doc.career_title || 'Software Developer',
    interviewType: doc.interviewType || doc.interview_type || doc.format || 'Technical Interview',
    format: doc.format || doc.interview_type || 'Technical Interview',
    difficulty: doc.difficulty || 'Intermediate',
    mode: doc.mode || 'realistic',
    durationMinutes: doc.durationMinutes || doc.duration_minutes || 15,
    status: doc.status || 'completed',
    overallScore: doc.overallScore !== undefined ? doc.overallScore : (doc.overall_score !== undefined ? doc.overall_score : null),
    finalSummary: doc.finalSummary || doc.final_summary || null,
    questions: doc.questions || [],
    answers: doc.answers || [],
    conversation: doc.conversation || [],
    createdAt: doc.createdAt || doc.created_at || new Date().toISOString(),
    completedAt: doc.completedAt || doc.completed_at || doc.createdAt || doc.created_at || new Date().toISOString(),
    sessionConfig: doc.sessionConfig || doc.session_config || {},
  }));
}

export async function mongoSaveInterview(interview: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !interview) return false;
  const clean = {
    ...interview,
    userId: interview.userId || 'usr_demo_alex_chen',
    user_id: 'usr_alexchen_demo',
    updatedAt: new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('interviews').updateOne(
    { id: interview.id },
    { $set: clean },
    { upsert: true }
  );
  return true;
}

export async function mongoGetRoadmap(userId: string): Promise<any | null> {
  const database = await connectMongo();
  if (!database) return null;
  return database.collection('learning_roadmaps').findOne(buildUserFilter(userId), { projection: { _id: 0 } });
}

export async function mongoSaveRoadmap(roadmap: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !roadmap) return false;
  const userId = roadmap.userId || 'usr_demo_alex_chen';
  const clean = {
    ...roadmap,
    userId,
    user_id: 'usr_alexchen_demo',
    updatedAt: new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('learning_roadmaps').updateOne(
    buildUserFilter(userId),
    { $set: clean },
    { upsert: true }
  );
  return true;
}

export async function mongoGetEvidences(userId: string): Promise<any[]> {
  const database = await connectMongo();
  if (!database) return [];
  return database.collection('skill_evidences')
    .find(buildUserFilter(userId), { projection: { _id: 0 } })
    .sort({ createdAt: -1, created_at: -1 })
    .toArray();
}

export async function mongoSaveEvidence(evidence: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !evidence) return false;
  const clean = {
    ...evidence,
    userId: evidence.userId || 'usr_demo_alex_chen',
    user_id: 'usr_alexchen_demo',
    createdAt: evidence.createdAt || new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('skill_evidences').updateOne(
    { id: evidence.id },
    { $set: clean },
    { upsert: true }
  );
  return true;
}

export async function mongoDeleteEvidence(id: string, userId: string): Promise<boolean> {
  const database = await connectMongo();
  if (!database) return false;
  await database.collection('skill_evidences').deleteOne({
    id,
    ...buildUserFilter(userId),
  });
  return true;
}

export async function mongoGetTimeline(userId: string): Promise<any[]> {
  const database = await connectMongo();
  if (!database) return [];
  return database.collection('progress_timeline')
    .find(buildUserFilter(userId), { projection: { _id: 0 } })
    .sort({ timestamp: -1, created_at: -1 })
    .limit(50)
    .toArray();
}

export async function mongoAddTimelineItem(item: any): Promise<boolean> {
  const database = await connectMongo();
  if (!database || !item) return false;
  const clean = {
    ...item,
    userId: item.userId || 'usr_demo_alex_chen',
    user_id: 'usr_alexchen_demo',
    timestamp: item.timestamp || new Date().toISOString(),
  };
  delete clean._id;
  await database.collection('progress_timeline').insertOne(clean);
  return true;
}

export async function mongoGetChatHistory(userId: string): Promise<any[]> {
  const database = await connectMongo();
  if (!database) return [];
  return database.collection('chat_history')
    .find(buildUserFilter(userId), { projection: { _id: 0 } })
    .sort({ timestamp: 1 })
    .limit(100)
    .toArray();
}

export async function mongoAppendChatTurn(
  userId: string,
  userMessage: string,
  assistantReply: string,
  mode: string
): Promise<boolean> {
  const database = await connectMongo();
  if (!database) return false;
  const now = new Date().toISOString();
  await database.collection('chat_history').insertMany([
    {
      id: 'u_' + Date.now(),
      userId,
      user_id: 'usr_alexchen_demo',
      role: 'user',
      content: userMessage,
      timestamp: now,
    },
    {
      id: 'a_' + (Date.now() + 1),
      userId,
      user_id: 'usr_alexchen_demo',
      role: 'assistant',
      content: assistantReply,
      mode,
      timestamp: new Date().toISOString(),
    },
  ]);
  return true;
}

export async function mongoClearChatHistory(userId: string): Promise<boolean> {
  const database = await connectMongo();
  if (!database) return false;
  await database.collection('chat_history').deleteMany(buildUserFilter(userId));
  return true;
}

export async function mongoGetStats(): Promise<Record<string, number>> {
  const database = await connectMongo();
  if (!database) return { connected: 0 };
  const counts: Record<string, number> = { connected: 1 };
  const collections = [
    'users',
    'career_profiles',
    'assessments',
    'resume_analyses',
    'interviews',
    'learning_roadmaps',
    'skill_evidences',
    'progress_timeline',
    'chat_history',
    'career_roles',
  ];
  for (const c of collections) {
    counts[c] = await database.collection(c).countDocuments().catch(() => 0);
  }
  return counts;
}
