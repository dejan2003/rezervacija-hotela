import { configDotenv } from "dotenv";
import { User } from "./entities/User";
import { RoomType } from "./entities/RoomType";
import { Room } from "./entities/Room";
import { Review } from "./entities/Review";
import { Reservation } from "./entities/Reservation";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT || "3306"),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, RoomType, Room, Review, Reservation],
    logging: false
})