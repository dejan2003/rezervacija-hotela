import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IsNull, Not } from "typeorm";
import { AppDataSource } from "../db";
import { User } from "../entities/User";

export const AuthRoute = Router();

const userRepo = AppDataSource.getRepository(User);

function createToken(user: User) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );
}

function userWithoutPassword(user: User) {
  const { password, ...safeUser } = user;
  return safeUser;
}

AuthRoute.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingUser = await userRepo.findOne({
      where: {
        email,
        deletedAt: IsNull(),
      },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: "GUEST",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: userWithoutPassword(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

AuthRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await userRepo.findOne({
      where: {
        email,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
});

AuthRoute.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "Missing token" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    const token = authHeader.slice(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    const user = await userRepo.findOne({
      where: {
        userId: payload.userId,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      user: userWithoutPassword(user),
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

AuthRoute.patch("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing token" });
      return;
    }

    const payload = jwt.verify(
      authHeader.slice(7),
      process.env.JWT_SECRET as string,
    ) as { userId: number };

    const user = await userRepo.findOne({
      where: {
        userId: payload.userId,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingUser = await userRepo.findOne({
      where: {
        email,
        userId: Not(user.userId),
        deletedAt: IsNull(),
      },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone || null;
    user.updatedAt = new Date();

    const savedUser = await userRepo.save(user);
    const token = createToken(savedUser);

    res.json({
      message: "Profile updated",
      token,
      user: userWithoutPassword(savedUser),
    });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});
