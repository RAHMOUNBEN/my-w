import { createRouter, publicQuery } from "./middleware";
import { adminRouter } from "./admin-router";
import { buyerRouter } from "./buyer-router";
import { publicRouter } from "./public-router";
import { visitorRouter } from "./visitor-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  admin: adminRouter,
  buyer: buyerRouter,
  public: publicRouter,
  visitor: visitorRouter,
});

export type AppRouter = typeof appRouter;
