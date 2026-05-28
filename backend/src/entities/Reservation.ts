import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Room } from "./Room";
import { User } from "./User";

@Index("uq_reservation_reservation_code", ["reservationCode"], { unique: true })
@Index("idx_room_dates", ["checkInDate", "checkOutDate"])
@Entity("reservation", { schema: "hotel" })
export class Reservation {
  @PrimaryGeneratedColumn({ type: "int", name: "reservation_id" })
  reservationId: number;

  @Column("varchar", { name: "reservation_code", unique: true, length: 255 })
  reservationCode: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "room_id" })
  roomId: number;

  @Column("datetime", { name: "check_in_date" })
  checkInDate: Date;

  @Column("datetime", { name: "check_out_date" })
  checkOutDate: Date;

  @Column("int", { name: "guest" })
  guest: number;

  @Column("decimal", { name: "total_price", precision: 10, scale: 2 })
  totalPrice: string;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_IN", "CHECKED_OUT"],
    default: () => "'PENDING'",
  })
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | null;

  @Column("text", { name: "special_request", nullable: true })
  specialRequest: string | null;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column("timestamp", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.reservations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Room, (room) => room.reservations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room: Room;
}
