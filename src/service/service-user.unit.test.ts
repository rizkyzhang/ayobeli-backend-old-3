/* eslint-disable arrow-body-style */
import { Client } from "pg";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { mock } from "ts-jest-mocker";
import { faker } from "@faker-js/faker";

import RepositoryUser from "@/repository/repository-user";
import { logger } from "@/utils/logger";
import { S3Util } from "@/utils/s3-util";
import { prismaMigrate } from "@/utils/prisma";
import { ApiNotFoundError } from "@/utils/error-handler";
import ServiceUser from "./service-user";

describe("User Service", () => {
  jest.setTimeout(60000);

  const s3UtilMock = mock(S3Util);
  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: Client;
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  let userUid: string;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();
    const connectionUri = postgresContainer.getConnectionUri();
    postgresClient = new Client({
      connectionString: connectionUri,
    });
    await postgresClient.connect();

    prisma = new PrismaClient({ datasourceUrl: connectionUri });
    await prismaMigrate(connectionUri);
  });

  afterAll(async () => {
    await postgresClient.end();
    await postgresContainer.stop();
  });

  describe("Create", () => {
    it("should be successful given correct inputs", async () => {
      const userRepository = new RepositoryUser({ prisma, logger });
      const service = new ServiceUser({
        s3Util: s3UtilMock,
        logger,
        userRepository,
      });
      const payload = {
        email: faker.internet.email(),
        clerkId: `user_${faker.string.alpha({ length: 20 })}`,
        username: faker.internet.userName(),
      };
      const createdUser = await service.create(payload);
      userUid = createdUser.uid;

      expect(createdUser.email).toEqual(payload.email);
      expect(createdUser.username).toEqual(payload.username);
      expect(createdUser.clerk_id).toEqual(payload.clerkId);
    });
  });

  describe("Get", () => {
    it("should return an user given correct uid", async () => {
      const userRepository = new RepositoryUser({ prisma, logger });
      const service = new ServiceUser({
        s3Util: s3UtilMock,
        logger,
        userRepository,
      });
      const user = await service.getByUid(userUid);

      expect(user?.uid).toEqual(userUid);
    });

    it("should return an error if user not found", async () => {
      const userRepository = new RepositoryUser({ prisma, logger });
      const service = new ServiceUser({
        s3Util: s3UtilMock,
        logger,
        userRepository,
      });

      await expect(service.getByUid("123")).rejects.toThrow(ApiNotFoundError);
    });
  });

  describe("Update", () => {
    it("should be successful given correct inputs without profile image", async () => {
      const userRepository = new RepositoryUser({ prisma, logger });
      const service = new ServiceUser({
        s3Util: s3UtilMock,
        logger,
        userRepository,
      });
      const payload = {
        uid: userUid,
        username: faker.internet.userName(),
        phone: faker.phone.number(),
      };
      const updatedUser = await service.update(payload);

      expect(updatedUser.uid).toEqual(payload.uid);
      expect(updatedUser.username).toEqual(payload.username);
      expect(updatedUser.phone).toEqual(payload.phone);
    });

    it("should return an error if user not found", async () => {
      const userRepository = new RepositoryUser({ prisma, logger });
      const service = new ServiceUser({
        s3Util: s3UtilMock,
        logger,
        userRepository,
      });
      const payload = {
        uid: "123",
        email: faker.internet.email(),
        username: faker.internet.userName(),
      };

      await expect(service.update(payload)).rejects.toThrow(ApiNotFoundError);
    });
  });
});
