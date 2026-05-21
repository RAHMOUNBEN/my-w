import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { buyerKeys, playerMessages, downloadableFiles } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const buyerRouter = createRouter({
  // ─── Login with Key ───
  login: publicQuery
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(buyerKeys).where(
        and(eq(buyerKeys.key, input.key.toUpperCase()), eq(buyerKeys.status, "active"))
      );
      if (rows.length === 0) {
        throw new Error("Invalid or inactive key");
      }
      return {
        key: rows[0].key,
        name: rows[0].name,
        email: rows[0].email,
        balance: rows[0].balance,
        plan: rows[0].plan,
        created: rows[0].createdAt,
      };
    }),

  // ─── Player Chat ───
  getMessages: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(playerMessages)
        .where(eq(playerMessages.buyerKey, input.key))
        .orderBy(playerMessages.createdAt);
    }),

  sendMessage: publicQuery
    .input(z.object({
      key: z.string(),
      text: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(playerMessages).values({
        buyerKey: input.key,
        text: input.text,
        sent: 1, // from player
      });
      return { success: true };
    }),

  // ─── Downloadable Files ───
  getFiles: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(downloadableFiles)
      .where(eq(downloadableFiles.active, 1))
      .orderBy(desc(downloadableFiles.createdAt));
  }),
});
