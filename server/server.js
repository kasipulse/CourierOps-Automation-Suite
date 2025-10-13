import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import shopifyWebhook from "./shopify-webhook.js";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "5mb", type: "application/json" }));

// ✅ Initialize Supabase (make it accessible throughout your app)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Attach Supabase to the request object so routes like shopifyWebhook can use it
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// ✅ Shopify Webhook endpoint
app.post("/webhook/shopify", shopifyWebhook);

// ✅ Root test endpoint
app.get("/", (req, res) => {
  res.send("CourierOps Backend Running ✅");
});

// ✅ Health check route (optional but useful for Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 CourierOps backend running on port ${PORT}`));
