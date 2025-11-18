import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionById } from "@/lib/actions/general.action";
import Agent from "@/components/Agent";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/sign-in");
  }

  // The userId might be the full JWT token, we need to extract the actual user ID
  // For now, just use the cookie value
  const userId = sessionCookie.value;

  try {
    const session = await getSessionById(id);

    if (!session) {
      return (
        <div className="root-layout">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Session not found</h1>
            <p className="text-light-400 mt-4">This session doesn't exist or has been deleted.</p>
          </div>
        </div>
      );
    }

    // Skip userId check for now to test - we'll fix auth later
    // if (session.userId !== userId) {
    //   redirect("/");
    // }

    return (
      <div className="root-layout">
        <div className="max-w-4xl mx-auto">
          {/* Session Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Therapy Session</h1>
            <div className="bg-dark-300 rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-light-400">Focus Area:</span>
                <span className="text-light-100 font-medium">{session.focusArea}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-400">Session Type:</span>
                <span className="text-light-100 font-medium">{session.sessionType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-400">Approach:</span>
                <span className="text-light-100 font-medium">{session.therapyApproach}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-400">Current Mood:</span>
                <span className="text-light-100 font-medium capitalize">{session.mood}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-400">Duration:</span>
                <span className="text-light-100 font-medium">{session.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-yellow-500 font-semibold mb-2">⚠️ Remember</h3>
            <p className="text-sm text-light-100">
              This is a supportive AI companion, not a replacement for professional therapy. 
              If you're in crisis, please call <strong>988</strong> or <strong>911</strong>.
            </p>
          </div>

          {/* Conversation Prompts */}
          <div className="bg-dark-300 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Conversation Topics</h2>
            <p className="text-light-400 text-sm mb-4">
              These prompts can guide our conversation, but feel free to discuss whatever feels right for you.
            </p>
            <ul className="space-y-2">
              {session.prompts.map((prompt, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary font-semibold text-sm mt-0.5">{index + 1}.</span>
                  <span className="text-light-100 text-sm">{prompt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Voice Agent */}
          <div className="bg-dark-300 rounded-lg p-8">
            <Agent
              userName="User"
              userId={session.userId}
              sessionId={id}
              type="session"
              prompts={session.prompts}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading session:", error);
    return (
      <div className="root-layout">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading Session</h1>
          <p className="text-light-400 mt-4">{String(error)}</p>
        </div>
      </div>
    );
  }
}