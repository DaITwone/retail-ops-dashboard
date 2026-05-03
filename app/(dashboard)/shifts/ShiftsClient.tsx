"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Printer,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentsForRange,
  type ShiftAssignmentRow,
  type ShiftDef,
  type ShiftScheduleData,
} from "./action";

type ViewMode = "ngay" | "tuan" | "thang";

const DAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5);

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  return addDays(d, day === 0 ? -6 : 1 - day);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function visibleRange(viewMode: ViewMode, currentDate: Date) {
  if (viewMode === "ngay") return { start: currentDate, end: currentDate };
  if (viewMode === "tuan") {
    const start = startOfWeek(currentDate);
    return { start, end: addDays(start, 6) };
  }
  return {
    start: startOfWeek(startOfMonth(currentDate)),
    end: addDays(startOfWeek(endOfMonth(currentDate)), 6),
  };
}

export default function ShiftsClient({
  initialData,
}: {
  initialData: ShiftScheduleData;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("tuan");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState<ShiftAssignmentRow[]>(
    initialData.assignments,
  );
  const [activeShift, setActiveShift] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    dateKey: string;
    shiftKey: string;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingRange, startRangeTransition] = useTransition();

  const shifts = initialData.shifts;
  const staff = initialData.staff;
  const shiftMap = useMemo(
    () => Object.fromEntries(shifts.map((shift) => [shift.key, shift])),
    [shifts],
  ) as Record<string, ShiftDef | undefined>;

  const weekDays = useMemo(() => {
    const mon = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  }, [currentDate]);

  const monthWeeks = useMemo(() => {
    const first = startOfMonth(currentDate);
    const monOfFirst = startOfWeek(first);
    return Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDays(monOfFirst, w * 7 + d)),
    );
  }, [currentDate]);

  const range = useMemo(
    () => visibleRange(viewMode, currentDate),
    [viewMode, currentDate],
  );

  useEffect(() => {
    const startDateKey = formatDateKey(range.start);
    const endDateKey = formatDateKey(range.end);

    startRangeTransition(async () => {
      const rows = await getAssignmentsForRange({ startDateKey, endDateKey });
      setAssignments((prev) => {
        const outsideRange = prev.filter(
          (row) => row.dateKey < startDateKey || row.dateKey > endDateKey,
        );
        return [...outsideRange, ...rows];
      });
    });
  }, [range.start, range.end]);

  const headerLabel = useMemo(() => {
    if (viewMode === "ngay") {
      const wd = DAY_LABELS[(currentDate.getDay() + 6) % 7];
      return `${wd} ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    }
    if (viewMode === "tuan") {
      const mon = weekDays[0];
      const sun = weekDays[6];
      return `T2 ${mon.getDate()}/${mon.getMonth() + 1} - CN ${sun.getDate()}/${sun.getMonth() + 1}/${sun.getFullYear()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, currentDate, weekDays]);

  function navigate(dir: -1 | 1) {
    if (viewMode === "ngay") setCurrentDate((d) => addDays(d, dir));
    else if (viewMode === "tuan") setCurrentDate((d) => addDays(d, dir * 7));
    else
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  function getAssignments(dateKey: string, shiftKey: string) {
    return assignments.filter(
      (a) => a.dateKey === dateKey && a.shiftKey === shiftKey,
    );
  }

  function openModal(dateKey: string, shiftKey: string) {
    setModal({ dateKey, shiftKey });
    setSelectedUserId("");
    setError("");
  }

  function addAssignment() {
    if (!modal || !selectedUserId) return;
    const shift = shiftMap[modal.shiftKey];
    if (!shift) return;

    setError("");
    startTransition(async () => {
      const result = await createAssignment({
        userId: selectedUserId,
        shiftId: shift.id,
        dateKey: modal.dateKey,
      });

      if (result.success && result.data) {
        setAssignments((prev) => [...prev, result.data]);
        setSelectedUserId("");
      } else {
        setError(result.error ?? "Không thể gán ca.");
      }
    });
  }

  function removeAssignment(id: string) {
    const removed = assignments.find((a) => a.id === id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setError("");

    startTransition(async () => {
      const result = await deleteAssignment(id);
      if (!result.success) {
        if (removed) setAssignments((prev) => [...prev, removed]);
        setError(result.error ?? "Không thể xóa ca.");
      }
    });
  }

  function renderWeek(days: Date[]) {
    const todayKey = formatDateKey(new Date());

    return (
      <div
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <table className="w-full border-collapse" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th
                className="sticky top-0 z-20 w-16 text-left text-[11px] font-semibold uppercase"
                style={{
                  background: "var(--bg-table)",
                  borderBottom: "2px solid var(--border-button)",
                  padding: "10px 8px",
                  color: "var(--text-muted)",
                }}
              >
                Giờ
              </th>
              {days.map((day) => {
                const dk = formatDateKey(day);
                const wd = DAY_LABELS[(day.getDay() + 6) % 7];
                const isToday = dk === todayKey;
                return (
                  <th
                    key={dk}
                    className="sticky top-0 z-20 text-center text-[13px] font-semibold"
                    style={{
                      background: "var(--bg-table)",
                      borderBottom: "2px solid var(--border-button)",
                      borderLeft: "1px solid var(--border-button)",
                      padding: "10px 6px",
                      color: isToday ? "#ef4444" : "var(--text-primary)",
                    }}
                  >
                    <div>{wd}</div>
                    <div className="mt-0.5 text-[11px] font-normal">
                      {day.getDate()}/{day.getMonth() + 1}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => {
              const shiftsAtHour = shifts.filter((s) => s.startHour === hour);
              return (
                <tr key={hour}>
                  <td
                    className="align-top text-[11px] font-mono"
                    style={{
                      padding: "6px 8px 0",
                      color: [5, 8, 9, 14].includes(hour)
                        ? "#ef4444"
                        : "var(--text-muted)",
                      fontWeight: [5, 8, 9, 14].includes(hour) ? 700 : 400,
                      borderTop: "1px solid var(--border-button)",
                      width: 64,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </td>
                  {days.map((day) => {
                    const dk = formatDateKey(day);
                    return (
                      <td
                        key={dk}
                        style={{
                          borderTop: "1px solid var(--border-button)",
                          borderLeft: "1px solid var(--border-button)",
                          padding: shiftsAtHour.length > 0 ? "4px 4px 0" : 0,
                          height: shiftsAtHour.length > 0 ? undefined : 28,
                          verticalAlign: "top",
                        }}
                      >
                        {shiftsAtHour.map((shift) => (
                          <ShiftSlot
                            key={shift.key}
                            shift={shift}
                            assignments={getAssignments(dk, shift.key)}
                            onClick={() => openModal(dk, shift.key)}
                            onRemove={removeAssignment}
                          />
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderMonth() {
    const todayKey = formatDateKey(new Date());
    const currMonth = currentDate.getMonth();

    return (
      <div
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {DAY_LABELS.map((lbl) => (
                <th
                  key={lbl}
                  className="text-center text-[12px] font-semibold uppercase"
                  style={{
                    background: "var(--bg-table)",
                    borderBottom: "2px solid var(--border-button)",
                    borderLeft: "1px solid var(--border-button)",
                    padding: "8px 4px",
                    color: "var(--text-muted)",
                  }}
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day) => {
                  const dk = formatDateKey(day);
                  const isToday = dk === todayKey;
                  const inMonth = day.getMonth() === currMonth;
                  const dayAssignments = assignments.filter(
                    (a) => a.dateKey === dk,
                  );
                  const uniqueShifts = [
                    ...new Set(dayAssignments.map((a) => a.shiftKey)),
                  ];

                  return (
                    <td
                      key={dk}
                      style={{
                        border: "1px solid var(--border-button)",
                        verticalAlign: "top",
                        padding: 6,
                        height: 120,
                        background: inMonth
                          ? "transparent"
                          : "rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        className="mb-1.5 text-[12px] font-semibold"
                        style={{
                          color: isToday
                            ? "#ef4444"
                            : inMonth
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                        }}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {uniqueShifts.slice(0, 3).map((sk) => {
                          const shift = shiftMap[sk];
                          if (!shift) return null;
                          const count = dayAssignments.filter(
                            (a) => a.shiftKey === sk,
                          ).length;
                          return (
                            <button
                              key={sk}
                              onClick={() => openModal(dk, sk)}
                              className="block w-full truncate rounded px-1 py-0.5 text-left text-[10px]"
                              style={{
                                background: shift.color,
                                border: `1px solid ${shift.border}`,
                                color: shift.textColor,
                              }}
                            >
                              {shift.label} · {count} NV
                            </button>
                          );
                        })}
                        {uniqueShifts.length > 3 && (
                          <div
                            className="text-[10px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            +{uniqueShifts.length - 3} ca khác
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const modalAssignments = modal
    ? getAssignments(modal.dateKey, modal.shiftKey)
    : [];

  return (
    <div
      className="min-h-screen space-y-6 p-6"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-md font-bold">LỊCH LÀM VIỆC</h1>
          {isLoadingRange && (
            <Loader2 size={13} className="animate-spin text-(--text-muted)" />
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div
          className="flex overflow-hidden rounded"
          style={{ border: "2px solid var(--border-button)" }}
        >
          {(["ngay", "tuan", "thang"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className="cursor-pointer px-3 py-1.5 text-[12px] font-semibold uppercase transition-colors"
              style={{
                background: viewMode === v ? "#ef4444" : "var(--bg-base)",
                color: viewMode === v ? "#fff" : "var(--text-secondary)",
                borderRight:
                  v !== "thang" ? "1px solid var(--border-button)" : "none",
              }}
            >
              {v === "ngay" ? "Ngày" : v === "tuan" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
          aria-label="Lùi"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="cursor-pointer rounded px-3 py-1.5 text-[12px]"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          Hôm nay
        </button>
        <button
          onClick={() => navigate(1)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
          aria-label="Tiến"
        >
          <ChevronRight size={14} />
        </button>

        <span className="ml-1 text-[13px] font-semibold">{headerLabel}</span>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-[13px]"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <Printer size={13} />
          Xuất / In
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        {shifts.map((shift) => (
          <button
            key={shift.key}
            onClick={() =>
              setActiveShift(activeShift === shift.key ? null : shift.key)
            }
            className="flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px]"
            style={{
              border:
                activeShift === shift.key
                  ? `1.5px solid ${shift.border}`
                  : "1.5px solid transparent",
              background:
                activeShift === shift.key ? shift.color : "transparent",
              color: "var(--text-secondary)",
            }}
          >
            <span
              className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
              style={{
                background: shift.color,
                border: `1.5px solid ${shift.border}`,
              }}
            />
            {shift.label}
          </button>
        ))}
        {shifts.length === 0 && (
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            Chưa có định nghĩa ca trong bảng Shift.
          </span>
        )}
      </div>

      <div
        className="overflow-hidden rounded"
        style={{ border: "2px solid var(--border-button)" }}
      >
        {viewMode === "ngay" && renderWeek([currentDate])}
        {viewMode === "tuan" && renderWeek(weekDays)}
        {viewMode === "thang" && renderMonth()}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-[360px] rounded-lg p-5 shadow-xl"
            style={{
              background: "var(--bg-base)",
              border: "2px solid var(--border-button)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[13px] font-bold">Gán ca nhân viên</div>
                <div
                  className="mt-0.5 text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {shiftMap[modal.shiftKey]?.label} · {modal.dateKey}
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                {error}
              </div>
            )}

            <div className="mb-3 space-y-1.5">
              {modalAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded px-2.5 py-1.5"
                  style={{
                    background: "var(--bg-button)",
                    border: "1px solid var(--border-button)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <User size={12} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[12px]">{assignment.staffName}</span>
                  </div>
                  <button
                    onClick={() => removeAssignment(assignment.id)}
                    disabled={isPending}
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Xóa phân công"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {modalAssignments.length === 0 && (
                <div
                  className="py-2 text-center text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Chưa có nhân viên nào được gán
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 min-w-0 rounded px-2.5 py-1.5 text-[12px] outline-none"
                style={{
                  border: "2px solid var(--border-button)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Chọn nhân viên...</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addAssignment}
                disabled={!selectedUserId || isPending}
                className="flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={13} />
                )}
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftSlot({
  shift,
  assignments,
  onClick,
  onRemove,
}: {
  shift: ShiftDef;
  assignments: ShiftAssignmentRow[];
  onClick: () => void;
  onRemove: (id: string) => void;
}) {
  const hasStaff = assignments.length > 0;

  return (
    <div
      onClick={onClick}
      className="group mb-1 cursor-pointer rounded transition-all"
      style={{
        border: `1.5px dashed ${shift.border}`,
        background: hasStaff ? shift.color : "transparent",
        padding: "3px 6px",
        minHeight: 28,
      }}
    >
      {hasStaff ? (
        <div className="space-y-0.5">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between gap-1"
            >
              <span
                className="truncate text-[11px] font-medium"
                style={{ color: shift.textColor }}
              >
                {assignment.staffName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(assignment.id);
                }}
                className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: shift.textColor }}
                aria-label="Xóa phân công"
              >
                <X size={9} />
              </button>
            </div>
          ))}
          <div
            className="mt-0.5 text-[10px] opacity-60"
            style={{ color: shift.textColor }}
          >
            + {shift.label}
          </div>
        </div>
      ) : (
        <div
          className="select-none text-[11px] opacity-40 transition-opacity group-hover:opacity-70"
          style={{ color: shift.textColor }}
        >
          + {shift.label}
        </div>
      )}
    </div>
  );
}
