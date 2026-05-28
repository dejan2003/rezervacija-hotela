import { In, IsNull, LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../db";
import { Reservation } from "../entities/Reservation";
import { ReservationEnum, ReservationModel } from "../models/reservation.model";
import { checkIfDefined } from "../utils";
import { Room } from "../entities/Room";

const repo = AppDataSource.getRepository(Reservation);

export class ReservationService {
  static async getAllReservations() {
    return await repo.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: {
          roomType: true,
        },
      },
    });
  }

  static async getReservationsByUserId(userId: number) {
    return await repo.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: {
          roomType: true,
        },
      },
    });
  }

  static async getReservationById(id: number) {
    const data = await repo.findOne({
      where: {
        reservationId: id,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: {
          roomType: true,
        },
      },
    });

    return checkIfDefined(data);
  }

  static async getReservationByIdForUser(id: number, userId: number) {
    const data = await repo.findOne({
      where: {
        reservationId: id,
        userId,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: {
          roomType: true,
        },
      },
    });

    return checkIfDefined(data);
  }

  static async createdReservation(model: {
    userId: number;
    roomId: number;
    checkInDate: string | Date;
    checkOutDate: string | Date;
    guest: number;
    specialRequest?: string | null;
  }) {
    const roomRepo = AppDataSource.getRepository(Room);

    const room = await roomRepo.findOne({
      where: {
        roomId: Number(model.roomId),
        deletedAt: IsNull(),
      },
      relations: {
        roomType: true,
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    const checkInDate = new Date(model.checkInDate);
    const checkOutDate = new Date(model.checkOutDate);
    const guestCount = Number(model.guest);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      throw new Error("Invalid reservation dates");
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      throw new Error("Check-out date must be after check-in date");
    }

    if (!guestCount || guestCount <= 0) {
      throw new Error("Guest count must be greater than zero");
    }

    if (guestCount > room.roomType.capacity) {
      throw new Error("Guest count exceeds room capacity");
    }

    const existingReservation = await repo.findOne({
      where: {
        roomId: Number(model.roomId),
        deletedAt: IsNull(),
        status: In([
          ReservationEnum.PENDING,
          ReservationEnum.CONFIRMED,
          ReservationEnum.CHECKED_IN,
        ]),
        checkInDate: LessThan(checkOutDate),
        checkOutDate: MoreThan(checkInDate),
      },
    });

    if (existingReservation) {
      throw new Error("Room is already reserved for selected dates");
    }

    const totalPrice = (Number(room.roomType.basePrice) * nights).toFixed(2);

    return await repo.save({
      reservationCode: `RES-${Date.now()}`,
      userId: model.userId,
      roomId: Number(model.roomId),
      checkInDate,
      checkOutDate,
      guest: guestCount,
      totalPrice,
      status: ReservationEnum.PENDING,
      specialRequest: model.specialRequest || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async updateReservation(id: number, model: ReservationModel) {
    const data = await this.getReservationById(id);

    data.userId = model.userId;
    data.roomId = model.roomId;
    data.checkInDate = model.checkInDate;
    data.checkOutDate = model.checkOutDate;
    data.guest = model.guest;
    data.totalPrice = model.totalPrice;
    data.status = model.status;
    data.specialRequest = model.specialRequest;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async updateReservationStatus(id: number, status: ReservationEnum) {
    const data = await this.getReservationById(id);

    data.status = status;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async cancelReservation(id: number) {
    return await this.updateReservationStatus(id, ReservationEnum.CANCELLED);
  }

  static async cancelReservationForUser(id: number, userId: number) {
    const data = await this.getReservationByIdForUser(id, userId);

    data.status = ReservationEnum.CANCELLED;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async deletedReservationById(id: number) {
    const data = await this.getReservationById(id);
    data.deletedAt = new Date();
    await repo.save(data);
  }
}