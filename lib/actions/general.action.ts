"use server";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";


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