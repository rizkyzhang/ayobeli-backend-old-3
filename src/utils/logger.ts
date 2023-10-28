import morgan from "morgan";
import winston from "winston";
import "winston-daily-rotate-file";

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.DailyRotateFile({
      level: "http",
      filename: "./logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD hh:mm:ss A",
        }),
        winston.format.printf(
          ({ level, message, timestamp, ...args }) =>
            `${timestamp} ${level}: ${message} ${
              Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ""
            }`
        )
      ),
    }),
    new winston.transports.Console({
      level: process.env.APP_ENV === "production" ? "http" : "debug",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD hh:mm:ss A",
        }),
        winston.format.printf(({ level, message, timestamp, ...args }) => {
          const colorizer = winston.format.colorize({ all: true });

          const coloredLevel = colorizer.colorize(
            level,
            `[${level.toUpperCase()}]`
          );
          return `${timestamp} ${coloredLevel}: ${message} ${
            Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ""
          }`;
        })
      ),
    }),
  ],
  exitOnError: false,
});

export const httpLogger = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: Number(tokens["response-time"](req, res)),
    }),
  {
    stream: {
      write: (message) => {
        const msg = JSON.parse(message);
        logger.http("HTTP Access Log", msg);
      },
    },
  }
);
