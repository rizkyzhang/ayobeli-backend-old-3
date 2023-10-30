import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

import { ApiUnauthorizedError } from "@/utils/error-handler";

export default class AuthMiddleware {
  constructor(
    private readonly prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      DefaultArgs
    >
  ) {}

  public isAuthenticatedAs(type: "ADMIN" | "USER") {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const jwk =
          process.env[
            `${
              type === "ADMIN"
                ? "ADMIN_CLERK_JWT_PUBLIC_KEY"
                : "CLERK_JWT_PUBLIC_KEY"
            }`
          ] || "";
        const pem = jwkToPem(JSON.parse(jwk));

        const token = req.headers.authorization?.split(" ")[1];
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const sessToken = req.cookies["__session"];
        if (!sessToken && !token) {
          throw new ApiUnauthorizedError("token not found");
        }

        const decoded = jwt.verify(token || sessToken, pem, {
          algorithms: ["RS256"],
        });

        const user = await this.prisma.user.findFirst({
          where: {
            clerk_id: decoded?.sub?.toString(),
            is_deleted: false,
          },
        });
        if (!user) {
          throw new ApiUnauthorizedError();
        }

        req.user = user;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
