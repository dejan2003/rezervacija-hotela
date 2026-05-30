import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../db";
import { Review } from "../entities/Review";
import { checkIfDefined } from "../utils";
import { ReviewModel } from "../models/review.model";
import { Reservation } from "../entities/Reservation";
import { ReservationEnum } from "../models/reservation.model";

const repo = AppDataSource.getRepository(Review);

export class ReviewService {
  static async getAllReviews() {
    const reviews = await repo.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: {
          roomType: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });

    return reviews.map((review) => ({
      reviewId: review.reviewId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        userId: review.user.userId,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
      },
      room: {
        roomId: review.room.roomId,
        roomNumber: review.room.roomNumber,
        roomType: review.room.roomType,
      },
    }));
  }

  static async getReviewById(id: number) {
    const data = await repo.findOne({
      where: {
        reviewId: id,
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: true,
      },
    });

    return checkIfDefined(data);
  }

  static async createReview(model: ReviewModel) {
    const rating = Number(model.rating);
    const roomId = Number(model.roomId);

    if (!roomId) {
      throw new Error("Room is required");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const reservationRepo = AppDataSource.getRepository(Reservation);

    const reservation = await reservationRepo.findOne({
      where: {
        userId: model.userId,
        roomId,
        deletedAt: IsNull(),
        status: Not(ReservationEnum.CANCELLED),
      },
    });

    if (!reservation) {
      throw new Error("You can review only rooms you reserved");
    }

    const existingReview = await repo.findOne({
      where: {
        userId: model.userId,
        roomId,
      },
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = model.comment?.trim() || null;
      existingReview.deletedAt = null;
      existingReview.updatedAt = new Date();

      return await repo.save(existingReview);
    }

    return await repo.save({
      userId: model.userId,
      roomId,
      rating,
      comment: model.comment?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async updateReview(id: number, model: ReviewModel) {
    const data = await this.getReviewById(id);

    data.userId = model.userId;
    data.roomId = model.roomId;
    data.rating = model.rating;
    data.comment = model.comment;
    data.updatedAt = new Date();

    return await repo.save(data);
  }

  static async deletedReviewById(id: number) {
    const data = await this.getReviewById(id);
    data.deletedAt = new Date();
    await repo.save(data);
  }
}
