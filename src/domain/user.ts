import RepositoryUser from "@/repository/repository-user";
import { TypedRequestBody } from "@/types";
import { S3Util } from "@/utils/s3-util";
import { Logger } from "winston";

interface ControllerUserUpdateRequestBody {
  uid: string;
  username: string;
  phone?: string;
}
export type ControllerUserUpdatePayload =
  TypedRequestBody<ControllerUserUpdateRequestBody>;

export interface ServiceUserDependencies {
  logger: Logger;
  s3Util: S3Util;
  userRepository: RepositoryUser;
}
