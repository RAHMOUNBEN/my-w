import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// ─── Users (keep original for OAuth) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ─── Buyer Keys ───
export const buyerKeys = mysqlTable("buyer_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  plan: mysqlEnum("plan", ["basic", "beta", "combo"]).default("basic").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Messages (Visitor <-> Admin Chat) ───
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitor_id", { length: 50 }).notNull(),
  visitorName: varchar("visitor_name", { length: 100 }).notNull(),
  text: text("text").notNull(),
  sent: int("sent").notNull(), // 0 = from visitor, 1 = from admin
  isPurchaseInterest: int("is_purchase_interest").default(0).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }),
  status: mysqlEnum("status", ["new", "replied", "closed"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Player Messages (Player <-> Admin Chat) ───
export const playerMessages = mysqlTable("player_messages", {
  id: serial("id").primaryKey(),
  buyerKey: varchar("buyer_key", { length: 50 }).notNull(),
  text: text("text").notNull(),
  sent: int("sent").notNull(), // 0 = from admin, 1 = from player
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Products (Admin-controlled) ───
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  plan: mysqlEnum("plan", ["basic", "beta", "combo"]).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  badge: varchar("badge", { length: 100 }),
  badgeClass: varchar("badge_class", { length: 50 }),
  cta: varchar("cta", { length: 255 }),
  highlight: int("highlight").default(0).notNull(),
  period: varchar("period", { length: 100 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Hero Video (Admin-controlled) ───
export const heroVideo = mysqlTable("hero_video", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Downloadable Files (Admin uploads, players download) ───
export const downloadableFiles = mysqlTable("downloadable_files", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  description: text("description"),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Social Links (Admin-controlled) ───
export const socialLinks = mysqlTable("social_links", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull().unique(),
  url: text("url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Types ───
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type BuyerKey = typeof buyerKeys.$inferSelect;
export type InsertBuyerKey = typeof buyerKeys.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type PlayerMessage = typeof playerMessages.$inferSelect;
export type Product = typeof products.$inferSelect;
export type HeroVideo = typeof heroVideo.$inferSelect;
export type DownloadableFile = typeof downloadableFiles.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
