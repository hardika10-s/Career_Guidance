import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  connectMongo,
  isMongoReady,
  mongoGetProfile,
  mongoUpsertProfile,
  mongoGetLatestAssessment,
  mongoSaveAssessment,
  mongoGetResumes,
  mongoSaveResume,
  mongoGetInterviews,
  mongoSaveInterview,
  mongoGetRoadmap,
  mongoSaveRoadmap,
  mongoGetEvidences,
  mongoSaveEvidence,
  mongoDeleteEvidence,
  mongoGetTimeline,
  mongoAddTimelineItem,
  mongoGetChatHistory,
  mongoAppendChatTurn,
  mongoClearChatHistory,
  mongoGetStats,
} from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with override: true
const rootEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
}
const backendEnvPath = path.resolve(process.cwd(), 'backend/.env');
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB Atlas
connectMongo().catch((err) => {
  console.warn('[Server] MongoDB background connection notice:', err?.message || err);
});

// Initialize Gemini client using @google/genai as required
const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Server] Gemini client initialized with model:', modelName);
  } catch (err) {
    console.warn('[Server] Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------
// Smart Dynamic Advisor Fallback Engine
// ----------------------------------------------------
function buildIntelligentFallback(message: string, context: any, history: any[]): string {
  const q = (message || '').toLowerCase();
  const targetRole = context?.targetRole || 'Software Developer';
  const readiness = context?.readinessScore || 78;
  const missing = Array.isArray(context?.missingSkills) && context.missingSkills.length > 0
    ? context.missingSkills.slice(0, 3).join(', ')
    : 'Docker Containerization, Redis Caching, Unit Testing';
  const userSkills = Array.isArray(context?.userSkills) && context.userSkills.length > 0
    ? context.userSkills.join(', ')
    : 'JavaScript, TypeScript, React, Node.js, SQL';

  if (q.includes('dsa') || q.includes('algorithm') || q.includes('data structure') || q.includes('leetcode')) {
    return (
      `### Data Structures & Algorithms (DSA) Strategy for ${targetRole}\n\n` +
      `To build interview-grade algorithmic fluency without burnout, focus on **pattern recognition** over memorizing individual questions:\n\n` +
      `1. **Core Problem Patterns**: Focus heavily on **Sliding Window**, **Two Pointers**, **Fast & Slow Pointers**, **Top K Elements (Heaps)**, and **Breadth-First Search (BFS)**.\n` +
      `2. **Time Boxing**: Spend no more than 20 minutes attempting a problem before inspecting hints or the editorial solution. Afterward, reimplement it from a clean canvas 24 hours later.\n` +
      `3. **Space-Time Tradeoffs**: Always articulate the Big-O Time and Space complexities before writing a single line of code in our **Interview Arena** (/interview).\n\n` +
      `*Recommended next action:* Practice intermediate algorithmic scenarios in the **Interview Arena** today.`
    );
  }

  if (q.includes('skill') || q.includes('gap') || q.includes('learn') || q.includes('study') || q.includes('course')) {
    return (
      `### Targeted Competency Plan for ${targetRole}\n\n` +
      `Analyzing your profile against industry benchmarks reveals that your existing competencies (${userSkills}) form a solid base, but your priority growth gaps are: **${missing}**.\n\n` +
      `**Actionable 3-Step Strategy:**\n` +
      `- **Step 1 (Concepts)**: Review container lifecycle and microservice rate-limiting fundamentals in the **Learning Hub** (/learning).\n` +
      `- **Step 2 (Milestones)**: Advance through Stage 2 & Stage 3 of your **Personalized Roadmap** (/roadmap) to unlock verified checklists.\n` +
      `- **Step 3 (Proof)**: Deploy an API gateway or full-stack project demonstrating these skills and link it in **Proof of Skills** (/evidence) to boost your readiness score.`
    );
  }

  if (q.includes('resume') || q.includes('cv') || q.includes('ats') || q.includes('bullet')) {
    return (
      `### Resume & ATS Optimization for ${targetRole}\n\n` +
      `To ensure your resume passes technical recruiters and automated ATS screeners:\n\n` +
      `- **Keywords & Placement**: Ensure role-defining technologies (${missing}) appear naturally within project bullet points, not just in a detached skills list.\n` +
      `- **Google XYZ Formula**: Structure accomplishments as *“Accomplished [X] as measured by [Y], by doing [Z]”* (e.g. *“Reduced API response latency by 32% (Y) on multi-tenant queries (X) by implementing Redis write-through caching and composite database indexing (Z)”*).\n` +
      `- **Automated Check**: Paste your current resume draft into our **Resume Analysis** tool (/resume) to get an automated ATS match score and instant bullet rewrites.`
    );
  }

  if (q.includes('interview') || q.includes('mock') || q.includes('arena') || q.includes('behavioral') || q.includes('star')) {
    return (
      `### Technical & Behavioral Interview Preparation\n\n` +
      `For **${targetRole}** interviews, hiring committees assess three distinct pillars:\n\n` +
      `1. **Conceptual Depth & Architecture**: Explain trade-offs (e.g., SQL ACID guarantees vs NoSQL horizontal partitioning, idempotency keys in REST APIs).\n` +
      `2. **Behavioral STAR Stories**: Prepare 3 concrete stories illustrating handling a difficult bug under production deadline, resolving a technical disagreement, and receiving critical code review feedback.\n` +
      `3. **Real-Time Simulation**: Head over to our **Interview Arena** (/interview) to practice a 5-question mock technical round with real-time rubric evaluation.`
    );
  }

  if (q.includes('project') || q.includes('portfolio') || q.includes('github') || q.includes('demo')) {
    return (
      `### High-Impact Portfolio Architecture\n\n` +
      `Top employers prioritize verifiable engineering craftsmanship over tutorial clones:\n\n` +
      `- **Build for Production**: Include health check endpoints, automated tests (Jest/Pytest), Docker containerization, and a clean README with an architectural diagram.\n` +
      `- **Handle Real Edge Cases**: Showcase token bucket rate-limiting, database transactions with error boundaries, and responsive error handling.\n` +
      `- **Showcase Proof**: Add your live demo URL and GitHub repository to the **Proof of Skills** repository (/evidence) to increase your confirmed readiness score (${readiness}%).`
    );
  }

  if (q.includes('switch') || q.includes('career') || q.includes('transition') || q.includes('salary') || q.includes('growth')) {
    return (
      `### Career Pathway & Market Growth for ${targetRole}\n\n` +
      `The market demand for verified **${targetRole}** professionals emphasizes full-stack ownership and cloud infrastructure awareness:\n\n` +
      `- **Junior Level (0-2 yrs)**: $75k - $95k baseline, focusing on clean modular code, Git teamwork, and relational database queries.\n` +
      `- **Mid Level (2-5 yrs)**: $105k - $135k, leading component architectures, writing integration suites, and optimizing throughput.\n` +
      `- **Senior / Staff**: $150k - $210k+, driving microservice reliability, architectural standards, and team mentoring.\n\n` +
      `Check out the **Career Explorer** (/explorer) to compare 15+ industry career tracks and inspect complete salary progression ladders.`
    );
  }

  // Context-aware dynamic reply for general questions
  return (
    `### Career Advisor Guidance for ${targetRole}\n\n` +
    `Regarding your question on **"${message.trim()}"**:\n\n` +
    `As an aspiring **${targetRole}** with an employability readiness of **${readiness}%**, the most strategic approach is to combine targeted theoretical depth with verifiable implementation:\n\n` +
    `1. **Focus on Fundamental Mechanisms**: Master how your runtime executes asynchronous tasks, manages memory, and handles network serialization.\n` +
    `2. **Bridge High-Yield Skills**: Address your highest priority gaps in **${missing}** through hands-on project milestones.\n` +
    `3. **Demonstrate Proof**: Practice simulating technical rounds in the **Interview Arena** (/interview) and track your milestone completions on your **Personalized Roadmap** (/roadmap).\n\n` +
    `Feel free to ask for specific code architectures, system design blueprints, or interview question walkthroughs!`
  );
}

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// Health check and MongoDB status
app.get('/api/health', async (req, res) => {
  const stats = await mongoGetStats();
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: modelName,
    mongoConnected: isMongoReady(),
    mongoStats: stats,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/mongo/status', async (req, res) => {
  const stats = await mongoGetStats();
  res.json({
    ready: isMongoReady(),
    stats,
  });
});

// 1. Profile Endpoints (MongoDB)
app.get('/api/profile', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const profile = await mongoGetProfile(userId);
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const profile = req.body;
    await mongoUpsertProfile(profile);
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Assessment Endpoints (MongoDB)
app.get('/api/assessment', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const assessment = await mongoGetLatestAssessment(userId);
    res.json({ assessment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessment', async (req, res) => {
  try {
    const assessment = req.body;
    await mongoSaveAssessment(assessment);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Resume Endpoints (MongoDB)
app.get('/api/resumes', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const resumes = await mongoGetResumes(userId);
    res.json({ resumes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resumes', async (req, res) => {
  try {
    const resume = req.body;
    await mongoSaveResume(resume);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Interviews Endpoints (MongoDB)
app.get('/api/interviews', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const interviews = await mongoGetInterviews(userId);
    res.json({ interviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/interviews', async (req, res) => {
  try {
    const interview = req.body;
    await mongoSaveInterview(interview);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Roadmap Endpoints (MongoDB)
app.get('/api/roadmap', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const roadmap = await mongoGetRoadmap(userId);
    res.json({ roadmap });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    const roadmap = req.body;
    await mongoSaveRoadmap(roadmap);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Evidence Endpoints (MongoDB)
app.get('/api/evidence', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const evidences = await mongoGetEvidences(userId);
    res.json({ evidences });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/evidence', async (req, res) => {
  try {
    const evidence = req.body;
    await mongoSaveEvidence(evidence);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/evidence/:id', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  const { id } = req.params;
  try {
    await mongoDeleteEvidence(id, userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Timeline Endpoints (MongoDB)
app.get('/api/timeline', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const timeline = await mongoGetTimeline(userId);
    res.json({ timeline });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/timeline', async (req, res) => {
  try {
    const item = req.body;
    await mongoAddTimelineItem(item);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Chat History Endpoints (MongoDB)
app.get('/api/chat/history', async (req, res) => {
  const userId = (req.query.userId as string) || 'usr_demo_alex_chen';
  try {
    const history = await mongoGetChatHistory(userId);
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/clear', async (req, res) => {
  const userId = (req.body.userId as string) || 'usr_demo_alex_chen';
  try {
    await mongoClearChatHistory(userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Gemini AI Chatbot Endpoint (Direct Gemini API + MongoDB Persistence)
app.post('/api/chat', async (req, res) => {
  const { message, history, context, userId = 'usr_demo_alex_chen' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const targetRole = context?.targetRole || 'Software Developer';
  const readiness = context?.readinessScore || 78;
  const missingSkills = (context?.missingSkills || []).join(', ') || 'Docker, Redis caching, Unit testing';
  const userSkills = (context?.userSkills || []).join(', ') || 'JavaScript, React, Node.js, SQL, Git';

  let replyText = '';
  let responseMode = 'gemini_api';

  // If Gemini API client is available and API key is configured, invoke Gemini with 20s timeout
  if (aiClient && apiKey) {
    try {
      const systemInstruction = `You are the expert AI Career Guidance Advisor for an engineering student.
Student Context:
- Target Career Role: ${targetRole}
- Employability Readiness Score: ${readiness}%
- Current Technical Skills: ${userSkills}
- Priority Skill Gaps to Bridge: ${missingSkills}

Core Guidelines:
1. Provide personalized, highly actionable, encouraging, and deeply technical career advice tailored specifically to the user's target role (${targetRole}) and the current query.
2. Directly answer whatever the user asks with concrete details, code architecture, algorithm explanations, or industry best practices.
3. Never repeat back the user's prompt as the answer.
4. Format responses cleanly with markdown headings (###), structured bullet points, and code snippets where appropriate.
5. Reference platform modules when relevant (e.g. /roadmap for 5-phase career progression, /skills for gap matrix, /evidence for GitHub artifact verification, /interview for mock interview practice, /resume for ATS feedback).`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.content && (item.role === 'user' || item.role === 'assistant')) {
            contents.push({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 20s')), 20000)
      );

      const geminiCall = aiClient.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const geminiResponse = await Promise.race([geminiCall, timeoutPromise]);
      const reply = geminiResponse.text;
      if (reply && reply.trim()) {
        replyText = reply.trim();
        responseMode = 'gemini_api';
      }
    } catch (err: any) {
      console.warn('[Chat] Gemini API call exception, switching to intelligent advisor fallback:', err?.message || err);
    }
  }

  // Fallback to dynamic career intelligence if Gemini was unavailable or timed out
  if (!replyText) {
    replyText = buildIntelligentFallback(message, context, history || []);
    responseMode = 'career_intelligence_engine';
  }

  // Persist conversation turn into MongoDB Atlas chat_history
  mongoAppendChatTurn(userId, message, replyText, responseMode).catch((err) => {
    console.warn('[Chat] Background MongoDB chat persistence notice:', err?.message || err);
  });

  return res.json({
    reply: replyText,
    mode: responseMode,
    model: responseMode === 'gemini_api' ? modelName : undefined,
  });
});

// Mount Vite or serve static assets
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Always bind to port 3000 in accordance with AI Studio environment constraints
  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Guidance App running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
