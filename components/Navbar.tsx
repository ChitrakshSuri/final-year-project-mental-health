"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  isLoggedIn: boolean;
  userName?: string;
}

export default function Navbar({ isLoggedIn, userName }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/sign-in");
        router.refresh();
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200 border-b border-light-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Lumira" className="w-8 h-8" />
            <span className="text-2xl font-bold">Lumira</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* User Name */}
                <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-light-100">{userName}</span>
                </div>

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button asChild variant="outline" size="sm">
                  <Link href="/sign-in">Login</Link>
                </Button>

                {/* Sign Up Button */}
                <Button asChild className="btn-primary" size="sm">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}