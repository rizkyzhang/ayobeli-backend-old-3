import { Express } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { Logger } from "winston";

import { S3Util } from "@/utils/s3-util";
import RepositoryUser from "@/repository/repository-user";
import ServiceUser from "@/service/service-user";
import setupUserRouter from "./router-user";
import AuthMiddleware from "../middleware/middleware";
import setupWebhookRouter from "./router-webhook";

export default function setupRouter(
  app: Express,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  s3Util: S3Util,
  logger: Logger
) {
  const userRepository = new RepositoryUser({ prisma, logger });
  const userService = new ServiceUser({ userRepository, s3Util, logger });
  const authMiddleware = new AuthMiddleware(prisma);

  setupUserRouter(app, logger, authMiddleware, userService);
  setupWebhookRouter(app, logger, userService);
}
