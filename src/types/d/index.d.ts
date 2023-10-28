// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from "express";

export interface FileInfo {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: {
    "content-disposition": string;
    "content-type": string;
  };
  size: number;
  name: string;
  type: string;
}
type FilesRecord = Record<string, FileInfo>;

declare global {
  namespace Express {
    interface Request {
      files: FilesRecord;
    }
  }
}
