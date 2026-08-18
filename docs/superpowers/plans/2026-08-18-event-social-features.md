# Event Social Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the database schema for event comments (with unlimited-depth nested replies), polymorphic likes (event/comment/reply), and event shares, per the approved design spec.

**Architecture:** Three new tables (`comment`, `like`, `eventShare`) plus three new denormalized counter columns on `event`, all added to the existing single-file `db/schema.ts`, following the file's existing conventions exactly (text PKs, `createdAt`/`updatedAt`, per-FK indexes, relations centralized in the `defineRelations` call). A migration is generated with `drizzle-kit generate` and applied to the dev database, then verified with a one-off smoke script (this repo has no persisted test framework — see Global Constraints).

**Tech Stack:** Drizzle ORM (`drizzle-orm@1.0.0-rc.4`, `drizzle-kit@1.0.0-rc.4`), PostgreSQL, Bun.

**Spec:** [docs/superpowers/specs/2026-08-18-event-social-features-design.md](../specs/2026-08-18-event-social-features-design.md)

## Global Constraints

- IDs are generated app-side with `crypto.randomUUID()` (see `actions/admin.ts`, `actions/payment.ts`) — every new table's `id` column is `text().primaryKey()`, matching every existing table. No `uuid` column type, no DB-generated defaults for IDs.
- Every FK column gets an `index(...)` named `<table>_<column>_idx`, exactly matching the naming already used for `session_userId_idx`, `ticket_orderId_idx`, etc.
- Relations are declared once, centrally, inside the single `defineRelations(...)` call at the bottom of `db/schema.ts` — never a scattered per-table `relations()` call.
- This repo has **no test framework** (no test runner in `package.json`, no `*.test.ts` files anywhere). Verification for this plan is: (1) `bunx tsc --noEmit` for type correctness, (2) manual review of the generated SQL migration, (3) a one-off `tsx` smoke script run against the dev database and then deleted — not committed, since there's no test suite to house it in.
- `db.insert(table).values({...})` is the standard write pattern (see `actions/admin.ts`), imported via `import { db } from "@/lib/db"` and `import { event, comment, ... } from "@/db/schema"`.

---

### Task 1: Extend `db/schema.ts` with the new tables, columns, and relations

**Files:**
- Modify: `db/schema.ts`

**Interfaces:**
- Produces: `comment`, `like`, `eventShare` pgTable exports; `event.commentCount`/`event.likeCount`/`event.shareCount` columns; relation entries `comment.event`, `comment.author`, `comment.parent`, `comment.replies`, `like.user`, `eventShare.event`, `eventShare.user`, plus `user.comments`/`user.likes`/`user.shares` and `event.comments`/`event.shares`. These names are what any later API/action code will import and call — do not rename them.

- [ ] **Step 1: Update the pg-core import to add `uniqueIndex` and the `AnyPgColumn` type**

In `db/schema.ts:2`, replace:

```ts
import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";
```

with:

```ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  integer,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
```

(`AnyPgColumn` is needed to type the `comment` table's self-referencing `parentId` column in Step 3 — Drizzle requires an explicit return type on self-referencing FK callbacks to break the circular type inference.)

- [ ] **Step 2: Add the three counter columns to the `event` table**

In `db/schema.ts:77-92`, the `event` table currently ends with:

```ts
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
```

Insert the new columns between `description` and `createdAt`:

```ts
  description: text("description").notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
```

- [ ] **Step 3: Add the `comment`, `like`, and `eventShare` tables**

Insert this block after the `ticket` table's closing `);` (`db/schema.ts:187`) and before `export const relations = defineRelations(`:

```ts
export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    // No onDelete cascade here on purpose: user-initiated deletion goes
    // through isDeleted (soft delete) so replies keep a valid parent.
    // A real DELETE of a comment with children is blocked (default
    // "no action"), not silently cascaded through the whole subthread.
    parentId: text("parent_id").references((): AnyPgColumn => comment.id),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    replyCount: integer("reply_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("comment_eventId_idx").on(table.eventId),
    index("comment_parentId_idx").on(table.parentId),
    index("comment_userId_idx").on(table.userId),
  ],
);

export const like = pgTable(
  "like",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["event", "comment"] }).notNull(),
    // No DB-level FK: targetId points at event.id or comment.id depending
    // on targetType. Referential integrity is enforced in application code.
    targetId: text("target_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("like_userId_targetType_targetId_idx").on(
      table.userId,
      table.targetType,
      table.targetId,
    ),
    index("like_targetType_targetId_idx").on(table.targetType, table.targetId),
  ],
);

export const eventShare = pgTable(
  "event_share",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("eventShare_eventId_idx").on(table.eventId),
    index("eventShare_userId_idx").on(table.userId),
  ],
);
```

- [ ] **Step 4: Register the new tables in `defineRelations` and add the relation entries**

In `db/schema.ts`, the `defineRelations` call currently starts with:

```ts
export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    event,
    eventSession,
    ticketTier,
    order,
    ticket,
  },
```

Replace the table list with:

```ts
export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    event,
    eventSession,
    ticketTier,
    order,
    ticket,
    comment,
    like,
    eventShare,
  },
```

Then, inside the `(r) => ({ ... })` callback, extend the existing `user` block from:

```ts
    user: {
      sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
      accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
      orders: r.many.order({ from: r.user.id, to: r.order.userId }),
      tickets: r.many.ticket({ from: r.user.id, to: r.ticket.userId }),
    },
```

to:

```ts
    user: {
      sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
      accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
      orders: r.many.order({ from: r.user.id, to: r.order.userId }),
      tickets: r.many.ticket({ from: r.user.id, to: r.ticket.userId }),
      comments: r.many.comment({ from: r.user.id, to: r.comment.userId }),
      likes: r.many.like({ from: r.user.id, to: r.like.userId }),
      shares: r.many.eventShare({ from: r.user.id, to: r.eventShare.userId }),
    },
```

Extend the existing `event` block from:

```ts
    event: {
      sessions: r.many.eventSession({
        from: r.event.id,
        to: r.eventSession.eventId,
      }),
    },
```

to:

```ts
    event: {
      sessions: r.many.eventSession({
        from: r.event.id,
        to: r.eventSession.eventId,
      }),
      comments: r.many.comment({ from: r.event.id, to: r.comment.eventId }),
      shares: r.many.eventShare({ from: r.event.id, to: r.eventShare.eventId }),
    },
```

Finally, add three new blocks at the end of the `(r) => ({ ... })` object, after the existing `ticket: { ... }` block (before the closing `}),`):

```ts
    comment: {
      event: r.one.event({
        from: r.comment.eventId,
        to: r.event.id,
        optional: false,
      }),
      author: r.one.user({
        from: r.comment.userId,
        to: r.user.id,
        optional: true,
      }),
      parent: r.one.comment({
        from: r.comment.parentId,
        to: r.comment.id,
        optional: true,
      }),
      replies: r.many.comment({
        from: r.comment.id,
        to: r.comment.parentId,
      }),
    },
    like: {
      user: r.one.user({
        from: r.like.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    eventShare: {
      event: r.one.event({
        from: r.eventShare.eventId,
        to: r.event.id,
        optional: false,
      }),
      user: r.one.user({
        from: r.eventShare.userId,
        to: r.user.id,
        optional: false,
      }),
    },
```

- [ ] **Step 5: Type-check**

Run: `bunx tsc --noEmit`

Expected: no errors. If the self-referencing `comment.parent` / `comment.replies` relation pair errors, the likely fix is adding an explicit type annotation on the relation callback the same way Step 1 did for the column (`AnyPgColumn`) — Drizzle's relations API sometimes needs the same circular-reference hint relations-side. Resolve any error before moving on; do not proceed with a red type-check.

- [ ] **Step 6: Commit**

```bash
git add db/schema.ts
git commit -m "feat(db): add comment, like, and eventShare tables for event social features"
```

---

### Task 2: Generate and review the Drizzle migration

**Files:**
- Create: `db/drizzle/<timestamp>_<generated_name>.sql` (name chosen by drizzle-kit)
- Create/Modify: `db/drizzle/meta/_journal.json`, `db/drizzle/meta/<snapshot>.json` (drizzle-kit's own bookkeeping)

**Interfaces:**
- Consumes: the schema from Task 1 (`comment`, `like`, `eventShare`, `event`'s new columns).
- Produces: a migration file that Task 3 applies to the dev database.

- [ ] **Step 1: Generate the migration**

Run: `bun run db:generate`

Expected: drizzle-kit reports 3 new tables created (`comment`, `like`, `event_share`) and 3 columns added to `event`, and writes a new `.sql` file under `db/drizzle/`.

- [ ] **Step 2: Review the generated SQL**

Open the newly created `db/drizzle/<timestamp>_*.sql` file and confirm it contains, at minimum:
- `CREATE TABLE "comment" (...)` with `parent_id` referencing `comment(id)` (no `ON DELETE CASCADE` on that FK), `event_id` referencing `event(id)` `ON DELETE CASCADE`, `user_id` referencing `user(id)` `ON DELETE SET NULL`.
- `CREATE TABLE "like" (...)` with a `UNIQUE` constraint/index on `(user_id, target_type, target_id)` and `user_id` referencing `user(id)` `ON DELETE CASCADE`. No FK on `target_id`.
- `CREATE TABLE "event_share" (...)` with `event_id` and `user_id` both `ON DELETE CASCADE`.
- `ALTER TABLE "event" ADD COLUMN "comment_count" ... DEFAULT 0 NOT NULL` (and the same for `like_count`, `share_count`).

If any of these don't match, fix the schema in Task 1 (not the generated SQL by hand) and re-run `bun run db:generate`, deleting the incorrect migration file first.

- [ ] **Step 3: Commit**

```bash
git add db/drizzle
git commit -m "chore(db): generate migration for event social features tables"
```

---

### Task 3: Apply the migration and smoke-test against the dev database

**Files:**
- Create (temporary, not committed): `db/scratch-social-smoke.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`; `event`, `comment`, `like`, `eventShare`, `user` from `@/db/schema`.
- Produces: nothing persisted — this task only verifies Task 1/2's schema behaves as designed.

- [ ] **Step 1: Apply the migration**

Run: `bun run db:migrate`

Expected: exits 0, no errors. If it fails, do not proceed — the schema or migration has a bug that needs fixing in Task 1/2 first.

- [ ] **Step 2: Write the smoke script**

Create `db/scratch-social-smoke.ts`:

```ts
import "dotenv/config";
import { db } from "../lib/db";
import { user, event, comment, like, eventShare } from "./schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const userId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  await db.insert(user).values({
    id: userId,
    name: "Smoke Test User",
    email: `smoke-${userId}@example.com`,
    emailVerified: true,
  });

  await db.insert(event).values({
    id: eventId,
    slug: `smoke-test-${eventId}`,
    category: "test",
    title: "Smoke Test Event",
    venue: "Test Venue",
    city: "Test City",
    address: "1 Test St",
    image: "https://example.com/img.png",
    imageAlt: "test",
    description: "test",
  });

  // Top-level comment
  const topCommentId = crypto.randomUUID();
  await db.insert(comment).values({
    id: topCommentId,
    eventId,
    userId,
    content: "Top-level comment",
  });

  // Nested reply (reply to the reply, to prove unlimited depth)
  const replyId = crypto.randomUUID();
  await db.insert(comment).values({
    id: replyId,
    eventId,
    parentId: topCommentId,
    userId,
    content: "First reply",
  });
  const nestedReplyId = crypto.randomUUID();
  await db.insert(comment).values({
    id: nestedReplyId,
    eventId,
    parentId: replyId,
    userId,
    content: "Reply to the reply",
  });

  // Like the event and a comment
  await db.insert(like).values({
    id: crypto.randomUUID(),
    userId,
    targetType: "event",
    targetId: eventId,
  });
  await db.insert(like).values({
    id: crypto.randomUUID(),
    userId,
    targetType: "comment",
    targetId: topCommentId,
  });

  // Duplicate like on the same target must be rejected by the unique index
  let duplicateRejected = false;
  try {
    await db.insert(like).values({
      id: crypto.randomUUID(),
      userId,
      targetType: "event",
      targetId: eventId,
    });
  } catch {
    duplicateRejected = true;
  }
  if (!duplicateRejected) {
    throw new Error("FAIL: duplicate like was not rejected by the unique index");
  }

  // Share
  await db.insert(eventShare).values({
    id: crypto.randomUUID(),
    eventId,
    userId,
    platform: "copy_link",
  });

  // Verify the nested reply is readable via the relational query API
  const fetchedEvent = await db.query.event.findFirst({
    where: eq(event.id, eventId),
    with: { comments: true, shares: true },
  });
  if (!fetchedEvent || fetchedEvent.comments.length !== 3) {
    throw new Error(
      `FAIL: expected 3 comments on event, got ${fetchedEvent?.comments.length}`,
    );
  }

  const fetchedNestedReply = await db.query.comment.findFirst({
    where: and(eq(comment.id, nestedReplyId)),
    with: { parent: true },
  });
  if (fetchedNestedReply?.parent?.id !== replyId) {
    throw new Error("FAIL: nested reply's parent did not resolve correctly");
  }

  console.log("All social schema smoke checks passed.");

  // Cleanup
  await db.delete(comment).where(eq(comment.eventId, eventId));
  await db.delete(like).where(eq(like.userId, userId));
  await db.delete(eventShare).where(eq(eventShare.eventId, eventId));
  await db.delete(event).where(eq(event.id, eventId));
  await db.delete(user).where(eq(user.id, userId));

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Run the smoke script**

Run: `bunx tsx db/scratch-social-smoke.ts`

Expected output: `All social schema smoke checks passed.` and exit code 0. If the duplicate-like check doesn't throw, the unique index from Task 1 Step 3 is missing or wrong — go fix it there, regenerate the migration (Task 2), and re-apply before retrying this step.

- [ ] **Step 4: Delete the scratch script**

```bash
rm db/scratch-social-smoke.ts
```

This file existed only to verify the schema against a real database; it isn't part of the codebase's (nonexistent) test suite, so it doesn't get committed.

- [ ] **Step 5: Confirm nothing else changed**

```bash
git status
```

Expected: clean (the scratch script is gone, everything else was already committed in Tasks 1 and 2).
