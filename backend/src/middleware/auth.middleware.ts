import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Login required" });
    return;
  }

  try {
    const payload = jwt.verify(
      authHeader.slice(7),
      process.env.JWT_SECRET as string,
    );

    res.locals.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as { role?: string } | undefined;

    if (!user) {
      res.status(401).json({ message: "Login required" });
      return;
    }

    if (!roles.includes(user.role || "")) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}