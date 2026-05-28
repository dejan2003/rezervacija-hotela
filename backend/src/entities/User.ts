import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Reservation } from "./Reservation";
import { Review } from "./Review";

@Index("uq_user_email", ["email"], { unique: true })
@Entity("user", { schema: "hotel" })
export class User {

  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

  @Column("varchar", { name: "first_name", length: 255 })
  firstName: string;

  @Column("varchar", { name: "last_name", length: 255 })
  lastName: string;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "phone", nullable: true, length: 255 })
  phone: string | null;

  @Column("enum", {
    name: "role",
    nullable: true,
    enum: ["ADMIN", "RECEPTIONIST", "GUEST"],
    default: () => "'GUEST'",
  })
  role: "ADMIN" | "RECEPTIONIST" | "GUEST" | null;

  @Column("timestamp", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column("timestamp", { name: "updated_at", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column("timestamp", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}