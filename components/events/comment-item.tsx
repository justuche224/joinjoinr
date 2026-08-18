"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleCommentLike, deleteComment, getCommentReplies } from "@/actions/social";
import { usePathname } from "next/navigation";
import { CommentInput } from "./comment-input";

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

interface CommentItemProps {
  comment: CommentType;
  currentUserId?: string;
  hasLikedInit: boolean;
  onRequireAuth: () => void;
}

export function CommentItem({ comment, currentUserId, hasLikedInit, onRequireAuth }: CommentItemProps) {
  const pathname = usePathname();
  const [hasLiked, setHasLiked] = useState(hasLikedInit);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isDeleted, setIsDeleted] = useState(comment.isDeleted);

  const handleLike = async () => {
    if (!currentUserId) {
      onRequireAuth();
      return;
    }
    
    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    setLikeCount((prev) => (newHasLiked ? prev + 1 : prev - 1));

    try {
      await toggleCommentLike(comment.id, pathname);
    } catch (err) {
      setHasLiked(!newHasLiked);
      setLikeCount((prev) => (!newHasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleReplyClick = () => {
    if (!currentUserId) {
      onRequireAuth();
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(comment.id, pathname);
      setIsDeleted(true);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    
    setLoadingReplies(true);
    try {
      const data = await getCommentReplies(comment.id);
      setReplies(data as any);
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const isAuthor = currentUserId === comment.userId;

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          {comment.author?.image ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.author.image} alt={comment.author.name} className="size-full rounded-full object-cover" />
          ) : (
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {comment.author?.name?.charAt(0) || "U"}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">
                {comment.author?.name || "Unknown User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {isAuthor && !isDeleted && (
              <Button variant="ghost" size="icon-xs" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>

          <div className="text-sm text-foreground/90">
            {isDeleted ? (
              <span className="italic text-muted-foreground">[This comment was deleted]</span>
            ) : (
              <p className="whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          {!isDeleted && (
            <div className="mt-1 flex items-center gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${hasLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Heart className={`size-3.5 ${hasLiked ? "fill-current" : ""}`} />
                <span>{likeCount > 0 && likeCount}</span>
              </button>
              
              {!comment.parentId && (
                <button 
                  onClick={handleReplyClick}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Reply</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isReplying && !isDeleted && (
        <div className="ml-11 mt-2">
          <CommentInput 
            eventId={comment.eventId} 
            parentId={comment.id} 
            onCancel={() => setIsReplying(false)}
            onSuccess={() => {
              setIsReplying(false);
              loadReplies();
              if (!showReplies) setShowReplies(true);
            }}
            autoFocus
          />
        </div>
      )}

      {comment.replyCount > 0 && !comment.parentId && (
        <div className="ml-11 mt-1">
          <button 
            onClick={loadReplies}
            className="text-xs font-medium text-primary hover:underline"
          >
            {showReplies ? "Hide replies" : `View ${comment.replyCount} repl${comment.replyCount === 1 ? 'y' : 'ies'}`}
          </button>
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className="ml-11 mt-2 flex flex-col gap-1 border-l-2 border-border/40 pl-3">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              currentUserId={currentUserId} 
              hasLikedInit={false} // Ideally we'd pass a Map or Set of liked ids
              onRequireAuth={onRequireAuth} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
