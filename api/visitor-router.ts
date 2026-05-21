import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { eq } from "drizzle-orm";

export const visitorRouter = createRouter({
  // ─── Send Message (Visitor -> Admin) ───
  sendMessage: publicQuery
    .input(z.object({
      visitorId: z.string().min(1),
      visitorName: z.string().min(1),
      text: z.string().min(1),
      isPurchaseInterest: z.number().default(0),
      paymentMethod: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(messages).values({
        visitorId: input.visitorId,
        visitorName: input.visitorName,
        text: input.text,
        sent: 0, // from visitor
        isPurchaseInterest: input.isPurchaseInterest,
        paymentMethod: input.paymentMethod,
        status: "new",
      });
      return { success: true };
    }),

  // ─── Get Messages for a specific visitor ───
  getMessages: publicQuery
    .input(z.object({ visitorId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(messages)
        .where(eq(messages.visitorId, input.visitorId))
        .orderBy(messages.createdAt);
    }),
});
