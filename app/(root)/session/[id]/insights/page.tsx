import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionById, getInsightBySessionId } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dayjs from "dayjs";

interface InsightsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionInsightsPage({ params }: InsightsPageProps) {
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

    const insight = await getInsightBySessionId({ sessionId: id, userId });

    if (!insight) {
      redirect(`/session/${id}`);
    }

    // Mood color based on score
    const getMoodColor = (score: number) => {
      if (score >= 70) return "text-green-500";
      if (score >= 40) return "text-yellow-500";
      return "text-red-500";
    };

    return (
      <div className="root-layout">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Session Insights</h1>
            <p className="text-light-400">
              {dayjs(insight.createdAt).format("MMMM D, YYYY [at] h:mm A")}
            </p>
          </div>

          {/* Session Details Card */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-light-400 text-sm">Focus Area</span>
                <p className="text-light-100 font-medium">{session.focusArea}</p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Session Type</span>
                <p className="text-light-100 font-medium">{session.sessionType}</p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Approach</span>
                <p className="text-light-100 font-medium">{session.therapyApproach}</p>
              </div>
              <div>
                <span className="text-light-400 text-sm">Initial Mood</span>
                <p className="text-light-100 font-medium capitalize">{session.mood}</p>
              </div>
            </div>
          </div>

          {/* Mood Score */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Emotional Wellbeing Score</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-dark-400"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(insight.moodScore / 100) * 352} 352`}
                    className={getMoodColor(insight.moodScore)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getMoodColor(insight.moodScore)}`}>
                    {insight.moodScore}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-light-100 text-lg mb-2">{insight.emotionalState}</p>
                <p className="text-light-400 text-sm">
                  Score range: 0 (very distressed) to 100 (very positive)
                </p>
              </div>
            </div>
          </div>

          {/* Key Themes */}
          {insight.keyThemes && insight.keyThemes.length > 0 && (
            <div className="bg-dark-300 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Key Themes Discussed</h2>
              <div className="flex flex-wrap gap-2">
                {insight.keyThemes.map((theme, index) => (
                  <span
                    key={index}
                    className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
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
              <h2 className="text-xl font-semibold mb-4">Coping Strategies Identified</h2>
              <ul className="space-y-2">
                {insight.copingStrategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary text-xl">•</span>
                    <span className="text-light-100">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
            <ul className="space-y-3">
              {insight.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-dark-100 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <span className="text-light-100">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Final Assessment */}
          <div className="bg-dark-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
            <p className="text-light-100 leading-relaxed">{insight.finalAssessment}</p>
          </div>

          {/* Important Reminder */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-6">
            <h3 className="text-yellow-500 font-semibold mb-2">💡 Remember</h3>
            <p className="text-sm text-light-100">
              These insights are observations from your conversation, not clinical diagnoses. 
              For ongoing mental health support, consider reaching out to a licensed therapist. 
              You deserve professional care.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild className="btn-primary flex-1">
              <Link href="/session/create">New Session</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading insights:", error);
    redirect("/");
  }
}