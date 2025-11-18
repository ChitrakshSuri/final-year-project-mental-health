"use server";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}


// ===== MENTAL HEALTH SESSION ACTIONS =====

export async function getSessionsByUserId(userId: string) {
  try {
    const sessions = await db
      .collection("sessions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return sessions.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

export async function getLatestSessions({
  userId,
  limit = 10,
}: {
  userId: string;
  limit?: number;
}) {
  try {
    const sessions = await db
      .collection("sessions")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .orderBy("userId")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return sessions.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[];
  } catch (error) {
    console.error("Error fetching latest sessions:", error);
    throw error;
  }
}

export async function getSessionById(sessionId: string) {
  try {
    const session = await db.collection("sessions").doc(sessionId).get();

    if (!session.exists) {
      throw new Error("Session not found");
    }

    return {
      id: session.id,
      ...session.data(),
    } as Session;
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
}

export async function createInsight({
  sessionId,
  userId,
  transcript,
  insightId,
}: CreateInsightParams) {
  try {
    const session = await getSessionById(sessionId);

    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Format transcript for AI analysis
    const formattedTranscript = transcript
      .map((msg) => `${msg.role === "user" ? "Client" : "Therapist"}: ${msg.content}`)
      .join("\n");

    // Generate insight using Gemini AI (using the same SDK as createFeedback)
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: z.object({
        emotionalState: z.string(),
        moodScore: z.number(),
        keyThemes: z.array(z.string()),
        copingStrategies: z.array(z.string()),
        recommendedActions: z.array(z.string()),
        finalAssessment: z.string(),
      }),
      prompt: `You are a compassionate AI therapist analyzing a therapy session transcript. Provide supportive insights without diagnosing.

Transcript:
${formattedTranscript}

Analyze the session and provide insights in these areas:
- **Emotional State**: Overall emotional state observed (avoid clinical diagnoses)
- **Mood Score**: Rate emotional wellbeing from 0-100 (0=very distressed, 100=very positive)
- **Key Themes**: Main topics discussed (e.g., work stress, relationships, sleep)
- **Coping Strategies**: Healthy/unhealthy coping mechanisms mentioned
- **Recommended Actions**: 3-5 specific, actionable self-care suggestions
- **Final Assessment**: Supportive summary of the session

CRITICAL: 
- Never diagnose mental health conditions
- Frame everything as observations and suggestions
- Be empathetic and non-judgmental
- Focus on strengths and growth opportunities`,
      system: "You are a compassionate AI therapist providing supportive insights. Never diagnose. Focus on observations and actionable wellness suggestions.",
    });

    // Save insight to Firestore
    const insightRef = insightId
      ? db.collection("insights").doc(insightId)
      : db.collection("insights").doc();

    await insightRef.set({
      sessionId,
      ...object,
      createdAt: new Date().toISOString(),
    });

    // Mark session as finalized
    await db.collection("sessions").doc(sessionId).update({
      finalized: true,
    });

    return {
      id: insightRef.id,
      sessionId,
      ...object,
      createdAt: new Date().toISOString(),
    } as Insight;
  } catch (error) {
    console.error("Error creating insight:", error);
    throw error;
  }
}

export async function getInsightBySessionId({
  sessionId,
  userId,
}: GetInsightBySessionIdParams) {
  try {
    const session = await getSessionById(sessionId);

    if (session.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const insights = await db
      .collection("insights")
      .where("sessionId", "==", sessionId)
      .limit(1)
      .get();

    if (insights.empty) {
      return null;
    }

    const insight = insights.docs[0];
    return {
      id: insight.id,
      ...insight.data(),
    } as Insight;
  } catch (error) {
    console.error("Error fetching insight:", error);
    throw error;
  }
}

export async function createSession({
  userId,
  focusArea,
  sessionType,
  therapyApproach,
  mood,
  duration,
}: {
  userId: string;
  focusArea: string;
  sessionType: string;
  therapyApproach: string;
  mood: string;
  duration: number;
}) {
  try {
    // Generate therapy prompts using Gemini AI
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: z.object({
        prompts: z.array(z.string()),
        tags: z.array(z.string()),
      }),
      prompt: `You are a compassionate therapist preparing conversation prompts for a therapy session.

Session Details:
- Focus Area: ${focusArea}
- Session Type: ${sessionType}
- Therapy Approach: ${therapyApproach}
- Current Mood: ${mood}
- Duration: ${duration} minutes

Generate 5-8 thoughtful, open-ended prompts/questions for the therapist to explore during the session. These should:
- Be empathetic and non-judgmental
- Encourage self-reflection
- Be appropriate for the focus area and mood
- Follow the selected therapy approach (${therapyApproach})
- Be open-ended (avoid yes/no questions)

Also generate 3-5 relevant tags for this session (e.g., anxiety, work-stress, relationships).

Examples of good prompts:
- "Can you tell me more about what's been weighing on your mind lately?"
- "How have these feelings been affecting your daily life?"
- "What coping strategies have you tried so far?"`,
      system: "You are a professional therapist creating conversation prompts for a supportive therapy session.",
    });

    // Create session in Firestore
    const sessionRef = db.collection("sessions").doc();

    await sessionRef.set({
      userId,
      focusArea,
      sessionType,
      therapyApproach,
      mood,
      duration,
      prompts: object.prompts,
      tags: object.tags,
      finalized: false,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      sessionId: sessionRef.id,
    };
  } catch (error) {
    console.error("Error creating session:", error);
    return {
      success: false,
      error: "Failed to create session",
    };
  }
}