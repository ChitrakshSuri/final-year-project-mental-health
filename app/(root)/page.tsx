import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionsByUserId } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dayjs from "dayjs";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/sign-in");
  }

  const userId = sessionCookie.value;

  // Fetch sessions
  let sessions: Session[] = [];
  try {
    sessions = (await getSessionsByUserId(userId)) || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    sessions = [];
  }

  return (
    <div className="root-layout">
      {/* Hero Section - Mental Health Focus */}
      <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl p-12 mb-12">
        <div className="flex items-center justify-between">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Your Safe Space for Mental Wellness
            </h1>
            <p className="text-xl text-light-100 mb-6">
              Connect with Dr. Sarah, your compassionate AI therapist. Have
              supportive conversations about anxiety, stress, relationships, and
              more.
            </p>
            <Button asChild size="lg" className="btn-primary">
              <Link href="/session/create">Start Therapy Session</Link>
            </Button>
          </div>
          <div className="hidden lg:block">
            <img
              src="/ai-avatar.png"
              alt="Dr. Sarah"
              className="w-64 h-64 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-12">
        <h3 className="text-yellow-500 font-semibold mb-2">
          ⚠️ Important Note
        </h3>
        <p className="text-sm text-light-100">
          This AI companion provides supportive conversations but is NOT a
          replacement for professional mental health care. If you're in crisis,
          please call <strong>022-27546669</strong> (AASRA Foundation - 24/7
          helpline), <strong>1-800-891-4416 / 14416</strong> (Tele-MANAS -
          National Mental Health Support), or <strong>112</strong> (Emergency
          Services).
        </p>
      </div>

      {/* Your Therapy Sessions */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Your Therapy Sessions</h2>
          <Button asChild variant="outline">
            <Link href="/session/create">New Session</Link>
          </Button>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={
                  session.finalized
                    ? `/session/${session.id}/insights`
                    : `/session/${session.id}`
                }
                className="bg-dark-300 rounded-lg p-6 hover:bg-dark-400 transition-colors border border-light-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {session.focusArea}
                    </h3>
                    <p className="text-sm text-light-400">
                      {session.sessionType} • {session.therapyApproach}
                    </p>
                  </div>
                  {session.finalized ? (
                    <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-semibold">
                      Completed
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-xs font-semibold">
                      In Progress
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-light-400">Mood:</span>
                    <span className="text-light-100 capitalize">
                      {session.mood}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-light-400">Duration:</span>
                    <span className="text-light-100">
                      {session.duration} minutes
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {session.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary/20 text-primary px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-light-400">
                  {dayjs(session.createdAt).format("MMM D, YYYY [at] h:mm A")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-dark-300 rounded-lg p-12 text-center">
            <img
              src="/robot.png"
              alt="No sessions"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold mb-2">
              No therapy sessions yet
            </h3>
            <p className="text-light-400 mb-6">
              Start your first session with Dr. Sarah to begin your mental
              wellness journey.
            </p>
            <Button asChild className="btn-primary">
              <Link href="/session/create">Start First Session</Link>
            </Button>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-dark-300 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Choose Your Focus</h3>
            <p className="text-sm text-light-400">
              Select what you want to talk about: anxiety, stress,
              relationships, or more.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Start Conversation</h3>
            <p className="text-sm text-light-400">
              Talk naturally with Dr. Sarah through voice. She listens and
              responds empathetically.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get Support</h3>
            <p className="text-sm text-light-400">
              Receive validation, coping strategies, and a safe space to express
              yourself.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">4</span>
            </div>
            <h3 className="font-semibold mb-2">Review Insights</h3>
            <p className="text-sm text-light-400">
              Get personalized insights, mood tracking, and actionable
              recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
