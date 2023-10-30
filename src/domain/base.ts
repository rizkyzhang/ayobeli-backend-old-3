import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { Logger } from "winston";

export interface RepositoryDependencies {
  logger: Logger;
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
}
