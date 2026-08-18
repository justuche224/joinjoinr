"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { addComment } from "@/actions/social";
import { usePathname } from "next/navigation";
import { SendHorizonal } from "lucide-react";

interface CommentInputProps {
  eventId: string;
  parentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export function CommentInput({ eventId, parentId, onCancel, onSuccess, autoFocus }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(eventId, content.trim(), pathname, parentId);
      setContent("");
      onSuccess?.();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      <div className="relative flex items-end w-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Add a comment..."}
          className="w-full min-h-[44px] max-h-32 resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-12"
          rows={1}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon"
          variant="ghost" 
          disabled={!content.trim() || isSubmitting}
          className="absolute right-1 bottom-1 size-9 text-muted-foreground hover:text-foreground"
        >
          <SendHorizonal className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      {onCancel && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
