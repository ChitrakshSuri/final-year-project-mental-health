"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createSession } from "@/lib/actions/general.action";

const sessionSchema = z.object({
  focusArea: z.string().min(1, "Please select a focus area"),
  sessionType: z.string().min(1, "Please select a session type"),
  therapyApproach: z.string().min(1, "Please select a therapy approach"),
  mood: z.string().min(1, "Please select your current mood"),
  duration: z.string().min(1, "Please select session duration"),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export default function SessionForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      focusArea: "",
      sessionType: "",
      therapyApproach: "",
      mood: "",
      duration: "30",
    },
  });

const onSubmit = async (data: SessionFormData) => {
  setIsLoading(true);
  toast.info("Creating your session...");

  try {
    const result = await createSession({
      userId,
      focusArea: data.focusArea,
      sessionType: data.sessionType,
      therapyApproach: data.therapyApproach,
      mood: data.mood,
      duration: parseInt(data.duration),
    });

    if (result.success) {
      toast.success("Session created! Redirecting...");
      router.push(`/session/${result.sessionId}`);
    } else {
      toast.error("Failed to create session. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Focus Area */}
        <FormField
          control={form.control}
          name="focusArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What would you like to focus on today?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a focus area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Anxiety Management">Anxiety Management</SelectItem>
                  <SelectItem value="Depression Support">Depression Support</SelectItem>
                  <SelectItem value="Stress Management">Stress Management</SelectItem>
                  <SelectItem value="Relationship Issues">Relationship Issues</SelectItem>
                  <SelectItem value="Work-Life Balance">Work-Life Balance</SelectItem>
                  <SelectItem value="Sleep Issues">Sleep Issues</SelectItem>
                  <SelectItem value="Self-Esteem">Self-Esteem & Confidence</SelectItem>
                  <SelectItem value="Grief & Loss">Grief & Loss</SelectItem>
                  <SelectItem value="Life Transitions">Life Transitions</SelectItem>
                  <SelectItem value="General Support">General Emotional Support</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Session Type */}
        <FormField
          control={form.control}
          name="sessionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="First Session">First Session</SelectItem>
                  <SelectItem value="Follow-up">Follow-up Session</SelectItem>
                  <SelectItem value="Check-in">Quick Check-in</SelectItem>
                  <SelectItem value="Crisis Support">Crisis Support</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Therapy Approach */}
        <FormField
          control={form.control}
          name="therapyApproach"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Approach</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapy approach" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CBT">CBT (Cognitive Behavioral)</SelectItem>
                  <SelectItem value="DBT">DBT (Dialectical Behavioral)</SelectItem>
                  <SelectItem value="Mindfulness">Mindfulness-Based</SelectItem>
                  <SelectItem value="Supportive">Supportive Listening</SelectItem>
                  <SelectItem value="Solution-Focused">Solution-Focused</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Current Mood */}
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are you feeling right now?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current mood" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="anxious">Anxious</SelectItem>
                  <SelectItem value="depressed">Depressed</SelectItem>
                  <SelectItem value="stressed">Stressed</SelectItem>
                  <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="frustrated">Frustrated</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="hopeful">Hopeful</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Duration</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
          {isLoading ? "Creating Session..." : "Start Therapy Session"}
        </Button>
      </form>
    </Form>
  );
}