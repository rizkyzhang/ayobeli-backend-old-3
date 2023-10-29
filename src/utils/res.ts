import { STATUS_CODES } from "http";
import { HttpStatusCode } from "axios";
import { Response } from "express";

const sendRes = (param: { res: Response; status: string; data?: unknown }) => {
  param.res.json({
    status: param.status,
    data: param.data,
  });
};

export const sendOkRes = (res: Response, data?: unknown) => {
  sendRes({
    res,
    status: String(STATUS_CODES[HttpStatusCode.Ok]),
    data,
  });
};

export const sendCreatedRes = (res: Response, data?: unknown) => {
  sendRes({
    res,
    status: String(STATUS_CODES[HttpStatusCode.Created]),
    data,
  });
};

export const sendNoContentRes = (res: Response) => {
  sendRes({
    res,
    status: String(STATUS_CODES[HttpStatusCode.NoContent]),
  });
};
