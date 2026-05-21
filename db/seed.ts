import { getDb } from "../api/queries/connection";
import { products, heroVideo, socialLinks } from "./schema";

async function seed() {
  const db = getDb();

  // Seed default products
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
      {
        plan: "basic",
        name: "Basic",
        description: "For casual games",
        price: "12.00",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
        badge: "Popular",
        badgeClass: "badge-success",
        cta: "Subscribe",
        highlight: 0,
        period: "month",
      },
      {
        plan: "beta",
        name: "Beta",
        description: "Advanced features",
        price: "15.00",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
        badge: "Beta",
        badgeClass: "badge-warning",
        cta: "Subscribe",
        highlight: 0,
        period: "month",
      },
      {
        plan: "combo",
        name: "Combo (All)",
        description: "All dashboards",
        price: "17.00",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
        badge: "Best Value",
        badgeClass: "badge-premium",
        cta: "Subscribe",
        highlight: 1,
        period: "month",
      },
    ]);
    console.log("Seeded products");
  }

  // Seed default hero video
  const existingVideo = await db.select().from(heroVideo);
  if (existingVideo.length === 0) {
    await db.insert(heroVideo).values({
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-gaming-setup-with-neon-lights-4827-large.mp4",
    });
    console.log("Seeded hero video");
  }

  // Seed default social links
  const existingSocial = await db.select().from(socialLinks);
  if (existingSocial.length === 0) {
    await db.insert(socialLinks).values([
      { platform: "discord", url: "https://discord.gg/samx" },
      { platform: "youtube", url: "https://youtube.com/@samx" },
      { platform: "telegram", url: "https://t.me/samx" },
    ]);
    console.log("Seeded social links");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
