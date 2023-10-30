import { readFile } from "fs/promises";
import { createId } from "@paralleldrive/cuid2";

import { ServiceUserDependencies } from "@/domain/user";
import { FileInfo } from "@/types/d";
import { ApiNotFoundError } from "@/utils/error-handler";

export default class ServiceUser {
  constructor(private readonly dependencies: ServiceUserDependencies) {}

  async create(payload: { email: string; username: string; clerkId: string }) {
    const createdUser = await this.dependencies.userRepository.create({
      data: {
        email: payload.email,
        username: payload.username,
        clerk_id: payload.clerkId,
      },
    });

    return createdUser;
  }

  async getByUid(uid: string) {
    const user = await this.dependencies.userRepository.get({
      where: {
        uid,
      },
    });
    if (!user) {
      throw new ApiNotFoundError("user not found");
    }

    return user;
  }

  async update(payload: {
    uid: string;
    username: string;
    phone?: string;
    profileImage?: FileInfo;
  }) {
    const user = await this.dependencies.userRepository.get({
      where: {
        uid: payload.uid,
      },
    });
    if (!user) {
      throw new ApiNotFoundError("user not found");
    }

    let profileImageURL = user?.profile_image_url;
    if (payload.profileImage) {
      const buffer = await readFile(payload.profileImage.path);
      const ext = payload.profileImage.originalFilename.split(".")[1];
      const key = `users/${
        payload.uid
      }/profile/profile-image-${createId()}.${ext}`;

      profileImageURL =
        await this.dependencies.s3Util.uploadFileToObjectStorage(
          buffer,
          key,
          payload.profileImage.headers["content-type"]
        );
    }

    const updatedUser = await this.dependencies.userRepository.update({
      data: {
        username: payload.username,
        phone: payload.phone,
        profile_image_url: profileImageURL,
      },
      where: {
        uid: payload.uid,
      },
    });

    return updatedUser;
  }
}
