import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function shopifyWebhook(req, res) {
  try {
    const data = req.body;

    // Example: Insert order details into Supabase
    const { error } = await supabase.from("shopify_orders").insert([
      {
        order_id: data.id,
        customer_name: data.customer?.first_name + " " + data.customer?.last_name,
        total_price: data.total_price,
        email: data.email,
        status: data.financial_status,
        created_at: new Date(),
      },
    ]);

    if (error) throw error;

    res.status(200).json({ success: true, message: "Shopify order stored!" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
}
