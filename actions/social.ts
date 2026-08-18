"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, sql, desc, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { event, comment, like, eventShare, user as userTable } from "@/db/schema";

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function toggleEventLike(eventId: string, path: string) {
  const user = await requireAuth();

  const [existingLike] = await db
    .select()
    .from(like)
    .where(
      and(
        eq(like.userId, user.id),
        eq(like.targetType, "event"),
        eq(like.targetId, eventId)
      )
    )
    .limit(1);

  if (existingLike) {
    await db.delete(like).where(eq(like.id, existingLike.id));
    await db
      .update(event)
      .set({ likeCount: sql`${event.likeCount} - 1` })
      .where(eq(event.id, eventId));
  } else {
    await db.insert(like).values({
      id: crypto.randomUUID(),
      userId: user.id,
      targetType: "event",
      targetId: eventId,
    });
    await db
      .update(event)
      .set({ likeCount: sql`${event.likeCount} + 1` })
      .where(eq(event.id, eventId));
  }

  revalidatePath(path);
}

export async function shareEvent(eventId: string, platform: string, path: string) {
  const user = await requireAuth();

  await db.insert(eventShare).values({
    id: crypto.randomUUID(),
    eventId,
    userId: user.id,
    platform,
  });

  await db
    .update(event)
    .set({ shareCount: sql`${event.shareCount} + 1` })
    .where(eq(event.id, eventId));

  revalidatePath(path);
}

export async function addComment(eventId: string, content: string, path: string, parentId?: string) {
  const user = await requireAuth();
  const commentId = crypto.randomUUID();

  await db.insert(comment).values({
    id: commentId,
    eventId,
    userId: user.id,
    content,
    parentId: parentId || null,
  });

  if (parentId) {
    await db
      .update(comment)
      .set({ replyCount: sql`${comment.replyCount} + 1` })
      .where(eq(comment.id, parentId));
  } else {
    await db
      .update(event)
      .set({ commentCount: sql`${event.commentCount} + 1` })
      .where(eq(event.id, eventId));
  }

  revalidatePath(path);
  return commentId;
}

export async function toggleCommentLike(commentId: string, path: string) {
  const user = await requireAuth();

  const [existingLike] = await db
    .select()
    .from(like)
    .where(
      and(
        eq(like.userId, user.id),
        eq(like.targetType, "comment"),
        eq(like.targetId, commentId)
      )
    )
    .limit(1);

  if (existingLike) {
    await db.delete(like).where(eq(like.id, existingLike.id));
    await db
      .update(comment)
      .set({ likeCount: sql`${comment.likeCount} - 1` })
      .where(eq(comment.id, commentId));
  } else {
    await db.insert(like).values({
      id: crypto.randomUUID(),
      userId: user.id,
      targetType: "comment",
      targetId: commentId,
    });
    await db
      .update(comment)
      .set({ likeCount: sql`${comment.likeCount} + 1` })
      .where(eq(comment.id, commentId));
  }

  revalidatePath(path);
}

export async function deleteComment(commentId: string, path: string) {
  const user = await requireAuth();

  const [targetComment] = await db
    .select()
    .from(comment)
    .where(eq(comment.id, commentId))
    .limit(1);

  if (!targetComment) throw new Error("Comment not found");
  if (targetComment.userId !== user.id && user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(comment)
    .set({ isDeleted: true })
    .where(eq(comment.id, commentId));

  revalidatePath(path);
}

export async function getEventComments(eventId: string) {
  const rows = await db
    .select({
      comment: comment,
      author: userTable,
    })
    .from(comment)
    .leftJoin(userTable, eq(comment.userId, userTable.id))
    .where(
      and(
        eq(comment.eventId, eventId),
        isNull(comment.parentId)
      )
    )
    .orderBy(desc(comment.createdAt));

  return rows.map((row) => ({
    ...row.comment,
    author: row.author,
  }));
}

export async function getCommentReplies(commentId: string) {
  const rows = await db
    .select({
      comment: comment,
      author: userTable,
    })
    .from(comment)
    .leftJoin(userTable, eq(comment.userId, userTable.id))
    .where(eq(comment.parentId, commentId))
    .orderBy(desc(comment.createdAt));

  return rows.map((row) => ({
    ...row.comment,
    author: row.author,
  }));
}

export async function getUserEventSocialState(eventId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) return { hasLiked: false, likedCommentIds: [] };

  const userId = session.user.id;

  const [eventLike] = await db
    .select()
    .from(like)
    .where(
      and(
        eq(like.userId, userId),
        eq(like.targetType, "event"),
        eq(like.targetId, eventId)
      )
    )
    .limit(1);

  const commentLikes = await db
    .select()
    .from(like)
    .where(
      and(
        eq(like.userId, userId),
        eq(like.targetType, "comment")
      )
    );

  return {
    hasLiked: !!eventLike,
    likedCommentIds: commentLikes.map(l => l.targetId),
  };
}
