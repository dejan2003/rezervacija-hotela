import { Router } from "express";
import { handleRequest } from "../utils";
import { ReviewService } from "../services/review.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const ReviewRoute = Router();

ReviewRoute.get("/", (req, res) => {
  handleRequest(res, ReviewService.getAllReviews());
});

ReviewRoute.get("/:id", (req, res) => {
  handleRequest(res, ReviewService.getReviewById(Number(req.params.id)));
});

ReviewRoute.post("/", requireAuth, (req, res) => {
  const user = res.locals.user as { userId: number };

  handleRequest(
    res,
    ReviewService.createReview({
      ...req.body,
      userId: user.userId,
    }),
  );
});

ReviewRoute.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(
      res,
      ReviewService.updateReview(Number(req.params.id), req.body),
    );
  },
);

ReviewRoute.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, ReviewService.deletedReviewById(Number(req.params.id)));
  },
);