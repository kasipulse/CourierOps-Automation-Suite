import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  "https://mwtaveiqrinwdpjrjacz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGF2ZWlxcmlud2RwanJqYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTkwNzYsImV4cCI6MjA3NTM5NTA3Nn0.2WU8_ukDX41eigfkcV7jwuVj1BSi-1FmFZIfyGiimdI"
);

// Shopify Webhook Handler
const shopifyWebhook = async (req, res) => {
  try {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const hmacHeader = req.headers["x-shopify-hmac-sha256"];

    // Shopify requires exact body for HMAC validation
    const rawBody = JSON.stringify(req.body);

    if (secret && hmacHeader) {
      const hash = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");

      if (hash !== hmacHeader) {
        console.warn("⚠️ Invalid Shopify webhook signature.");
        return res.status(401).send("Unauthorized");
      }
    }

    const order = req.body;

    if (!order?.id) {
      console.warn("⚠️ Missing order ID in webhook payload.");
      return res.status(400).send("Invalid payload");
    }

    console.log(`✅ Verified Shopify Order #${order.id}`);

    // Save key order info to Supabase
    const { data, error } = await supabase.from("shopify_orders").insert([
      {
        order_id: order.id,
        email: order.email || null,
        total_price: order.total_price || null,
        currency: order.currency || "ZAR",
        created_at: order.created_at || new Date().toISOString(),
        customer_name: order.customer
          ? `${order.customer.first_name} ${order.customer.last_name}`
          : null,
        line_items: JSON.stringify(order.line_items || []),
        raw_payload: order, // full backup for debugging
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).send("Database error");
    }

    console.log("✅ Shopify order saved to Supabase:", data);
    res.status(200).send("Webhook processed successfully");
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export default shopifyWebhook;
