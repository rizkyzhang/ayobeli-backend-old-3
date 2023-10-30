import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import formData from "express-form-data";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { S3 } from "@aws-sdk/client-s3";

import { ErrorHandler } from "./utils/error-handler";
import { httpLogger, logger } from "./utils/logger";
import setupRouter from "./api/router/router";
import { S3Util } from "./utils/s3-util";

const app = express();
const port = process.env.PORT || 8080;
const errorHandler = new ErrorHandler();
const prisma = new PrismaClient();
const s3Client = new S3({
  region: process.env.LINODE_OBJECT_STORAGE_REGION,
  endpoint: process.env.LINODE_OBJECT_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: String(process.env.LINODE_OBJECT_STORAGE_ACCESS_KEY_ID),
    secretAccessKey: String(
      process.env.LINODE_OBJECT_STORAGE_SECRET_ACCESS_KEY
    ),
  },
});
const s3Util = new S3Util(s3Client);

// parsing application/json
app.use(express.json());
// parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parsing multipart/form-data
const options: formData.FormDataOptions = {
  uploadDir: `${__dirname}/tmp`,
  autoClean: true,
};
app.use(formData.parse(options));
app.use(formData.format()); // delete from the request all empty files (size == 0)
// parsing cookie
app.use(cookieParser());

app.use(cors());
app.use(helmet());
app.use(httpLogger);

setupRouter(app, prisma, s3Util, logger);

process.on("unhandledRejection", (reason: string) => {
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw reason;
});

process.on("uncaughtException", (error) => {
  errorHandler.handleError(error, app.response);
});

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    errorHandler.handleError(error, res);
  }
);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
