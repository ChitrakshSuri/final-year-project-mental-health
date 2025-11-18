// ===== MENTAL HEALTH SYSTEM TYPES =====

interface Session {
  id: string;
  userId: string;
  focusArea: string; // e.g., "Anxiety Management", "Depression Support", "Stress Management"
  sessionType: string; // e.g., "First Session", "Follow-up", "Crisis Support"
  therapyApproach: string; // e.g., "CBT", "DBT", "Mindfulness", "Supportive"
  mood: string; // e.g., "anxious", "depressed", "stressed", "neutral"
  duration: number; // session duration in minutes
  prompts: string[]; // therapy conversation prompts
  tags: string[]; // e.g., ["anxiety", "work-stress", "relationships"]
  finalized: boolean;
  createdAt: string;
}

interface Insight {
  id: string;
  sessionId: string;
  emotionalState: string; // e.g., "Moderate anxiety with underlying stress"
  moodScore: number; // 0-100
  keyThemes?: string[]; // e.g., ["work pressure", "sleep issues"]
  copingStrategies?: string[]; // e.g., ["Deep breathing", "Journaling"]
  recommendedActions: string[]; // e.g., ["Try 4-7-8 breathing", "Set work boundaries"]
  finalAssessment: string;
  createdAt: string;
}

interface CreateInsightParams {
  sessionId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  insightId?: string;
}

interface GetInsightBySessionIdParams {
  sessionId: string;
  userId: string;
}

interface SessionCardProps {
  sessionId?: string;
  userId?: string;
  focusArea: string;
  sessionType: string;
  therapyApproach: string;
  mood: string;
  createdAt?: string;
}

interface SessionFormProps {
  sessionId: string;
  focusArea: string;
  sessionType: string;
  therapyApproach: string;
  mood: string;
  duration: number;
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview" | "session";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}





interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";



