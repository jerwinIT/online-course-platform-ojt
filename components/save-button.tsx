"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveCourse } from "@/server/actions/savedCourse";
import { toast } from "sonner";

interface SaveButtonProps {
  courseId: string;
  initialIsSaved: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function SaveButton({
  courseId,
  initialIsSaved,
  variant = "outline",
  size = "default",
  showText = true,
  className = "",
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = () => {
    startTransition(async () => {
      try {
        const result = await toggleSaveCourse(courseId);

        if (result.success) {
          const saved = result.isSaved ?? false;
          setIsSaved(saved);

          if (saved) {
            toast.success("Course saved!", {
              description: result.message,
            });
          } else {
            toast.info("Course removed", {
              description: result.message,
            });
          }
        } else {
          toast.error("Error", {
            description: result.error || "Failed to save course",
          });
        }
      } catch (err) {
        toast.error("Something went wrong", {
          description: "Please try again later.",
        });
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isPending}
      className={className}
    >
      <Heart
        className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""} ${
          showText ? "mr-2" : ""
        }`}
      />
      {showText && (isSaved ? "Saved" : "Save")}
    </Button>
  );
}
