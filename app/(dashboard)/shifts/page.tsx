"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Plus,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "ngay" | "tuan" | "thang";

interface ShiftDef {
  key: string;
  label: string;
  startHour: number; // 0-23
  endHour: number;
  color: string;       // bg color (light)
  border: string;      // border color (light)
  textColor: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
}

interface Assignment {
  id: string;
  dateKey: string; // "YYYY-MM-DD"
  shiftKey: string;
  staffName: string;
}

// ─── Shift definitions ────────────────────────────────────────────────────────

const SHIFTS: ShiftDef[] = [
  {
    key: "ca-rau",
    label: "Ca rau 05–13",
    startHour: 5,
    endHour: 13,
    color: "rgba(234,243,222,0.9)",   // green-50, rất nhạt
    border: "#C0DD97",                 // green-100
    textColor: "#3B6D11",              // green-600
    darkBg: "rgba(39,80,10,0.15)",
    darkBorder: "#639922",
    darkText: "#C0DD97",
  },
  {
    key: "ca-sang",
    label: "Ca sáng 06–14",
    startHour: 6,
    endHour: 14,
    color: "rgba(192,221,151,0.55)",  // green-100, đậm hơn một bậc
    border: "#97C459",                 // green-200
    textColor: "#27500A",              // green-800
    darkBg: "rgba(39,80,10,0.3)",
    darkBorder: "#97C459",
    darkText: "#EAF3DE",
  },
  {
    key: "ca-gay",
    label: "Ca gãy 06–22",
    startHour: 6,
    endHour: 22,
    color: "rgba(255,243,205,0.9)",
    border: "#E6C96A",
    textColor: "#8a6800",
    darkBg: "rgba(255,243,205,0.1)",
    darkBorder: "#8a6800",
    darkText: "#d4a800",
  },
  {
    key: "ca-chieu",
    label: "Ca chiều 14–22",
    startHour: 14,
    endHour: 22,
    color: "rgba(255,235,235,0.9)",
    border: "#F0B0B0",
    textColor: "#9a2a2a",
    darkBg: "rgba(255,235,235,0.07)",
    darkBorder: "#7a2a2a",
    darkText: "#e08080",
  },
  {
    key: "hc01",
    label: "HC01 08–17",
    startHour: 8,
    endHour: 17,
    color: "rgba(220,235,255,0.9)",
    border: "#90B8E8",
    textColor: "#1a4a88",
    darkBg: "rgba(220,235,255,0.07)",
    darkBorder: "#2a5a99",
    darkText: "#6aadff",
  },
  {
    key: "hc02",
    label: "HC02 09–18",
    startHour: 9,
    endHour: 18,
    color: "rgba(220,235,255,0.9)",
    border: "#90B8E8",
    textColor: "#1a4a88",
    darkBg: "rgba(220,235,255,0.07)",
    darkBorder: "#2a5a99",
    darkText: "#6aadff",
  },
];

const SHIFT_MAP = Object.fromEntries(SHIFTS.map((s) => [s.key, s]));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // make Mon start
  return addDays(d, diff);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 05–23

// ─── Slot row heights: each slot occupies hours from startHour to endHour
// We render one "slot row" per shift per column. They are pinned to hour rows via CSS grid.

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("tuan");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 20)); // 20/04/2026
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeShift, setActiveShift] = useState<string | null>(null);

  // Modal
  const [modal, setModal] = useState<{ dateKey: string; shiftKey: string } | null>(null);
  const [staffInput, setStaffInput] = useState("");

  // ── Navigation ──
  function navigate(dir: -1 | 1) {
    if (viewMode === "ngay") setCurrentDate((d) => addDays(d, dir));
    else if (viewMode === "tuan") setCurrentDate((d) => addDays(d, dir * 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // ── Week days ──
  const weekDays = useMemo(() => {
    const mon = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
  }, [currentDate]);

  // ── Month grid ──
  const monthWeeks = useMemo(() => {
    const first = startOfMonth(currentDate);
    const monOfFirst = startOfWeek(first);
    const weeks: Date[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(monOfFirst, w * 7 + d));
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentDate]);

  // ── Header label ──
  const headerLabel = useMemo(() => {
    if (viewMode === "ngay") {
      const d = currentDate;
      const wd = DAY_LABELS[(d.getDay() + 6) % 7];
      return `${wd} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    if (viewMode === "tuan") {
      const mon = weekDays[0];
      const sun = weekDays[6];
      return `T2 ${mon.getDate()}/${mon.getMonth() + 1} – CN ${sun.getDate()}/${sun.getMonth() + 1} / ${sun.getFullYear()}`;
    }
    // thang
    const months = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, currentDate, weekDays]);

  // ── Assignment helpers ──
  function getAssignments(dateKey: string, shiftKey: string) {
    return assignments.filter((a) => a.dateKey === dateKey && a.shiftKey === shiftKey);
  }

  function openModal(dateKey: string, shiftKey: string) {
    setModal({ dateKey, shiftKey });
    setStaffInput("");
  }

  function closeModal() {
    setModal(null);
    setStaffInput("");
  }

  function addAssignment() {
    if (!modal || !staffInput.trim()) return;
    setAssignments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        dateKey: modal.dateKey,
        shiftKey: modal.shiftKey,
        staffName: staffInput.trim(),
      },
    ]);
    setStaffInput("");
  }

  function removeAssignment(id: string) {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleCellClick(dateKey: string, shiftKey: string) {
    if (activeShift) {
      // Quick assign — open modal for this combo
      openModal(dateKey, shiftKey);
    } else {
      openModal(dateKey, shiftKey);
    }
  }

  // ─── Render: Tuần view (main) ──────────────────────────────────────────────

  function renderWeek(days: Date[]) {
    const todayKey = formatDateKey(new Date());
    const colCount = days.length;

    return (
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <table className="w-full border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr>
              {/* Hour col */}
              <th
                className="sticky top-0 z-20 w-16 text-left text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  background: "var(--bg-table)",
                  borderBottom: "2px solid var(--border-button)",
                  padding: "10px 8px",
                  color: "var(--text-muted)",
                }}
              >
                GIỜ
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
                    <div
                      className="text-[11px] font-normal mt-0.5"
                      style={{ color: isToday ? "#ef4444" : "var(--text-muted)" }}
                    >
                      {day.getDate()}/{day.getMonth() + 1}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => {
              // Find shifts that START at this hour
              const shiftsAtHour = SHIFTS.filter((s) => s.startHour === hour);

              return (
                <React.Fragment key={hour}>
                  {/* Main hour row */}
                  <tr>
                    <td
                      className="align-top text-[11px] font-mono"
                      style={{
                        padding: "6px 8px 0",
                        color: [5, 8, 9, 14].includes(hour) ? "#ef4444" : "var(--text-muted)",
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
                            padding: shiftsAtHour.length > 0 ? "4px 4px 0" : "0",
                            verticalAlign: "top",
                            minHeight: shiftsAtHour.length > 0 ? undefined : 28,
                            height: shiftsAtHour.length > 0 ? undefined : 28,
                          }}
                        >
                          {shiftsAtHour.map((shift) => {
                            const existing = getAssignments(dk, shift.key);
                            return (
                              <ShiftSlot
                                key={shift.key}
                                shift={shift}
                                dateKey={dk}
                                assignments={existing}
                                onClick={() => handleCellClick(dk, shift.key)}
                                onRemove={removeAssignment}
                              />
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ─── Render: Ngày view ─────────────────────────────────────────────────────

  function renderDay() {
    return renderWeek([currentDate]);
  }

  // ─── Render: Tháng view ────────────────────────────────────────────────────

  function renderMonth() {
    const todayKey = formatDateKey(new Date());
    const currMonth = currentDate.getMonth();
    return (
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {DAY_LABELS.map((lbl) => (
                <th
                  key={lbl}
                  className="text-center text-[12px] font-semibold uppercase tracking-wide"
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
                {week.map((day, di) => {
                  const dk = formatDateKey(day);
                  const isToday = dk === todayKey;
                  const inMonth = day.getMonth() === currMonth;
                  const dayAssignments = assignments.filter((a) => a.dateKey === dk);
                  const uniqueShifts = [...new Set(dayAssignments.map((a) => a.shiftKey))];

                  return (
                    <td
                      key={dk}
                      style={{
                        border: "1px solid var(--border-button)",
                        verticalAlign: "top",
                        padding: "6px",
                        height: 120,
                        background: inMonth ? "transparent" : "rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        className="text-[12px] font-semibold mb-1.5"
                        style={{
                          color: isToday ? "#ef4444" : inMonth ? "var(--text-primary)" : "var(--text-muted)",
                        }}
                      >
                        {isToday ? (
                          <span
                            className="inline-flex items-center justify-center rounded-full text-white"
                            style={{ background: "#ef4444", width: 22, height: 22, fontSize: 11 }}
                          >
                            {day.getDate()}
                          </span>
                        ) : (
                          day.getDate()
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {uniqueShifts.slice(0, 3).map((sk) => {
                          const shift = SHIFT_MAP[sk];
                          const count = dayAssignments.filter((a) => a.shiftKey === sk).length;
                          return (
                            <div
                              key={sk}
                              className="text-[10px] rounded px-1 py-0.5 truncate"
                              style={{
                                background: shift.color,
                                border: `1px solid ${shift.border}`,
                                color: shift.textColor,
                              }}
                            >
                              {shift.label.split(" ")[0]} {shift.label.split(" ")[1]} · {count} NV
                            </div>
                          );
                        })}
                        {uniqueShifts.length > 3 && (
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
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

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div
      className="p-6 space-y-6 min-h-screen"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-md font-bold" style={{ color: "var(--text-primary)" }}>
          LỊCH LÀM VIỆC
        </h1>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          Click ô khung giờ để gán ca cho nhân viên · xem theo{" "}
          <span
            className="cursor-pointer underline"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setViewMode("ngay")}
          >
            Ngày
          </span>{" "}
          ·{" "}
          <span
            className="cursor-pointer underline"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setViewMode("tuan")}
          >
            Tuần
          </span>{" "}
          ·{" "}
          <span
            className="cursor-pointer underline"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setViewMode("thang")}
          >
            Tháng
          </span>
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* View toggle */}
        <div
          className="flex rounded overflow-hidden"
          style={{ border: "2px solid var(--border-button)" }}
        >
          {(["ngay", "tuan", "thang"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className="px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide cursor-pointer transition-colors"
              style={{
                background: viewMode === v ? "#ef4444" : "var(--bg-base)",
                color: viewMode === v ? "#fff" : "var(--text-secondary)",
                borderRight: v !== "thang" ? "1px solid var(--border-button)" : "none",
              }}
            >
              {v === "ngay" ? "NGÀY" : v === "tuan" ? "TUẦN" : "THÁNG"}
            </button>
          ))}
        </div>

        {/* Nav */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-7 h-7 rounded cursor-pointer transition-colors"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={goToday}
          className="px-3 py-1.5 text-[12px] rounded cursor-pointer transition-colors"
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
          className="flex items-center justify-center w-7 h-7 rounded cursor-pointer transition-colors"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <ChevronRight size={14} />
        </button>

        {/* Date label */}
        <span className="text-[13px] font-semibold ml-1" style={{ color: "var(--text-primary)" }}>
          {headerLabel}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded cursor-pointer transition-colors"
          style={{
            border: "2px solid var(--border-button)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
          }}
        >
          <Upload size={13} />
          Xuất / In
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {SHIFTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveShift(activeShift === s.key ? null : s.key)}
            className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1.5 py-0.5 transition-all"
            style={{
              border: activeShift === s.key ? `1.5px solid ${s.border}` : "1.5px solid transparent",
              background: activeShift === s.key ? s.color : "transparent",
              color: "var(--text-secondary)",
            }}
          >
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: s.color, border: `1.5px solid ${s.border}` }}
            />
            {s.label}
          </button>
        ))}
        <span
          className="text-[11px] px-2 py-0.5 rounded cursor-pointer"
          style={{
            border: "1.5px dashed #90B8E8",
            color: "#1a4a88",
            background: "rgba(144,184,232,0.08)",
          }}
        >
          Click ô → gán ca
        </span>
      </div>

      {/* Calendar body */}
      <div
        className="rounded overflow-hidden"
        style={{ border: "2px solid var(--border-button)" }}
      >
        {viewMode === "ngay" && renderDay()}
        {viewMode === "tuan" && renderWeek(weekDays)}
        {viewMode === "thang" && renderMonth()}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={closeModal}
        >
          <div
            className="rounded-lg shadow-xl p-5 w-80"
            style={{ background: "var(--bg-base)", border: "2px solid var(--border-button)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Gán ca nhân viên
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {SHIFT_MAP[modal.shiftKey]?.label} · {modal.dateKey}
                </div>
              </div>
              <button onClick={closeModal} style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Existing assignments */}
            <div className="mb-3 space-y-1.5">
              {getAssignments(modal.dateKey, modal.shiftKey).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded px-2.5 py-1.5"
                  style={{ background: "var(--bg-button)", border: "1px solid var(--border-button)" }}
                >
                  <div className="flex items-center gap-2">
                    <User size={12} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[12px]" style={{ color: "var(--text-primary)" }}>
                      {a.staffName}
                    </span>
                  </div>
                  <button onClick={() => removeAssignment(a.id)} style={{ color: "var(--text-muted)" }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {getAssignments(modal.dateKey, modal.shiftKey).length === 0 && (
                <div className="text-[12px] text-center py-2" style={{ color: "var(--text-muted)" }}>
                  Chưa có nhân viên nào được gán
                </div>
              )}
            </div>

            {/* Add staff */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên nhân viên..."
                value={staffInput}
                onChange={(e) => setStaffInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAssignment()}
                autoFocus
                className="flex-1 px-2.5 py-1.5 text-[12px] rounded outline-none"
                style={{
                  border: "2px solid var(--border-button)",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={addAssignment}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold rounded cursor-pointer"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                }}
              >
                <Plus size={13} />
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ShiftSlot sub-component ──────────────────────────────────────────────────

function ShiftSlot({
  shift,
  dateKey,
  assignments,
  onClick,
  onRemove,
}: {
  shift: ShiftDef;
  dateKey: string;
  assignments: Assignment[];
  onClick: () => void;
  onRemove: (id: string) => void;
}) {
  const hasStaff = assignments.length > 0;

  return (
    <div
      onClick={onClick}
      className="mb-1 rounded cursor-pointer transition-all group"
      style={{
        border: `1.5px dashed ${shift.border}`,
        background: hasStaff ? shift.color : "transparent",
        padding: "3px 6px",
        minHeight: 28,
      }}
    >
      {hasStaff ? (
        <div className="space-y-0.5">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-1"
            >
              <span
                className="text-[11px] truncate font-medium"
                style={{ color: shift.textColor }}
              >
                {a.staffName}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(a.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                style={{ color: shift.textColor }}
              >
                <X size={9} />
              </button>
            </div>
          ))}
          <div
            className="text-[10px] opacity-60 mt-0.5"
            style={{ color: shift.textColor }}
          >
            + {shift.label.split(" ")[0]} {shift.label.split(" ")[1]}
          </div>
        </div>
      ) : (
        <div
          className="text-[11px] opacity-40 group-hover:opacity-70 transition-opacity select-none"
          style={{ color: shift.textColor !== "#555" ? shift.textColor : "var(--text-muted)" }}
        >
          + {shift.label.split(" ")[0]} {shift.label.split(" ")[1]}
        </div>
      )}
    </div>
  );
}