"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  position: "SALES_STAFF" | "INTERN" | "ASSISTANT_MANAGER" | "STORE_MANAGER";
  isActive: boolean;
  createdAt: Date;
  // Tính từ ShiftAssignment của hôm nay
  currentShiftName: string | null;
  shiftStatus: "dang-lam" | "nghi-ca" | "nghi-phep";
  // Số ca đã làm trong tháng hiện tại
  daysWorked: number;
  totalDaysInMonth: number;
};

export type CreateStaffInput = {
  name: string;
  email: string;
  phone: string;
  role: Role;
  position: "SALES_STAFF" | "INTERN" | "ASSISTANT_MANAGER" | "STORE_MANAGER";
  password?: string;
};

function getDaysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Bắt đầu: 00:00:00.000
 * Kết thúc: 23:59:59.999
 */
function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getStaffList(): Promise<StaffRow[]> {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);
  const monthStart = getStartOfMonth(now);
  const totalDaysInMonth = getDaysInCurrentMonth();

  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      shifts: {
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          shift: true,
        },
      },
    },
  });

  // console.log("USERS:", JSON.stringify(users, null, 2)); Full nested data.

  // Đếm cho từng user đã làm bao nhiêu ca trong tháng hiện tại
  const monthlyStats = await prisma.shiftAssignment.groupBy({
    by: ["userId"],
    where: {
      date: { gte: monthStart },
      status: "ASSIGNED",
    },
    _count: { id: true },
  });

  // console.log("MONTHLY STATS:", JSON.stringify(monthlyStats, null, 2));

  const statsMap = new Map(monthlyStats.map((s) => [s.userId, s._count.id]));

  return users.map((user) => {
    const todayAssignment = user.shifts[0] ?? null;

    let shiftStatus: StaffRow["shiftStatus"] = "nghi-ca";

    if (todayAssignment) {
      if (todayAssignment.status === "ABSENT") {
        shiftStatus = "nghi-phep";
      } else {
        shiftStatus = "dang-lam";
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      position: user.position,
      isActive: user.isActive,
      createdAt: user.createdAt,
      currentShiftName: todayAssignment
        ? `${todayAssignment.shift.name} ${String(todayAssignment.shift.startTime).padStart(2, "0")}:00–${String(todayAssignment.shift.endTime).padStart(2, "0")}:00`
        : null,
      shiftStatus,
      daysWorked: statsMap.get(user.id) ?? 0,
      totalDaysInMonth,
    };
  });
}

export async function createStaff(input: CreateStaffInput) {
  const { name, email, phone, role, position, password } = input;

  // Kiểm tra email đã tồn tại chưa
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Email đã được sử dụng" };
  }

  const hashed = await bcrypt.hash(password ?? "123456", 10);

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      role,
      position,
      password: hashed,
    },
  });

  revalidatePath("/staff");
  return { success: true };
}

export async function deactivateStaff(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  revalidatePath("/staff");
  return { success: true };
}

export async function getStaffDetail(userId: string) {
  const now = new Date();
  const monthStart = getStartOfMonth(now);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      shifts: {
        orderBy: { date: "desc" },
        include: {
          shift: true,
        },
      },
    },
  });

  if (!user) return null;

  const stats = await prisma.shiftAssignment.groupBy({
    by: ["status"],
    where: {
      userId,
      date: { gte: monthStart },
    },
    _count: { id: true },
  });

  const workedCount =
    stats.find((s) => s.status === "ASSIGNED")?._count.id ?? 0;

  const leaveCount = stats.find((s) => s.status === "ABSENT")?._count.id ?? 0;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    position: user.position,

    stats: {
      daysWorked: workedCount,
      daysOnLeave: leaveCount,
      totalDaysInMonth: getDaysInCurrentMonth(),
    },

    recentShifts: user.shifts.map((s) => ({
      date: s.date,
      shiftName: s.shift.name,
      status: s.status,
      time: `${s.shift.startTime}:00 - ${s.shift.endTime}:00`,
    })),
  };
}
