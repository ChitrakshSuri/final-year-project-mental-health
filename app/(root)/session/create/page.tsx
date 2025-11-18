import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CreateSessionPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <h1 className="text-4xl font-bold mb-8">Create New Therapy Session</h1>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-lg text-light-100 mb-8">
          Welcome to your safe space. This AI companion is here to listen and provide supportive conversation.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-8">
          <h3 className="text-yellow-500 font-semibold mb-2">⚠️ Important Disclaimer</h3>
          <p className="text-sm text-light-100">
            This is NOT a replacement for professional mental health care. If you're in crisis:
          </p>
          <ul className="list-disc list-inside text-sm text-light-100 mt-2">
            <li><strong>Call 988</strong> - Suicide & Crisis Lifeline</li>
            <li><strong>Text HOME to 741741</strong> - Crisis Text Line</li>
            <li><strong>Call 911</strong> - For immediate emergencies</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-light-100 mb-4">Session creation form coming soon...</p>
        </div>
      </div>
    </div>
  );
}