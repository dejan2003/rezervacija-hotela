import { Router } from "express";
import { handleRequest } from "../utils";
import { ReservationService } from "../services/reservation.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const ReservationRoute = Router();

ReservationRoute.get("/", requireAuth, (req, res) => {
  const user = res.locals.user as { userId: number; role: string };

  if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
    handleRequest(res, ReservationService.getAllReservations());
    return;
  }

  handleRequest(res, ReservationService.getReservationsByUserId(user.userId));
});

ReservationRoute.get("/:id", requireAuth, (req, res) => {
  const user = res.locals.user as { userId: number; role: string };
  const reservationId = Number(req.params.id);

  if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
    handleRequest(res, ReservationService.getReservationById(reservationId));
    return;
  }

  handleRequest(
    res,
    ReservationService.getReservationByIdForUser(reservationId, user.userId),
  );
});

ReservationRoute.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Status is required" });
      return;
    }

    handleRequest(
      res,
      ReservationService.updateReservationStatus(Number(req.params.id), status),
    );
  },
);

ReservationRoute.patch("/:id/cancel", requireAuth, (req, res) => {
  const user = res.locals.user as { userId: number; role: string };
  const reservationId = Number(req.params.id);

  if (user.role === "ADMIN" || user.role === "RECEPTIONIST") {
    handleRequest(res, ReservationService.cancelReservation(reservationId));
    return;
  }

  handleRequest(
    res,
    ReservationService.cancelReservationForUser(reservationId, user.userId),
  );
});

ReservationRoute.post("/", requireAuth, (req, res) => {
  const user = res.locals.user as { userId: number };

  handleRequest(
    res,
    ReservationService.createdReservation({
      ...req.body,
      userId: user.userId,
    }),
  );
});

ReservationRoute.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(
      res,
      ReservationService.updateReservation(Number(req.params.id), req.body),
    );
  },
);

ReservationRoute.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(
      res,
      ReservationService.deletedReservationById(Number(req.params.id)),
    );
  },
);