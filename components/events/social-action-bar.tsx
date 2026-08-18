"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleEventLike, shareEvent } from "@/actions/social";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";

interface SocialActionBarProps {
  eventId: string;
  initialLikeCount: number;
  initialShareCount: number;
  initialCommentCount: number;
  hasLiked: boolean;
  isAuthenticated: boolean;
}

export function SocialActionBar({
  eventId,
  initialLikeCount,
  initialShareCount,
  initialCommentCount,
  hasLiked: initialHasLiked,
  isAuthenticated,
}: SocialActionBarProps) {
  const pathname = usePathname();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const handleLike = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Please log in to like this event.");
      setIsAuthModalOpen(true);
      return;
    }

    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    setLikeCount((prev) => (newHasLiked ? prev + 1 : prev - 1));

    try {
      await toggleEventLike(eventId, pathname);
    } catch (err) {
      // Revert on error
      setHasLiked(!newHasLiked);
      setLikeCount((prev) => (!newHasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      setAuthMessage("Please log in to share this event.");
      setIsAuthModalOpen(true);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this event!",
          url: window.location.href,
        });
        setShareCount((prev) => prev + 1);
        await shareEvent(eventId, "native", pathname);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
      setShareCount((prev) => prev + 1);
      await shareEvent(eventId, "clipboard", pathname);
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      setAuthMessage("Please log in to comment.");
      setIsAuthModalOpen(true);
      return;
    }
    // Scroll to comments section
    document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="flex items-center gap-4 py-4 border-y border-border/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
          onClick={handleLike}
        >
          <Heart className={`size-5 ${hasLiked ? "fill-current" : ""}`} />
          <span>{likeCount > 0 ? likeCount : "Like"}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground"
          onClick={handleCommentClick}
        >
          <MessageCircle className="size-5" />
          <span>{initialCommentCount > 0 ? initialCommentCount : "Comment"}</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground ml-auto"
          onClick={handleShare}
        >
          <Share2 className="size-5" />
          <span>{shareCount > 0 ? shareCount : "Share"}</span>
        </Button>
      </div>

      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
        message={authMessage} 
      />
    </>
  );
}
