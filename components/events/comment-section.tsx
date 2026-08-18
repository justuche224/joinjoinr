"use client";

import React, { useState } from "react";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";
import { AuthModal } from "@/components/auth/auth-modal";

type CommentType = {
  id: string;
  eventId: string;
  parentId: string | null;
  userId: string | null;
  content: string;
  isDeleted: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
};

interface CommentSectionProps {
  eventId: string;
  initialComments: CommentType[];
  currentUserId?: string;
  likedCommentIds: string[];
}

export function CommentSection({ eventId, initialComments, currentUserId, likedCommentIds }: CommentSectionProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const handleRequireAuth = () => {
    setAuthMessage("Please log in to interact with comments.");
    setIsAuthModalOpen(true);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (!currentUserId) {
      e.preventDefault();
      handleRequireAuth();
    }
  };

  return (
    <div id="comments-section" className="flex flex-col gap-6 py-8">
      <h3 className="text-xl font-semibold tracking-tight">Comments</h3>
      
      <div className="flex gap-3" onClickCapture={handleInputClick}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted mt-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {currentUserId ? "Me" : "?"}
          </span>
        </div>
        <div className="flex-1">
           {currentUserId ? (
             <CommentInput eventId={eventId} />
           ) : (
             <div 
               className="w-full min-h-[44px] rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-muted-foreground cursor-pointer flex items-center"
               onClick={handleRequireAuth}
             >
               Add a comment...
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/30 mt-4">
        {initialComments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          initialComments.map((comment) => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              hasLikedInit={likedCommentIds.includes(comment.id)}
              onRequireAuth={handleRequireAuth}
            />
          ))
        )}
      </div>

      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
        message={authMessage} 
      />
    </div>
  );
}
