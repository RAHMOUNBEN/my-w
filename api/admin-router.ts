import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { buyerKeys, messages, products, heroVideo, downloadableFiles, socialLinks, playerMessages } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Admin auth check using hardcoded credentials (sent via headers)
const adminQuery = publicQuery.use(async (opts) => {
  const authHeader = opts.ctx.req.headers.get("x-admin-auth");
  if (!authHeader) {
    throw new Error("Unauthorized");
  }
  try {
    const decoded = atob(authHeader);
    const [username, password] = decoded.split(":");
    if (username !== "SAMX_ADMIN_2026" || password !== "Xq9#mK2$pL5@vN8*wQ3") {
      throw new Error("Invalid credentials");
    }
  } catch {
    throw new Error("Invalid auth format");
  }
  return opts.next();
});

export const adminRouter = createRouter({
  // ─── Dashboard Stats ───
  stats: adminQuery.query(async () => {
    const db = getDb();
    const keys = await db.select().from(buyerKeys);
    const msgs = await db.select().from(messages);
    const activeKeys = keys.filter(k => k.status === "active");
    const revenue = activeKeys.reduce((sum, k) => {
      const price = k.plan === "basic" ? 12 : k.plan === "beta" ? 15 : 17;
      return sum + price;
    }, 0);
    return {
      totalPlayers: keys.length,
      activeKeys: activeKeys.length,
      monthlyRevenue: revenue,
      supportInquiries: msgs.filter(m => m.sent === 0).length,
    };
  }),

  // ─── Buyer Keys CRUD ───
  listKeys: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(buyerKeys).orderBy(desc(buyerKeys.createdAt));
  }),

  createKey: adminQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      balance: z.number().default(0),
      plan: z.enum(["basic", "beta", "combo"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const key = "SAMX-" + new Date().getFullYear() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      await db.insert(buyerKeys).values({
        key,
        name: input.name,
        email: input.email,
        balance: input.balance.toFixed(2),
        plan: input.plan,
        status: "active",
      });
      return { key };
    }),

  deleteKey: adminQuery
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(buyerKeys).where(eq(buyerKeys.key, input.key));
      return { success: true };
    }),

  addBalance: adminQuery
    .input(z.object({
      key: z.string(),
      amount: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(buyerKeys).where(eq(buyerKeys.key, input.key));
      if (existing.length === 0) throw new Error("Key not found");
      const current = parseFloat(existing[0].balance as unknown as string);
      await db.update(buyerKeys).set({
        balance: (current + input.amount).toFixed(2),
      }).where(eq(buyerKeys.key, input.key));
      return { success: true };
    }),

  // ─── Messages (Visitor Chat) ───
  listVisitorMessages: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(messages).orderBy(messages.createdAt);
  }),

  getVisitorChats: adminQuery.query(async () => {
    const db = getDb();
    const allMsgs = await db.select().from(messages).orderBy(messages.createdAt);
    const visitorMap: Record<string, {
      visitorId: string;
      visitorName: string;
      messages: typeof allMsgs;
      status: string;
      paymentMethod?: string;
    }> = {};
    for (const msg of allMsgs) {
      if (!visitorMap[msg.visitorId]) {
        visitorMap[msg.visitorId] = {
          visitorId: msg.visitorId,
          visitorName: msg.visitorName,
          messages: [],
          status: msg.status ?? "new",
          paymentMethod: msg.paymentMethod ?? undefined,
        };
      }
      visitorMap[msg.visitorId].messages.push(msg);
      if (msg.status && msg.status !== "closed") {
        visitorMap[msg.visitorId].status = msg.status;
      }
    }
    return Object.values(visitorMap);
  }),

  sendVisitorReply: adminQuery
    .input(z.object({
      visitorId: z.string(),
      text: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(messages).values({
        visitorId: input.visitorId,
        visitorName: "Admin",
        text: input.text,
        sent: 1,
        status: "replied",
      });
      await db.update(messages).set({ status: "replied" }).where(eq(messages.visitorId, input.visitorId));
      return { success: true };
    }),

  closeVisitorChat: adminQuery
    .input(z.object({ visitorId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(messages).set({ status: "closed" }).where(eq(messages.visitorId, input.visitorId));
      return { success: true };
    }),

  // ─── Player Messages ───
  getPlayerChats: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(playerMessages).orderBy(playerMessages.createdAt);
  }),

  sendPlayerReply: adminQuery
    .input(z.object({
      buyerKey: z.string(),
      text: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(playerMessages).values({
        buyerKey: input.buyerKey,
        text: input.text,
        sent: 0, // from admin
      });
      return { success: true };
    }),

  // ─── Products CRUD ───
  listProducts: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(products);
  }),

  upsertProduct: adminQuery
    .input(z.object({
      plan: z.enum(["basic", "beta", "combo"]),
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().positive(),
      image: z.string().optional(),
      badge: z.string().optional(),
      badgeClass: z.string().optional(),
      cta: z.string().optional(),
      highlight: z.number().default(0),
      period: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(products).where(eq(products.plan, input.plan));
      if (existing.length > 0) {
        await db.update(products).set({
          name: input.name,
          description: input.description,
          price: input.price.toFixed(2),
          image: input.image,
          badge: input.badge,
          badgeClass: input.badgeClass,
          cta: input.cta,
          highlight: input.highlight,
          period: input.period,
        }).where(eq(products.plan, input.plan));
      } else {
        await db.insert(products).values({
          plan: input.plan,
          name: input.name,
          description: input.description,
          price: input.price.toFixed(2),
          image: input.image,
          badge: input.badge,
          badgeClass: input.badgeClass,
          cta: input.cta,
          highlight: input.highlight,
          period: input.period,
        });
      }
      return { success: true };
    }),

  // ─── Hero Video ───
  getHeroVideo: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(heroVideo);
    return rows[0] ?? null;
  }),

  setHeroVideo: adminQuery
    .input(z.object({ videoUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(heroVideo);
      if (existing.length > 0) {
        await db.update(heroVideo).set({ videoUrl: input.videoUrl });
      } else {
        await db.insert(heroVideo).values({ videoUrl: input.videoUrl });
      }
      return { success: true };
    }),

  // ─── Downloadable Files ───
  listFiles: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(downloadableFiles).orderBy(desc(downloadableFiles.createdAt));
  }),

  addFile: adminQuery
    .input(z.object({
      fileName: z.string().min(1),
      fileUrl: z.string().url(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(downloadableFiles).values({
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        description: input.description,
        active: 1,
      });
      return { success: true };
    }),

  deleteFile: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(downloadableFiles).where(eq(downloadableFiles.id, input.id));
      return { success: true };
    }),

  toggleFile: adminQuery
    .input(z.object({ id: z.number(), active: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(downloadableFiles).set({ active: input.active }).where(eq(downloadableFiles.id, input.id));
      return { success: true };
    }),

  // ─── Social Links ───
  listSocialLinks: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(socialLinks);
  }),

  setSocialLink: adminQuery
    .input(z.object({
      platform: z.string().min(1),
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(socialLinks).where(eq(socialLinks.platform, input.platform));
      if (existing.length > 0) {
        await db.update(socialLinks).set({ url: input.url }).where(eq(socialLinks.platform, input.platform));
      } else {
        await db.insert(socialLinks).values({ platform: input.platform, url: input.url });
      }
      return { success: true };
    }),
});
