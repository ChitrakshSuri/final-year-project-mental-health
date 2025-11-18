"use client";

import Vapi from "@vapi-ai/web";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

export default function Agent({
  userName,
  userId,
  sessionId,
  insightId,
  prompts,
}: {
  userName: string;
  userId?: string;
  sessionId?: string;
  insightId?: string;
  prompts?: string[];
  type?: string;
}) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || "");
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);
      toast.success("Connected! You can start speaking.");
    });

    vapi.on("call-end", () => {
      setConnected(false);
      setConnecting(false);
      handleCallEnd();
    });

    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        transcriptRef.current.push({
          role: message.role,
          content: message.transcript,
        });
      }
    });

    vapi.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setConnected(false);
      setConnecting(false);
      toast.error("Connection error. Please try again.");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const handleCallEnd = async () => {
    const transcript = transcriptRef.current;

    if (transcript.length === 0) {
      toast.error("No conversation recorded");
      return;
    }

    try {
      const { createInsight } = await import("@/lib/actions/general.action");

      toast.info("Generating session insights...");

      await createInsight({
        sessionId: sessionId!,
        userId: userId!,
        transcript,
        insightId,
      });

      toast.success("Session insights generated!");
      router.push(`/session/${sessionId}/insights`);
    } catch (error) {
      console.error("Error processing session:", error);
      toast.error("Something went wrong");
    }
  };

  const startCall = async () => {
    if (!vapiRef.current) return;

    setConnecting(true);

    try {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_THERAPIST_ASSISTANT_ID;

      if (!assistantId) {
        throw new Error("Therapist assistant not configured");
      }

      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error("Failed to start call:", error);
      setConnecting(false);
      toast.error("Failed to connect. Please try again.");
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      toast.info("Processing session...");
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!muted);
      setMuted(!muted);
      toast.info(muted ? "Microphone unmuted" : "Microphone muted");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* AI Avatar */}
      <div className="relative">
        <img
          src="/ai-avatar.png"
          alt="Dr. Sarah - AI Therapist"
          className={`w-32 h-32 rounded-full ${
            connected ? "ring-4 ring-primary animate-pulse" : ""
          }`}
        />
        {connected && (
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
            <Mic className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Dr. Sarah - Your AI Therapist
        </h2>
        {connecting && <p className="text-light-400">Connecting...</p>}
        {connected && (
          <p className="text-green-500 font-semibold">
            Session in progress - Speak freely
          </p>
        )}
        {!connected && !connecting && (
          <p className="text-light-400">
            Click below to start your therapy session
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!connected && !connecting && (
          <Button onClick={startCall} className="btn-primary gap-2" size="lg">
            <Phone className="w-5 h-5" />
            Start Session
          </Button>
        )}

        {connecting && (
          <Button disabled className="btn-primary gap-2" size="lg">
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting...
          </Button>
        )}

        {connected && (
          <>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {muted ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Mute
                </>
              )}
            </Button>

            <Button
              onClick={endCall}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Session
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!connected && !connecting && (
        <div className="bg-dark-400 rounded-lg p-4 max-w-md text-center">
          <p className="text-sm text-light-400">
            This is a safe, confidential space. Speak naturally about whatever
            is on your mind. Dr. Sarah will listen and guide the conversation
            based on your needs.
          </p>
        </div>
      )}
    </div>
  );
}
