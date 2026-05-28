import { IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { Room } from "../entities/Room";
import { checkIfDefined } from "../utils";
import { RoomModel } from "../models/room.model";

const repo = AppDataSource.getRepository(Room);

export class RoomService {
  static async getAllRooms(filters: any = {}) {
    const { checkIn, checkOut, guests, roomTypeId, status, amenities } = filters;

    const qb = repo
      .createQueryBuilder("room")
      .leftJoinAndSelect("room.roomType", "roomType")
      .where("room.deletedAt IS NULL");

    qb.andWhere("room.status = :status", { status: status || "AVAILABLE" });

    if (roomTypeId) {
      qb.andWhere("roomType.roomTypeId = :roomTypeId", {
        roomTypeId: Number(roomTypeId),
      });
    }

    if (guests) {
      qb.andWhere("roomType.capacity >= :guests", {
        guests: Number(guests),
      });
    }

    if (checkIn && checkOut) {
      qb.leftJoin(
        "room.reservations",
        "reservation",
        `
        reservation.deletedAt IS NULL
        AND reservation.status IN (:...busyStatuses)
        AND reservation.checkInDate < :checkOut
        AND reservation.checkOutDate > :checkIn
        `,
        {
          busyStatuses: ["PENDING", "CONFIRMED", "CHECKED_IN"],
          checkIn,
          checkOut,
        },
      );

      qb.andWhere("reservation.reservationId IS NULL");
    }

    if (amenities) {
      String(amenities)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((amenity, index) => {
          qb.andWhere(`roomType.amenities LIKE :amenity${index}`, {
            [`amenity${index}`]: `%${amenity}%`,
          });
        });
    }

    return await qb.getMany();
  }

  static async getRoomById(id: number) {
    const data = await repo.findOne({
      where: {
        roomId: id,
        deletedAt: IsNull(),
      },
      relations: {
        roomType: true,
      },
    });

    return checkIfDefined(data);
  }

  static async createRoom(model: RoomModel) {
    return await repo.save({
      roomNumber: model.roomNumber,
      floor: model.floor,
      sizeSqm: model.sizeSqm,
      status: model.status,
      imageUrl: model.imageUrl || null,
      roomTypeId: model.roomTypeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async updateRoom(id: number, model: RoomModel) {
    const data = await this.getRoomById(id);

    data.roomNumber = model.roomNumber;
    data.floor = model.floor;
    data.sizeSqm = model.sizeSqm;
    data.status = model.status;
    data.imageUrl = model.imageUrl || null;
    data.roomTypeId = model.roomTypeId;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async deletedRoomById(id: number) {
    const data = await this.getRoomById(id);
    data.deletedAt = new Date();
    await repo.save(data);
  }
}