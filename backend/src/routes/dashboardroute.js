// routes/natpac.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getRangeDates(range) {
  const now = new Date();
  let from, to;
  if (range === "today") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    to = new Date(from);
    to.setDate(to.getDate() + 1);
  } else if (range === "week") {
    const day = now.getDay(); // 0..6
    from = new Date(now);
    from.setDate(now.getDate() - day);
    from.setHours(0, 0, 0, 0);
    to = new Date(from);
    to.setDate(from.getDate() + 7);
  } else {
    // month
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  return { from, to };
}

router.get("/stats", async (req, res) => {
  const range = req.query.range || "today";
  const { from, to } = getRangeDates(range);
  try {
    const totalUsers = await prisma.user.count();
    const todaysTrips = await prisma.trip.count({ where: { startTime: { gte: from, lt: to } } });

    // avg duration
    const avg = await prisma.trip.aggregate({
      _avg: { durationMinutes: true },
      where: { startTime: { gte: from, lt: to } },
    });

    // peak hour: raw SQL (Postgres) - returns hour in 0..23
    const peak = await prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "startTime") as hour, COUNT(*)::int as count
      FROM "Trip"
      WHERE "startTime" >= ${from} AND "startTime" < ${to}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1;
    `;

    const peakHourObj = peak && peak.length ? peak[0] : null;
    const peakHour = peakHourObj ? `${parseInt(peakHourObj.hour)}:00` : null;
    const peakHourCount = peakHourObj ? peakHourObj.count : 0;

    res.json({
      totalUsers,
      todaysTrips,
      peakHour,
      peakHourCount,
      avgTripDuration: Math.round(avg._avg.durationMinutes || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/trips-by-hour", async (req, res) => {
  const range = req.query.range || "today";
  const { from, to } = getRangeDates(range);
  try {
    const rows = await prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "startTime") as hour, COUNT(*)::int as count
      FROM "Trip"
      WHERE "startTime" >= ${from} AND "startTime" < ${to}
      GROUP BY hour
      ORDER BY hour;
    `;
    // create full morning..night list (6..23) and fill zeros
    const map = {};
    rows.forEach((r) => (map[Number(r.hour)] = r.count));
    const result = [];
    for (let h = 6; h <= 23; h++) {
      result.push({ hour: h, count: map[h] || 0 });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mode-share", async (req, res) => {
  const range = req.query.range || "today";
  const { from, to } = getRangeDates(range);
  try {
    const group = await prisma.trip.groupBy({
      by: ["mode"],
      _count: { mode: true },
      where: { startTime: { gte: from, lt: to } },
      orderBy: { _count: { mode: "desc" } },
    });
    const result = group.map((g) => ({ mode: g.mode, count: g._count.mode }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/trends", async (req, res) => {
  // weekly trends grouped by day name
  const range = req.query.range || "week";
  const { from, to } = getRangeDates(range);
  try {
    const rows = await prisma.$queryRaw`
      SELECT TO_CHAR("startTime", 'Dy') as day, COUNT(*)::int as count
      FROM "Trip"
      WHERE "startTime" >= ${from} AND "startTime" < ${to}
      GROUP BY day
      ORDER BY MIN("startTime");
    `;
    res.json(rows.map((r) => ({ day: r.day, count: r.count })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
