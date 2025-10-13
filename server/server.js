import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import shopifyWebhook from "./shopify-webhook.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

// Webhook endpoint
app.post("/webhook/shopify", shopifyWebhook);

// Root test endpoint
app.get("/", (req, res) => res.send("CourierOps Backend Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
