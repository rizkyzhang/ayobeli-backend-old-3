import express, { Express, Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";

import ServiceUser from "@/service/service-user";
import { sendOkRes } from "@/utils/res";
import { ControllerUserUpdatePayload } from "@/domain/user";
import { ApiForbiddenError, controllerTryCatch } from "@/utils/error-handler";
import AuthMiddleware from "../middleware/middleware";

export default function setupUserRouter(
  app: Express,
  logger: Logger,
  authMiddleware: AuthMiddleware,
  service: ServiceUser
) {
  const router = express.Router();
  app.use("/api/v1/users", router);

  router.get(
    "/:uid",
    authMiddleware.isAuthenticatedAs("USER"),
    controllerTryCatch(async (req: Request, res: Response) => {
      const { uid } = req.params;
      z.string().cuid("invalid uid").parse(uid);

      if (req.user.uid !== uid) {
        throw new ApiForbiddenError();
      }

      const user = await service.getByUid(uid);

      sendOkRes(res, user);
    })
  );

  router.put(
    "/:uid",
    authMiddleware.isAuthenticatedAs("USER"),
    controllerTryCatch(
      async (req: ControllerUserUpdatePayload, res: Response) => {
        const { uid } = req.params;
        z.string().cuid("invalid uid").parse(uid);

        if (req.user.uid !== uid) {
          throw new ApiForbiddenError();
        }

        const payload = req.body;
        const { profileImage } = req.files;

        const createdUser = await service.update({
          uid,
          profileImage,
          username: payload.username,
          phone: payload.phone,
        });

        sendOkRes(res, createdUser);
      }
    )
  );
}
