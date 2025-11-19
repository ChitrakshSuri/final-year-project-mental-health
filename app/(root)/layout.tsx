import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    redirect("/sign-in");
  }

  // Get current user (which decodes the session properly)
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Navbar isLoggedIn={true} userName={user?.name || "User"} />
      <div className="pt-20">{children}</div>
    </>
  );
}