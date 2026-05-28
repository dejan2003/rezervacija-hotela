import "dotenv/config";
import bcrypt from "bcrypt";
import { AppDataSource } from "./db";
import { User } from "./entities/User";
import { RoomType } from "./entities/RoomType";
import { Room } from "./entities/Room";

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const roomTypeRepo = AppDataSource.getRepository(RoomType);
  const roomRepo = AppDataSource.getRepository(Room);

  const adminEmail = "admin@hotel.rs";

  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await userRepo.save({
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: await bcrypt.hash("admin12345", 10),
      phone: null,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  let standard = await roomTypeRepo.findOne({
    where: { name: "Standard" },
  });

  if (!standard) {
    standard = await roomTypeRepo.save({
      name: "Standard",
      description: "Udobna standardna soba za kraci boravak.",
      capacity: 2,
      bedCount: 1,
      basePrice: "6000.00",
      amenities: "WiFi, TV, Klima",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  let deluxe = await roomTypeRepo.findOne({
    where: { name: "Deluxe" },
  });

  if (!deluxe) {
    deluxe = await roomTypeRepo.save({
      name: "Deluxe",
      description: "Prostrana soba sa dodatnim pogodnostima.",
      capacity: 3,
      bedCount: 2,
      basePrice: "9500.00",
      amenities: "WiFi, TV, Klima, Mini bar, Balkon",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const rooms = [
    {
      roomNumber: "101",
      floor: 1,
      sizeSqm: 24,
      roomTypeId: standard.roomTypeId,
      imageUrl: "/rooms/room-101.jpg",
    },
    {
      roomNumber: "102",
      floor: 1,
      sizeSqm: 26,
      roomTypeId: standard.roomTypeId,
      imageUrl: "/rooms/room-102.jpg",
    },
    {
      roomNumber: "201",
      floor: 2,
      sizeSqm: 34,
      roomTypeId: deluxe.roomTypeId,
      imageUrl: "/rooms/room-201.jpg",
    },
  ];

  for (const room of rooms) {
    const existingRoom = await roomRepo.findOne({
      where: { roomNumber: room.roomNumber },
    });

    if (!existingRoom) {
      await roomRepo.save({
        ...room,
        status: "AVAILABLE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log("Seed completed");
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});