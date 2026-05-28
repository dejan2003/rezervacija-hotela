import { IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { RoomType } from "../entities/RoomType";
import { checkIfDefined } from "../utils";
import { RoomTypeModel } from "../models/roomType.model";

const repo = AppDataSource.getRepository(RoomType);

export class RoomTypeService {
  static async getAllRoomTypes() {
    return await repo.find({
      where: {
        deletedAt: IsNull(),
      },
    });
  }

  static async getRoomTypeById(id: number) {
    const data = await repo.findOne({
      where: {
        roomTypeId: id,
        deletedAt: IsNull(),
      },
    });

    return checkIfDefined(data);
  }

  static async createRoomType(model: RoomTypeModel) {
    return await repo.save({
      name: model.name,
      description: model.description,
      capacity: model.capacity,
      bedCount: model.bedCount,
      basePrice: model.basePrice,
      amenities: model.amenities,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async updateRoomType(id: number, model: RoomTypeModel) {
    const data = await this.getRoomTypeById(id);

    data.name = model.name;
    data.description = model.description;
    data.capacity = model.capacity;
    data.bedCount = model.bedCount;
    data.basePrice = model.basePrice;
    data.amenities = model.amenities;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async deletedRoomTypeById(id: number) {
    const data = await this.getRoomTypeById(id);
    data.deletedAt = new Date();
    await repo.save(data);
  }
}