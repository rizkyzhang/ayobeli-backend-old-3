import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import formData from "express-form-data";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { ErrorHandler } from "./utils/error-handler";
import { httpLogger, logger } from "./utils/logger";

const app = express();
const port = process.env.PORT || 8080;
const errorHandler = new ErrorHandler();

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

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    errorHandler.handleError(error, res);
  }
);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
