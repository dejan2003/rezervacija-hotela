import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Room } from "./Room";

@Index("uq_room_type_name", ["name"], { unique: true })
@Entity("room_type", { schema: "hotel" })
export class RoomType {

  @PrimaryGeneratedColumn({ type: "int", name: "room_type_id" })
  roomTypeId: number;

  @Column("varchar", { name: "name", unique: true, length: 255 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("int", { name: "capacity" })
  capacity: number;

  @Column("int", { name: "bed_count" })
  bedCount: number;

  @Column("decimal", { name: "base_price", precision: 10, scale: 2 })
  basePrice: string;

  @Column("text", { name: "amenities", nullable: true })
  amenities: string | null;

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

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}