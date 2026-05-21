import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, heroVideo, socialLinks } from "@db/schema";

export const publicRouter = createRouter({
  // ─── Landing Page Data ───
  getProducts: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products);
  }),

  getHeroVideo: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(heroVideo);
    return rows[0] ?? { videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-gaming-setup-with-neon-lights-4827-large.mp4" };
  }),

  getSocialLinks: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(socialLinks);
  }),
});
