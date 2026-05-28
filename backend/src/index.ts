import "dotenv/config";
import { AppDataSource } from "./db";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { RoomRoute } from "./routes/room.route";
import { RoomTypeRoute } from "./routes/roomType.route";
import { ReservationRoute } from "./routes/reservation.route";
import { UserRoute } from "./routes/user.route";
import { ReviewRoute } from "./routes/review.route";
import { AuthRoute } from "./routes/auth.route";
import { DashboardRoute } from "./routes/dashboard.route";

const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:4200"
}))
app.use(morgan('tiny'))

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend radi!" })
})

app.use("/api/rooms/types", RoomTypeRoute);
app.use("/api/rooms", RoomRoute);
app.use("/api/reservations", ReservationRoute);
app.use("/api/users", UserRoute);
app.use("/api/reviews", ReviewRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/dashboard", DashboardRoute)

AppDataSource.initialize()
  .then(() => {
    console.log("DB CONNECTED");

    const port = Number(process.env.SERVER_PORT ?? 4000);

    app.listen(port, () => {
      console.log("SERVER RUNNING ON " + port);
    });
  })
  .catch((err) => {
    console.error("❌ TYPEORM INIT ERROR:");
    console.error(err);
  });
