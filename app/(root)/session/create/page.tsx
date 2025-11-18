import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SessionForm from "@/components/SessionForm";

export default async function CreateSessionPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/sign-in");
  }

  // Get user ID from session
  const userId = session.value;

  return (
    <div className="root-layout">
      <h1 className="text-4xl font-bold mb-8">Create New Therapy Session</h1>

      <div className="max-w-2xl mx-auto">
        <p className="text-lg text-light-100 mb-8">
          Welcome to your safe space. This AI companion is here to listen and
          provide supportive conversation.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
          <h3 className="text-yellow-500 font-semibold mb-2">
            ⚠️ Important Disclaimer
          </h3>
          <p className="text-sm text-light-100">
            This is NOT a replacement for professional mental health care. If
            you're in crisis:
          </p>
          <ul className="list-disc list-inside text-sm text-light-100 mt-2">
            <li>
              <strong>Call 022-27546669</strong> - AASRA Foundation (24/7
              Helpline)
            </li>
            <li>
              <strong>Call 1-800-891-4416 / 14416</strong> - Tele-MANAS
              (National Mental Health Support)
            </li>
            <li>
              <strong>Call 112</strong> - For immediate emergencies (Police,
              Ambulance, etc.)
            </li>
          </ul>
        </div>

        <SessionForm userId={userId} />
      </div>
    </div>
  );
}
