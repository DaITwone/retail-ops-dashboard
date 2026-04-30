// pnpm dlx tsx prisma/seed.ts

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // ─── Users ───────────────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash("123456", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@winmart.com" },
    update: {},
    create: {
      name: "Nguyễn Văn Đạt",
      email: "manager@winmart.com",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  console.log("Seeded user:", manager);

  // ─── Shifts ───────────────────────────────────────────────────────────────────
  // startTime / endTime lưu dạng số nguyên (giờ, 0–23)
  // color lưu màu nền chính — border, textColor, darkBg... tính ở frontend

  const shifts = [
    {
      code: "ca-rau",
      name: "Ca rau",
      startTime: 5,
      endTime: 13,
      color: "rgba(234,243,222,0.9)",
    },
    {
      code: "ca-sang",
      name: "Ca sáng",
      startTime: 6,
      endTime: 14,
      color: "rgba(192,221,151,0.55)",
    },
    {
      code: "ca-gay",
      name: "Ca gãy",
      startTime: 6,
      endTime: 22,
      color: "rgba(255,243,205,0.9)",
    },
    {
      code: "ca-chieu",
      name: "Ca chiều",
      startTime: 14,
      endTime: 22,
      color: "rgba(255,235,235,0.9)",
    },
    {
      code: "hc01",
      name: "HC01",
      startTime: 8,
      endTime: 17,
      color: "rgba(220,235,255,0.9)",
    },
    {
      code: "hc02",
      name: "HC02",
      startTime: 9,
      endTime: 18,
      color: "rgba(220,235,255,0.9)",
    },
  ];

  for (const shift of shifts) {
    await prisma.shift.upsert({
      where: { code: shift.code },
      update: {},
      create: shift,
    });
  }

  console.log("Seeded shifts:", shifts.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

