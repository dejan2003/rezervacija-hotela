import { IsNull } from "typeorm";
import { AppDataSource } from "../db";
import { Review } from "../entities/Review";
import { checkIfDefined } from "../utils";
import { ReviewModel } from "../models/review.model";

const repo = AppDataSource.getRepository(Review);

export class ReviewService {
  static async getAllReviews() {
    return await repo.find({
      where: {
        deletedAt: IsNull(),
      },
      relations: {
        user: true,
        room: true,
      },
    });
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
    return await repo.save({
      userId: model.userId,
      roomId: model.roomId,
      rating: model.rating,
      comment: model.comment,
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