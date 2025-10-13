import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mwtaveiqrinwdpjrjacz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGF2ZWlxcmlud2RwanJqYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTkwNzYsImV4cCI6MjA3NTM5NTA3Nn0.2WU8_ukDX41eigfkcV7jwuVj1BSi-1FmFZIfyGiimdI"
);

const shopifyWebhook = async (req, res) => {
  try {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const hmacHeader = req.headers["x-shopify-hmac-sha256"];
    const body = JSON.stringify(req.body);

    // Verify webhook if secret exists
    if (secret && hmacHeader) {
      const digest = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");

      if (digest !== hmacHeader) {
        console.warn("⚠️ Invalid webhook signature.");
        return res.status(401).send("Unauthorized");
      }
    }

    console.log("✅ Verified Shopify Webhook Received:", req.body);

    const order = req.body;

    // Example structure — you can expand later
    const { data, error } = await supabase.from("shopify_orders").insert([
      {
        order_id: order.id,
        email: order.email,
        total_price: order.total_price,
        currency: order.currency,
        created_at: order.created_at,
        line_items: JSON.stringify(order.line_items),
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).send("Database error");
    }

    console.log("✅ Order saved to Supabase:", data);
    res.status(200).send("Webhook processed successfully");
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export default shopifyWebhook;
