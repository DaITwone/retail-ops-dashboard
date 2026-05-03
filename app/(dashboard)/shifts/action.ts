"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ShiftDef = {
  id: string;
  key: string;
  label: string;
  startHour: number;
  endHour: number;
  color: string;
  border: string;
  textColor: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
};

export type StaffOption = {
  id: string;
  name: string;
  email: string;
};

export type ShiftAssignmentRow = {
  id: string;
  dateKey: string;
  shiftKey: string;
  shiftId: string;
  userId: string;
  staffName: string;
  status: "ASSIGNED" | "CHECKED_IN" | "ABSENT";
};

export type ShiftScheduleData = {
  shifts: ShiftDef[];
  staff: StaffOption[];
  assignments: ShiftAssignmentRow[];
};

/**
 * Record<string, Something> - Object có key: string, value: something
 * Pick<Type, Keys> - Lấy ra một type mới từ Type, chỉ giữ lại các keys được chỉ định trong Keys
 */
const shiftStyleByCode: Record<
  string,
  Pick<ShiftDef, "border" | "textColor" | "darkBg" | "darkBorder" | "darkText">
> = {
  "ca-rau": {
    border: "#C0DD97",
    textColor: "#3B6D11",
    darkBg: "rgba(39,80,10,0.15)",
    darkBorder: "#639922",
    darkText: "#C0DD97",
  },
  "ca-sang": {
    border: "#97C459",
    textColor: "#27500A",
    darkBg: "rgba(39,80,10,0.3)",
    darkBorder: "#97C459",
    darkText: "#EAF3DE",
  },
  "ca-gay": {
    border: "#E6C96A",
    textColor: "#8a6800",
    darkBg: "rgba(255,243,205,0.1)",
    darkBorder: "#8a6800",
    darkText: "#d4a800",
  },
  "ca-chieu": {
    border: "#F0B0B0",
    textColor: "#9a2a2a",
    darkBg: "rgba(255,235,235,0.07)",
    darkBorder: "#7a2a2a",
    darkText: "#e08080",
  },
  hc01: {
    border: "#90B8E8",
    textColor: "#1a4a88",
    darkBg: "rgba(220,235,255,0.07)",
    darkBorder: "#2a5a99",
    darkText: "#6aadff",
  },
  hc02: {
    border: "#90B8E8",
    textColor: "#1a4a88",
    darkBg: "rgba(220,235,255,0.07)",
    darkBorder: "#2a5a99",
    darkText: "#6aadff",
  },
};

const fallbackStyle = {
  border: "#90B8E8",
  textColor: "#1a4a88",
  darkBg: "rgba(220,235,255,0.07)",
  darkBorder: "#2a5a99",
  darkText: "#6aadff",
};

const rangeSchema = z.object({
  startDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createAssignmentSchema = z.object({
  userId: z.string().min(1),
  shiftId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function mapShift(shift: {
  id: string;
  code: string;
  name: string;
  startTime: number;
  endTime: number;
  color: string | null;
}): ShiftDef {
  const style = shiftStyleByCode[shift.code] ?? fallbackStyle;

  return {
    id: shift.id,
    key: shift.code,
    label: `${shift.name} ${String(shift.startTime).padStart(2, "0")}-${String(shift.endTime).padStart(2, "0")}`,
    startHour: shift.startTime,
    endHour: shift.endTime,
    color: shift.color ?? "rgba(220,235,255,0.9)",
    ...style,
  };
}

function mapAssignment(assignment: {
  id: string;
  date: Date;
  shiftId: string;
  userId: string;
  status: "ASSIGNED" | "CHECKED_IN" | "ABSENT";
  user: { name: string };
  shift: { code: string };
}): ShiftAssignmentRow {
  return {
    id: assignment.id,
    dateKey: formatDateKey(assignment.date),
    shiftKey: assignment.shift.code,
    shiftId: assignment.shiftId,
    userId: assignment.userId,
    staffName: assignment.user.name,
    status: assignment.status,
  };
}

async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, isActive: true },
  });
}

export async function getAssignmentsForRange(input: {
  startDateKey: string;
  endDateKey: string;
}): Promise<ShiftAssignmentRow[]> {
  const parsed = rangeSchema.parse(input);
  const start = dateKeyToDate(parsed.startDateKey);
  const end = addDays(dateKeyToDate(parsed.endDateKey), 1);

  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      date: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [{ date: "asc" }, { shift: { startTime: "asc" } }],
    include: {
      user: { select: { name: true } },
      shift: { select: { code: true } },
    },
  });

  return assignments.map(mapAssignment);
}

export async function getShiftSchedule(): Promise<ShiftScheduleData> {
  const today = new Date();
  const startDateKey = formatDateKey(addDays(today, -45));
  const endDateKey = formatDateKey(addDays(today, 45));

  const [shifts, staff, assignments] = await Promise.all([
    prisma.shift.findMany({ orderBy: [{ startTime: "asc" }, { code: "asc" }] }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    getAssignmentsForRange({ startDateKey, endDateKey }),
  ]);

  return {
    shifts: shifts.map(mapShift),
    staff,
    assignments,
  };
}

export async function createAssignment(input: {
  userId: string;
  shiftId: string;
  dateKey: string;
}) {
  const currentUser = await requireUser();
  if (!currentUser?.isActive) {
    return { success: false, error: "Bạn cần đăng nhập để gán ca." };
  }

  const parsed = createAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dữ liệu gán ca không hợp lệ." };
  }

  try {
    const assignment = await prisma.shiftAssignment.create({
      data: {
        userId: parsed.data.userId,
        shiftId: parsed.data.shiftId,
        date: dateKeyToDate(parsed.data.dateKey),
      },
      include: {
        user: { select: { name: true } },
        shift: { select: { code: true } },
      },
    });

    revalidatePath("/shifts");
    revalidatePath("/staff");
    return { success: true, data: mapAssignment(assignment) };
  } catch {
    return {
      success: false,
      error: "Nhân viên này đã được gán vào ca này trong ngày đã chọn.",
    };
  }
}

export async function deleteAssignment(id: string) {
  const currentUser = await requireUser();
  if (!currentUser?.isActive) {
    return { success: false, error: "Bạn cần đăng nhập để xóa ca." };
  }

  if (!id) {
    return { success: false, error: "Không tìm thấy ca cần xóa." };
  }

  try {
    await prisma.shiftAssignment.delete({ where: { id } });
    revalidatePath("/shifts");
    revalidatePath("/staff");
    return { success: true };
  } catch {
    return { success: false, error: "Ca này không còn tồn tại." };
  }
}
