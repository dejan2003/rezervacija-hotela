import { Router } from "express";
import { handleRequest } from "../utils";
import { RoomService } from "../services/room.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const RoomRoute = Router();

RoomRoute.get("/", (req, res) => {
  handleRequest(res, RoomService.getAllRooms(req.query));
});

RoomRoute.get("/:id", (req, res) => {
  handleRequest(res, RoomService.getRoomById(Number(req.params.id)));
});

RoomRoute.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, RoomService.createRoom(req.body));
  },
);

RoomRoute.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, RoomService.updateRoom(Number(req.params.id), req.body));
  },
);

RoomRoute.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, RoomService.deletedRoomById(Number(req.params.id)));
  },
);