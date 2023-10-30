import { Prisma } from "@prisma/client";
import { RepositoryDependencies } from "@/domain/base";

export default class RepositoryUser {
  constructor(private readonly dependencies: RepositoryDependencies) {}

  async create(payload: Prisma.UserCreateArgs) {
    const createdUser = await this.dependencies.prisma.user.create(payload);
    return createdUser;
  }

  async get(payload: Prisma.UserFindUniqueArgs) {
    const user = await this.dependencies.prisma.user.findUnique(payload);
    return user;
  }

  async list(payload: Prisma.UserFindManyArgs) {
    const users = await this.dependencies.prisma.user.findMany(payload);
    return users;
  }

  async update(payload: Prisma.UserUpdateArgs) {
    const updatedUser = await this.dependencies.prisma.user.update(payload);
    return updatedUser;
  }

  async deleteByUid(uid: string) {
    const deletedUser = await this.dependencies.prisma.user.update({
      data: {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      },
      where: {
        uid,
      },
    });
    return deletedUser;
  }
}
