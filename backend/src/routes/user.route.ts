import { Router } from "express";
import { handleRequest } from "../utils";
import { UserService } from "../services/user.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const UserRoute = Router();

UserRoute.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, UserService.getAllUsers());
  },
);

UserRoute.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, UserService.getUserById(Number(req.params.id)));
  },
);

UserRoute.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, UserService.createUser(req.body));
  },
);

UserRoute.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, UserService.updateUser(Number(req.params.id), req.body));
  },
);

UserRoute.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "RECEPTIONIST"),
  (req, res) => {
    handleRequest(res, UserService.deletedUserById(Number(req.params.id)));
  },
);