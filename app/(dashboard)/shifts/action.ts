"use server";

import { prisma } from "@/lib/prisma";

// 🔹 Lấy toàn bộ shift
export async function getShifts() {
  return prisma.shift.findMany();
}

// 🔹 Lấy staff
export async function getStaff() {
  return prisma.user.findMany({
    where: {
      role: "STAFF",
      isActive: true,
    },
  });
}

// 🔹 Lấy assignment theo range date
export async function getAssignments(start: Date, end: Date) {
  return prisma.shiftAssignment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
      shift: true,
    },
  });
}

// 🔹 Tạo assignment
export async function createAssignment(data: {
  userId: string;
  shiftId: string;
  date: Date;
}) {
  return prisma.shiftAssignment.create({
    data,
  });
}

// 🔹 Xoá assignment
export async function deleteAssignment(id: string) {
  return prisma.shiftAssignment.delete({
    where: { id },
  });
}