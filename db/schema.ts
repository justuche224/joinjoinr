import { defineRelations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer } from "drizzle-orm/pg-core";

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
  (r) => ({
    user: {
      sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
      accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
      orders: r.many.order({ from: r.user.id, to: r.order.userId }),
      tickets: r.many.ticket({ from: r.user.id, to: r.ticket.userId }),
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
  }),
);
