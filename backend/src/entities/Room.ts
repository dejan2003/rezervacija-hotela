import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Reservation } from "./Reservation";
import { Review } from "./Review";
import { RoomType } from "./RoomType";

@Index("uq_room_room_number", ["roomNumber"], { unique: true })
@Entity("room", { schema: "hotel" })
export class Room {
  @PrimaryGeneratedColumn({ type: "int", name: "room_id" })
  roomId: number;

  @Column("varchar", { name: "room_number", unique: true, length: 255 })
  roomNumber: string;

  @Column("int", { name: "floor" })
  floor: number;

  @Column("int", { name: "size_sqm", nullable: true })
  sizeSqm: number | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"],
    default: () => "'AVAILABLE'",
  })
  status: "AVAILABLE" | "MAINTENANCE" | "OUT_OF_SERVICE" | null;

  @Column("varchar", { name: "image_url", nullable: true, length: 500 })
  imageUrl: string | null;

  @Column("int", { name: "room_type_id" })
  roomTypeId: number;

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

  @OneToMany(() => Reservation, (reservation) => reservation.room)
  reservations: Reservation[];

  @OneToMany(() => Review, (review) => review.room)
  reviews: Review[];

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "room_type_id" })
  roomType: RoomType;
}
