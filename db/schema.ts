import { defineRelations } from "drizzle-orm";
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

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const event = pgTable("event", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  image: text("image").notNull(),
  imageAlt: text("image_alt").notNull(),
  description: text("description").notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const eventSession = pgTable(
  "event_session",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    time: text("time").notNull(),
    datetime: timestamp("datetime").notNull(),
    doors: text("doors"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("event_session_eventId_idx").on(table.eventId)],
);

export const ticketTier = pgTable(
  "ticket_tier",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => eventSession.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: integer("price").notNull(), // price in kobo
    description: text("description"),
    capacity: integer("capacity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("ticket_tier_sessionId_idx").on(table.sessionId)],
);

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalAmount: integer("total_amount").notNull(), // in kobo
    status: text("status", { enum: ["pending", "paid", "failed", "cancelled"] })
      .default("pending")
      .notNull(),
    paymentReference: text("payment_reference"),
    provider: text("provider", { enum: ["opay", "korapay"] })
      .default("opay")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("order_userId_idx").on(table.userId)],
);

export const ticket = pgTable(
  "ticket",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => eventSession.id, { onDelete: "cascade" }),
    tierId: text("tier_id")
      .notNull()
      .references(() => ticketTier.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    status: text("status", { enum: ["valid", "scanned", "cancelled"] })
      .default("valid")
      .notNull(),
    scannedAt: timestamp("scanned_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("ticket_orderId_idx").on(table.orderId),
    index("ticket_userId_idx").on(table.userId),
    index("ticket_sessionId_idx").on(table.sessionId),
    index("ticket_code_idx").on(table.code),
  ],
);

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
  (r) => ({
    user: {
      sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
      accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
      orders: r.many.order({ from: r.user.id, to: r.order.userId }),
      tickets: r.many.ticket({ from: r.user.id, to: r.ticket.userId }),
      comments: r.many.comment({ from: r.user.id, to: r.comment.userId }),
      likes: r.many.like({ from: r.user.id, to: r.like.userId }),
      shares: r.many.eventShare({ from: r.user.id, to: r.eventShare.userId }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    event: {
      sessions: r.many.eventSession({
        from: r.event.id,
        to: r.eventSession.eventId,
      }),
      comments: r.many.comment({ from: r.event.id, to: r.comment.eventId }),
      shares: r.many.eventShare({ from: r.event.id, to: r.eventShare.eventId }),
    },
    eventSession: {
      event: r.one.event({
        from: r.eventSession.eventId,
        to: r.event.id,
        optional: false,
      }),
      tiers: r.many.ticketTier({
        from: r.eventSession.id,
        to: r.ticketTier.sessionId,
      }),
      tickets: r.many.ticket({
        from: r.eventSession.id,
        to: r.ticket.sessionId,
      }),
    },
    ticketTier: {
      session: r.one.eventSession({
        from: r.ticketTier.sessionId,
        to: r.eventSession.id,
        optional: false,
      }),
      tickets: r.many.ticket({
        from: r.ticketTier.id,
        to: r.ticket.tierId,
      }),
    },
    order: {
      user: r.one.user({
        from: r.order.userId,
        to: r.user.id,
        optional: false,
      }),
      tickets: r.many.ticket({ from: r.order.id, to: r.ticket.orderId }),
    },
    ticket: {
      order: r.one.order({
        from: r.ticket.orderId,
        to: r.order.id,
        optional: false,
      }),
      session: r.one.eventSession({
        from: r.ticket.sessionId,
        to: r.eventSession.id,
        optional: false,
      }),
      tier: r.one.ticketTier({
        from: r.ticket.tierId,
        to: r.ticketTier.id,
        optional: false,
      }),
      user: r.one.user({
        from: r.ticket.userId,
        to: r.user.id,
        optional: false,
      }),
    },
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
  }),
);
