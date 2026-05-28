import { Router } from "express";
import { handleRequest } from "../utils";
import { RoomTypeService } from "../services/roomType.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const RoomTypeRoute = Router();

RoomTypeRoute.get("/", (req, res) => {
  handleRequest(res, RoomTypeService.getAllRoomTypes());
});

RoomTypeRoute.get("/:id", (req, res) => {
  handleRequest(res, RoomTypeService.getRoomTypeById(Number(req.params.id)));
});

RoomTypeRoute.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, RoomTypeService.createRoomType(req.body));
  },
);

RoomTypeRoute.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(
      res,
      RoomTypeService.updateRoomType(Number(req.params.id), req.body),
    );
  },
);

RoomTypeRoute.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(
      res,
      RoomTypeService.deletedRoomTypeById(Number(req.params.id)),
    );
  },
);