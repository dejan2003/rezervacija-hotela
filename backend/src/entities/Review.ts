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

@Index("uq_review_user_room", ["user", "room"], { unique: true })
@Entity("review", { schema: "hotel" })
export class Review {
  @PrimaryGeneratedColumn({ type: "int", name: "review_id" })
  reviewId: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "room_id" })
  roomId: number;

  @Column("int", { name: "rating" })
  rating: number;

  @Column("text", { name: "comment", nullable: true })
  comment: string | null;

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

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Room, (room) => room.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "room_id" })
  room: Room;
}
