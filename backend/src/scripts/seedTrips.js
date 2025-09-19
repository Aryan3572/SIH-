// scripts/seedTrips.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const modes = ["Car", "Bus", "Walk", "Bike", "Train"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  // hash demo password
  const hashedPassword = await bcrypt.hash("demo", 10);

  // create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@natpac.local" },
    update: {},
    create: {
      uuid: uuidv4(),          // generate UUID
      email: "demo@natpac.local",
      password: hashedPassword
    },
  });

  const trips = [];
  const now = new Date();
  for (let d = 0; d < 60; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    for (let t = 0; t < randomInt(20, 60); t++) {
      const hour = randomInt(6, 23);
      const start = new Date(date);
      start.setHours(hour, randomInt(0, 59), 0, 0);
      const duration = randomInt(5, 60);
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + duration);
      const mode = modes[Math.floor(Math.random() * modes.length)];
      trips.push({
        userId: user.id,
        mode,
        startTime: start,
        endTime: end,
        durationMinutes: duration,
        createdAt: start,
      });
    }
  }

  for (let i = 0; i < trips.length; i += 500) {
    const chunk = trips.slice(i, i + 500);
    await prisma.trip.createMany({ data: chunk });
    console.log("Inserted chunk", i);
  }

  console.log("Seeding finished");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
