import { Router } from "express";
import { In, IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { Room } from "../entities/Room";
import { Reservation } from "../entities/Reservation";
import { User } from "../entities/User";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const DashboardRoute = Router();

const roomRepo = AppDataSource.getRepository(Room);
const reservationRepo = AppDataSource.getRepository(Reservation);
const userRepo = AppDataSource.getRepository(User);

DashboardRoute.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  async (req, res) => {
    try {
      const busyStatuses = ["PENDING", "CONFIRMED", "CHECKED_IN"] as const;
      const revenueStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] as const;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const totalRooms = await roomRepo.count({
        where: {
          deletedAt: IsNull(),
        },
      });

      const availableRooms = await roomRepo
        .createQueryBuilder("room")
        .leftJoin(
          "room.reservations",
          "reservation",
          `
          reservation.deleted_at IS NULL
          AND reservation.status IN (:...busyStatuses)
          AND reservation.check_in_date < :tomorrow
          AND reservation.check_out_date > :today
          `,
          {
            busyStatuses,
            today,
            tomorrow,
          },
        )
        .where("room.deleted_at IS NULL")
        .andWhere("room.status = :status", { status: "AVAILABLE" })
        .andWhere("reservation.reservation_id IS NULL")
        .getCount();

      const activeReservations = await reservationRepo.count({
        where: {
          status: In(["PENDING", "CONFIRMED", "CHECKED_IN"]),
          deletedAt: IsNull(),
        },
      });

      const guests = await userRepo.count({
        where: {
          role: "GUEST",
          deletedAt: IsNull(),
        },
      });

      const revenueRaw = await reservationRepo
        .createQueryBuilder("reservation")
        .select("COALESCE(SUM(reservation.total_price), 0)", "revenue")
        .where("reservation.deleted_at IS NULL")
        .andWhere("reservation.status IN (:...revenueStatuses)", {
          revenueStatuses,
        })
        .getRawOne();

      const revenue = Number(revenueRaw?.revenue ?? 0);

      res.json({
        stats: {
          totalRooms,
          availableRooms,
          activeReservations,
          todayCheckIns: 0,
          guests,
          revenue,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Dashboard failed",
      });
    }
  },
);