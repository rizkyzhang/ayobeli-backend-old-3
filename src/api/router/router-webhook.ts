import express, { Express } from "express";
import { Webhook } from "svix";
import { Logger } from "winston";

import { WebhookEvent } from "@clerk/clerk-sdk-node";
import ServiceUser from "@/service/service-user";

export default function setupWebhookRouter(
  app: Express,
  logger: Logger,
  service: ServiceUser
) {
  const router = express.Router();
  app.use("/api/v1/webhook", router);

  router.post("/clerk", async (req, res) => {
    try {
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);

      wh.verify(JSON.stringify(req.body), {
        "svix-id": String(req.header("svix-id")),
        "svix-signature": String(req.header("svix-signature")),
        "svix-timestamp": String(req.header("svix-timestamp")),
      });

      const evt = req.body as WebhookEvent;

      if (evt.type === "user.created") {
        await service.create({
          email: evt.data.email_addresses[0].email_address,
          username: String(evt.data.public_metadata.username),
          clerkId: evt.data.id,
        });
      }

      res.json({
        success: true,
        message: "Webhook received",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  });
}
