import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionById, getInsightBySessionId } from "@/lib/actions/general.action";
import { ArrowLeft, Brain, Heart, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";

interface InsightsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InsightsPage({ params }: InsightsPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/sign-in");
  }

  const userId = sessionCookie.value;

  try {
    const session = await getSessionById(id);

    if (!session) {
      redirect("/");
    }

    if (session.userId !== userId) {
      redirect("/");
    }

    // Fetch insights for this session
    const insight = await getInsightBySessionId({
      sessionId: id,
      userId: userId,
    });

    if (!insight) {
      return (
        <div className="root-layout">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">No Insights Available</h1>
            <p className="text-light-400 mb-6">
              Insights are generated after you complete a therapy session.
            </p>
            <Link href={`/session/${id}`} className="btn-primary">
              Back to Session
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="root-layout">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-light-400 hover:text-light-100 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Session Insights</h1>
            <p className="text-light-400">
              AI-generated insights from your therapy session
            </p>
          </div>

          {/* Session Details Card */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-light-400 text-sm">Focus Area:</span>
                <p className="text-light-100 font-medium">{session.focusArea}</p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Session Type:</span>
                <p className="text-light-100 font-medium">{session.sessionType}</p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Approach:</span>
                <p className="text-light-100 font-medium">
                  {session.therapyApproach}
                </p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Date:</span>
                <p className="text-light-100 font-medium">
                  {new Date(insight.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Emotional State Card */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Emotional State</h2>
            </div>
            <p className="text-light-100 mb-4">{insight.emotionalState}</p>
            
            {/* Mood Score */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-light-400 text-sm">Wellbeing Score</span>
                <span className="text-light-100 font-semibold">
                  {insight.moodScore}/100
                </span>
              </div>
              <div className="w-full bg-dark-400 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    insight.moodScore >= 70
                      ? "bg-green-500"
                      : insight.moodScore >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${insight.moodScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Themes */}
          {insight.keyThemes && insight.keyThemes.length > 0 && (
            <div className="bg-dark-300 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Key Themes Discussed</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.keyThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="bg-dark-400 text-light-100 px-4 py-2 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Coping Strategies */}
          {insight.copingStrategies && insight.copingStrategies.length > 0 && (
            <div className="bg-dark-300 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Coping Strategies Identified</h2>
              </div>
              <ul className="space-y-3">
                {insight.copingStrategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-light-100">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Recommended Actions</h2>
            </div>
            <ul className="space-y-3">
              {insight.recommendedActions.map((action, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 bg-dark-400 p-4 rounded-lg"
                >
                  <span className="text-primary font-semibold text-lg">
                    {index + 1}.
                  </span>
                  <span className="text-light-100">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Final Assessment */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
            <p className="text-light-100 leading-relaxed">
              {insight.finalAssessment}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <h3 className="text-yellow-500 font-semibold mb-2">
              ⚠️ Important Reminder
            </h3>
            <p className="text-sm text-light-100">
              These insights are AI-generated observations and suggestions, not
              professional medical advice or diagnosis. If you're experiencing a
              mental health crisis or need professional support, please contact:{" "}
              <strong>022-27546669</strong> (AASRA - 24/7),{" "}
              <strong>1-800-891-4416</strong> (Tele-MANAS), or{" "}
              <strong>112</strong> (Emergency Services).
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading insights:", error);
    return (
      <div className="root-layout">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Error Loading Insights
          </h1>
          <p className="text-light-400 mb-6">{String(error)}</p>
          <Link href="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}