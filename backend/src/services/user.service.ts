import bcrypt from "bcrypt";
import { IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { User } from "../entities/User";
import { UserModel } from "../models/user.model";
import { checkIfDefined } from "../utils";

const repo = AppDataSource.getRepository(User);

export class UserService {
  static async getAllUsers() {
    return await repo.find({
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        deletedAt: IsNull(),
      },
    });
  }

  static async getUserById(id: number) {
    const data = await repo.findOne({
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        userId: id,
        deletedAt: IsNull(),
      },
    });

    return checkIfDefined(data);
  }

  static async createUser(model: UserModel) {
    const hashedPassword = await bcrypt.hash(model.password, 10);

    const user = await repo.save({
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      password: hashedPassword,
      phone: model.phone || null,
      role: model.role || "GUEST",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async updateUser(id: number, model: UserModel) {
    const data = await repo.findOne({
      where: {
        userId: id,
        deletedAt: IsNull(),
      },
    });

    const user = checkIfDefined(data);

    user.firstName = model.firstName;
    user.lastName = model.lastName;
    user.email = model.email;
    user.phone = model.phone || null;
    user.role = model.role;

    if (model.password) {
      user.password = await bcrypt.hash(model.password, 10);
    }

    user.updatedAt = new Date();

    const savedUser = await repo.save(user);
    const { password, ...safeUser } = savedUser;
    return safeUser;
  }

  static async deletedUserById(id: number) {
    const data = await repo.findOne({
      where: {
        userId: id,
        deletedAt: IsNull(),
      },
    });

    const user = checkIfDefined(data);
    user.deletedAt = new Date();

    await repo.save(user);
  }
}