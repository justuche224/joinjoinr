# Event Social Features — Data Model Design

Date: 2026-08-18
Status: Approved (schema design only — no API/UI in scope)

## Purpose

Add a social layer to event pages: logged-in users can comment on an
event, reply to comments (nested, unlimited depth), like an event or
any comment/reply, and share an event (triggering the browser's native
share sheet). All four actions need counts surfaced back to the UI.

This spec covers the database schema only. API routes, server actions,
and UI are follow-up work.

## Conventions carried over from the existing schema

- Drizzle ORM, `pg-core`, `text` primary keys (IDs generated app-side,
  matching every existing table).
- `createdAt` (`defaultNow()`) / `updatedAt` (`$onUpdate`) on every
  table that isn't a pure log.
- An `index(...)` on every foreign key column, named
  `<table>_<column>_idx`.
- Relations declared centrally via `defineRelations` in
  [db/schema.ts](../../../db/schema.ts), not scattered `relations()` calls.

## Tables

### `comment`

Handles both top-level comments and nested replies on an event. A
reply is just a `comment` row whose `parentId` points at another
`comment` row — there is no separate "reply" table.

| column        | type                              | notes                                                                 |
|---------------|-----------------------------------|------------------------------------------------------------------------|
| `id`          | text, PK                          |                                                                        |
| `eventId`     | text, FK → `event.id`, cascade    | Denormalized onto every row (including deep replies) so the whole thread for an event is one flat query — no recursive CTE needed to render it. |
| `parentId`    | text, FK → `comment.id`, nullable | `null` = top-level comment. Set = this row is a reply to that comment/reply. Self-referential, unlimited nesting depth. |
| `userId`      | text, FK → `user.id`, nullable, `onDelete: set null` | Diverges from `session`/`order`/`ticket`, which cascade on user delete. Comments are shared, public thread content — deleting the author's account anonymizes the row (`userId` → null, UI shows e.g. "[deleted user]") instead of deleting the row, which would otherwise orphan any replies underneath it. |
| `content`     | text, not null                    |                                                                        |
| `isDeleted`   | boolean, default false            | Soft delete for user-initiated deletion. Content is blanked in the UI but the row stays so child replies keep a valid parent. |
| `likeCount`   | integer, default 0                | Denormalized count of `like` rows where `targetType = 'comment'` and `targetId = comment.id`. |
| `replyCount`  | integer, default 0                | Denormalized count of **direct children only** (rows with `parentId = comment.id`), not the whole subtree. |
| `createdAt`   | timestamp, `defaultNow()`         |                                                                        |
| `updatedAt`   | timestamp, `$onUpdate`            |                                                                        |

Indexes: `comment_eventId_idx`, `comment_parentId_idx`,
`comment_userId_idx`.

### `like`

Polymorphic — a single table covers likes on an event, a top-level
comment, or a reply (replies are just comments, so `targetType` never
needs a third value).

| column       | type                                    | notes |
|--------------|------------------------------------------|-------|
| `id`         | text, PK                                  |       |
| `userId`     | text, FK → `user.id`, cascade             |       |
| `targetType` | text enum: `"event" \| "comment"`         |       |
| `targetId`   | text, not null                            | No DB-level FK — it points at either `event.id` or `comment.id` depending on `targetType`. Referential integrity here is enforced app-side, not by Postgres. |
| `createdAt`  | timestamp, `defaultNow()`                 |       |

Indexes:
- Unique on `(userId, targetType, targetId)` — prevents a user from
  liking the same target twice, and doubles as the "did I like this"
  lookup.
- Non-unique on `(targetType, targetId)` — for recomputing a counter
  from scratch if it ever drifts.

### `eventShare`

One row per share action (the browser share sheet, or a fallback
"copy link" button).

| column      | type                                 | notes |
|-------------|----------------------------------------|-------|
| `id`        | text, PK                               |       |
| `eventId`   | text, FK → `event.id`, cascade         |       |
| `userId`    | text, FK → `user.id`, cascade          |       |
| `platform`  | text, nullable                         | Whatever `navigator.share()` reports, or a fallback label like `"copy_link"` when the Web Share API isn't available. |
| `createdAt` | timestamp, `defaultNow()`              |       |

Indexes: `eventShare_eventId_idx`, `eventShare_userId_idx`.

### `event` additions

Three new denormalized counter columns:

- `commentCount` (integer, default 0) — total comments **and**
  replies under the event.
- `likeCount` (integer, default 0)
- `shareCount` (integer, default 0)

## Counter maintenance

All counters (`event.commentCount/likeCount/shareCount`,
`comment.likeCount`, `comment.replyCount`) are maintained by the
application, in the same transaction as the write that changes them
(increment on create, decrement on delete/unlike). No DB triggers —
consistent with the rest of this schema, which has none.

## Relations

Add to the central `defineRelations` call:

- `event.comments` → many `comment` (`comment.eventId`)
- `event.shares` → many `eventShare` (`eventShare.eventId`)
- `comment.event` → one `event`
- `comment.author` → one `user` (optional, since `userId` is nullable)
- `comment.parent` → one `comment` (self, optional)
- `comment.replies` → many `comment` (self, via `parentId`)
- `like.user` → one `user`
- `eventShare.event` → one `event`
- `eventShare.user` → one `user`

`like.target` is **not** a Drizzle relation — polymorphic targets
aren't expressible as a single relation, so target resolution
(`event` vs `comment`) happens in application code based on
`targetType`.

## Known trade-offs (accepted, not oversights)

- **`like.targetId` has no DB-level FK.** Standard cost of a
  polymorphic association. Enforced in application code at write
  time.
- **Counter drift on hard account deletion.** `like.userId` and
  `eventShare.userId` cascade — if a user's account is deleted, their
  `like`/`eventShare` rows disappear without decrementing the
  counters they contributed to. Accepted for now given expected
  scale; a reconciliation job (recompute counters from source tables)
  would close this gap if it ever matters.

## Out of scope for this spec

- API routes / server actions for posting comments, replies, likes,
  shares.
- UI components (comment thread, like buttons, share button wiring
  `navigator.share`).
- Rate limiting / spam moderation on comments.
- Notifications (e.g. "someone replied to your comment").
