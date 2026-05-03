/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { createStaff, getStaffDetail, StaffRow } from "./action";
import { Role } from "@/generated/prisma/enums";

type TabKey = "all" | "dang-lam" | "nghi";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const last = parts[parts.length - 1]?.[0] ?? "";
  const second = parts[parts.length - 2]?.[0] ?? "";
  return (second + last).toUpperCase();
}

function Avatar({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <div className="w-9 h-9 rounded-full bg-(--bg-button) border border-(--border-button) flex items-center justify-center text-[11px] font-bold text-(--text-secondary) flex-shrink-0">
      {initials}
    </div>
  );
}

function RoleTag({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    STAFF: "border-[#1a6fb5] text-[#1a6fb5] bg-[rgba(26,111,181,0.06)]",
    MANAGER: "border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.06)]",
  };
  return (
    <span
      className={`inline-block border rounded-[3px] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${map[role]}`}
    >
      {role}
    </span>
  );
}

function ShiftTag({ status }: { status: StaffRow["shiftStatus"] }) {
  const map: Record<StaffRow["shiftStatus"], { label: string; cls: string }> = {
    "dang-lam": {
      label: "Đang làm",
      cls: "border-[#227D52] text-[#227D52] bg-[rgba(34,125,82,0.06)]",
    },
    "nghi-ca": {
      label: "Nghỉ ca",
      cls: "border-(--border-button) text-(--text-muted) bg-(--bg-base)",
    },
    "chua-check-in": {
      label: "Chưa check-in",
      cls: "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]",
    },
    "nghi-phep": {
      label: "Nghỉ phép",
      cls: "border-[#2B6CB0] text-[#2B6CB0] bg-[rgba(43,108,176,0.06)]",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-block border rounded-[3px] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

function CreateModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (staff: StaffRow) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [position, setPosition] = useState<
    "SALES_STAFF" | "INTERN" | "ASSISTANT_MANAGER" | "STORE_MANAGER"
  >("SALES_STAFF");

  // Trigger slide-in sau khi mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleSubmit() {
    if (!name || !email || !phone) return;
    setError("");

    startTransition(async () => {
      const result = await createStaff({
        name,
        email,
        phone,
        role,
        position,
        password: password || "123456",
      });
      if (result.success) {
        const tempRow: StaffRow = {
          id: crypto.randomUUID(),
          name,
          email,
          phone,
          role,
          position,
          isActive: true,
          createdAt: new Date(),
          currentShiftName: null,
          shiftStatus: "nghi-ca",
          daysWorked: 0,
          totalDaysInMonth: 26,
        };
        onSuccess(tempRow);
        handleClose();
      } else {
        setError(result.error ?? "Có lỗi xảy ra");
      }
    });
  }

  const inputCls =
    "w-full px-3 py-2 text-[13px] border-2 border-(--border-button) rounded bg-(--bg-table) text-(--text-primary) outline-none focus:border-[#888] transition-colors";

  const labelCls =
    "block text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide mb-1";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        className={`z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[400px] bg-(--bg-base) border-l border-(--border-button) flex flex-col shadow-xl transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-(--border-button) bg-(--bg-table)">
          <h2 className="text-[13px] font-bold text-(--text-secondary) uppercase tracking-wide">
            Tạo tài khoản nhân viên
          </h2>
          <button
            onClick={handleClose}
            className="text-(--text-muted) border-2 border-(--border-sidebar) p-1 rounded hover:text-(--text-primary) cursor-pointer mt-0.5"
          >
            <X size={14} />{" "}
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded bg-red-50 border border-red-200 text-[12px] text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className={`appearance-none ${inputCls} pr-7 cursor-pointer`}
                >
                  <option value="STAFF">staff</option>
                  <option value="MANAGER">manager</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Chức vụ</label>
              <div className="relative">
                <select
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value as typeof position)
                  }
                  className={`appearance-none ${inputCls} pr-7 cursor-pointer`}
                >
                  <option value="SALES_STAFF">Nhân Viên Bán Hàng</option>
                  <option value="INTERN">Nhân Viên Thử Việc</option>
                  <option value="ASSISTANT_MANAGER">Cửa Hàng Phó</option>
                  <option value="STORE_MANAGER">Cửa Hàng Trưởng</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Mật khẩu tạm</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
            <p className="mt-1.5 text-[11px] text-(--text-muted)">
              Người dùng sẽ bị bắt buộc đổi mật khẩu khi đăng nhập lần đầu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-(--border-button)">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 py-2 text-[13px] border border-(--border-button) text-(--text-secondary) rounded hover:bg-(--bg-button) transition-colors cursor-pointer disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !email || !phone || isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-bold bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </>
  );
}

function StaffDetailModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  if (!data) return null;

  const roleColor =
    localData.role === "MANAGER"
      ? "border border-red-400 text-red-500"
      : "border border-blue-400 text-blue-500";

  const statusColor = "border border-gray-400 text-gray-500";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        className={`z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[395px] flex flex-col shadow-xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--bg-base)", borderLeft: "1px solid var(--border-button)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{
            background: "var(--bg-table)",
            borderColor: "var(--border-button)",
          }}
        >
          <span
            className="text-[11px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Thông tin nhân viên
          </span>
          <button
            onClick={handleClose}
            className="text-(--text-muted) border-2 border-(--border-sidebar) p-1 rounded hover:text-(--text-primary) cursor-pointer mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Employee card */}
          <div
            className="mx-3 mt-3 rounded border p-3 flex items-center gap-3"
            style={{
              borderColor: "var(--color-info)",
              background: "rgba(58,123,212,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
              style={{ background: "#6b7a8d" }}
            >
              {localData.initials || localData.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px] truncate">{localData.name}</div>
              <div className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {localData.email}
              </div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {localData.phone}
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${roleColor}`}
                style={{ background: "var(--bg-base)" }}
              >
                {localData.role}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor}`}
                style={{ background: "var(--bg-base)" }}
              >
                {localData.shiftStatus || "NGHỈ CA"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-3 mt-3 bg-(--bg-table) p-3 border-2 border-(--border-button) border-dashed rounded">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Thống kê tháng này
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Đi làm", value: localData.stats?.daysWorked ?? 0, color: "var(--color-success)" },
                { label: "Còn lại", value: localData.stats?.remaining ?? 26, color: "var(--text-primary)" },
                { label: "Nghỉ phép", value: localData.stats?.leaveUsed ?? 5, color: "var(--color-warning)" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded border text-center py-2"
                  style={{ borderColor: "var(--border-button)", background: "var(--bg-button)" }}
                >
                  <div className="text-[15px] font-bold" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="mx-3 mt-4">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Thông tin cá nhân
            </div>
            <div className="space-y-2">
              {/* Name */}
              <input
                className="w-full rounded border-2 border-(--border-button) px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                style={{
                  borderColor: "var(--border-button)",
                  background: "var(--bg-button)",
                  color: "var(--text-primary)",
                }}
                value={localData.name}
                onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
              />
              {/* Phone */}
              <input
                className="w-full rounded border-2 border-(--border-button) px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                style={{
                  borderColor: "var(--border-button)",
                  background: "var(--bg-button)",
                  color: "var(--text-primary)",
                }}
                value={localData.phone}
                onChange={(e) => setLocalData({ ...localData, phone: e.target.value })}
              />
              {/* Email */}
              <input
                className="w-full rounded border-2 border-(--border-button) px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                style={{
                  borderColor: "var(--border-button)",
                  background: "var(--bg-button)",
                  color: "var(--text-primary)",
                }}
                value={localData.email}
                onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
              />
              {/* Role + Position row */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="w-full rounded border-2 border-(--border-button) px-2 py-2 text-[12px] outline-none focus:border-blue-400 appearance-none"
                  style={{
                    borderColor: "var(--border-button)",
                    background: "var(--bg-button)",
                    color: "var(--text-primary)",
                  }}
                  value={localData.role?.toLowerCase() || "staff"}
                  onChange={(e) => setLocalData({ ...localData, role: e.target.value.toUpperCase() })}
                >
                  <option value="staff">staff</option>
                  <option value="manager">manager</option>
                </select>
                <select
                  className="w-full rounded border-2 border-(--border-button) px-2 py-2 text-[12px] outline-none focus:border-blue-400 appearance-none"
                  style={{
                    borderColor: "var(--border-button)",
                    background: "var(--bg-button)",
                    color: "var(--text-primary)",
                  }}
                  value={localData.position || "Nhân Viên Bán Hàng"}
                  onChange={(e) => setLocalData({ ...localData, position: e.target.value })}
                >
                  <option value="Nhân Viên Bán Hàng">Nhân Viên Bán Hàng</option>
                  <option value="Quản Lý Cửa Hàng">Quản Lý Cửa Hàng</option>
                  <option value="Kho">Kho</option>
                  <option value="Thu Ngân">Thu Ngân</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="mx-3 mt-4 mb-3">
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Lịch sử chấm công gần đây
            </div>
            <div className="space-y-2">
              {(localData.recentShifts || []).map((s: any, i: number) => (
                <div
                  key={i}
                  className="rounded border-2 border-(--border-button) px-3 py-2 flex items-start justify-between"
                  style={{ borderColor: "var(--border-button)", background: "var(--bg-button)" }}
                >
                  <div>
                    <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      {new Date(s.date).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: "var(--text-primary)" }}>
                      {s.shiftName} · IN - · OUT -
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded border mt-0.5 flex-shrink-0"
                    style={{
                      borderColor: "var(--color-success)",
                      color: "var(--color-success)",
                      background: "rgba(58,158,106,0.08)",
                    }}
                  >
                    HOÀN THÀNH
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-3 py-3 flex gap-2 border-t"
          style={{ borderColor: "var(--border-button)", background: "var(--bg-base)" }}
        >
          <button
            onClick={handleClose}
            className="flex-1 rounded border py-2 text-[12px] font-medium transition-colors hover:bg-gray-100"
            style={{ borderColor: "var(--border-button)", color: "var(--text-primary)" }}
          >
            Hủy
          </button>
          <button
            className="flex-1 rounded py-2 text-[12px] font-medium text-white transition-colors"
            style={{ background: "var(--color-info)" }}
            onClick={() => handleClose()}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

export default function StaffClient({
  initialData,
}: {
  initialData: StaffRow[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [shiftFilter, setShift] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  // Optimistic list — server revalidate sẽ sync lại sau
  const [staffList, setStaffList] = useState<StaffRow[]>(initialData);

  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ── KPIs ──
  const kpiTotal = staffList.length;
  const kpiDangLam = staffList.filter(
    (s) => s.shiftStatus === "dang-lam",
  ).length;
  const kpiNghi = staffList.filter((s) => s.shiftStatus === "nghi-ca").length;
  const kpiChuaCheckIn = staffList.filter(
    (s) => s.shiftStatus === "chua-check-in",
  ).length;

  // ── Filtered data ──
  const data = useMemo(() => {
    return staffList.filter((s) => {
      if (
        search &&
        !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.email.toLowerCase().includes(search.toLowerCase()) &&
        !(s.phone ?? "").includes(search)
      )
        return false;
      if (statusFilter && s.role !== statusFilter) return false;
      if (shiftFilter === "dang-lam" && s.shiftStatus !== "dang-lam")
        return false;
      if (shiftFilter === "nghi-ca" && s.shiftStatus !== "nghi-ca")
        return false;
      if (activeTab === "dang-lam" && s.shiftStatus !== "dang-lam")
        return false;
      if (activeTab === "nghi" && s.shiftStatus !== "nghi-ca") return false;
      return true;
    });
  }, [search, statusFilter, shiftFilter, activeTab, staffList]);

  // ── Select ──
  const allSelected = data.length > 0 && data.every((s) => selected.has(s.id));
  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        data.forEach((s) => n.delete(s.id));
        return n;
      });
    } else {
      setSelected((prev) => {
        const n = new Set(prev);
        data.forEach((s) => n.add(s.id));
        return n;
      });
    }
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "dang-lam", label: "Đang làm" },
    { key: "nghi", label: "Nghỉ" },
  ];

  const POSITION_LABEL = {
    SALES_STAFF: "Nhân viên bán hàng",
    INTERN: "Nhân viên thử việc",
    ASSISTANT_MANAGER: "Cửa hàng phó",
    STORE_MANAGER: "Cửa hàng trưởng",
  };

  return (
    <div className="p-6 space-y-6 bg-(--bg-base) min-h-screen">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onSuccess={(newStaff) => setStaffList((prev) => [...prev, newStaff])}
        />
      )}

      {showDetailModal && selectedStaff && (
        <StaffDetailModal
          data={selectedStaff}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* ── Page header ── */}
      <div>
        <h1 className="text-md font-bold text-gray-900">QUẢN LÝ NHÂN SỰ</h1>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <KpiCard
          title="Tổng nhân viên"
          value={String(kpiTotal)}
          sub="đang theo dõi"
          deltaType="up"
          icon={<Users size={14} />}
        />
        <KpiCard
          title="Đang làm ca này"
          value={String(kpiDangLam)}
          sub="có mặt tại cửa hàng"
          icon={<UserCheck size={14} />}
        />
        <KpiCard
          title="Nghỉ hôm nay"
          value={String(kpiNghi)}
          sub="đã xác nhận nghỉ"
          icon={<UserX size={14} />}
        />
        <KpiCard
          title="Chưa check-in"
          value={String(kpiChuaCheckIn)}
          sub="cần nhắc nhở"
          icon={<Clock size={14} />}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
          />
          <input
            type="text"
            placeholder="Tìm tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none focus:border-[#888] w-56"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none cursor-pointer"
          >
            <option value="">Role</option>
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
        </div>

        <div className="relative">
          <select
            value={shiftFilter}
            onChange={(e) => setShift(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none cursor-pointer"
          >
            <option value="">Ca làm</option>
            <option value="dang-lam">Đang làm</option>
            <option value="nghi-ca">Nghỉ ca</option>
            <option value="nghi-ca">Nghỉ phép</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Tạo tài khoản
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b-2 border-(--border-button) mb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#C0392B] text-[#C0392B] font-medium"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="border-2 border-(--border-button) rounded overflow-hidden mt-2 font-mono">
        <table className="w-full border-collapse">
          <thead className="bg-(--bg-table)">
            <tr>
              <th className="w-9 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-[#C0392B] cursor-pointer"
                />
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Nhân viên
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Role
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Chức vụ
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Ca hiện tại
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Điện thoại
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((staff) => (
              <tr
                key={staff.id}
                onClick={async () => {
                  const data = await getStaffDetail(staff.id);
                  setSelectedStaff(data);
                  setShowDetailModal(true);
                }}
                className="border-t border-[#F0EDE8] hover:bg-(--bg-table) transition-colors"
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(staff.id)}
                    onChange={() => toggleOne(staff.id)}
                    className="w-3.5 h-3.5 accent-[#C0392B] cursor-pointer"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={staff.name} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] text-(--text-primary) font-medium">
                        {staff.name}
                      </span>
                      <span className="text-[11px] text-(--text-muted)">
                        {staff.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <RoleTag role={staff.role} />
                </td>

                <td className="px-3 py-3 text-(--text-secondary)">
                  {POSITION_LABEL[staff.position]}
                </td>

                <td className="px-3 py-3">
                  {staff.currentShiftName ? (
                    <span className="text-[12px] text-(--text-secondary)">
                      {staff.currentShiftName}
                    </span>
                  ) : (
                    <span className="text-(--text-muted) text-[12px]">-</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <ShiftTag status={staff.shiftStatus} />
                </td>

                <td className="px-3 py-3">
                  <span className="text-[12px] font-mono text-(--text-secondary)">
                    {staff.phone ?? "-"}
                  </span>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-(--text-muted) text-[13px]"
                >
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-3.5 py-2.5 text-[12px] text-(--text-muted) border-t border-[#F0EDE8]">
          Hiển thị {data.length} / {staffList.length} nhân viên
          {selected.size > 0 && (
            <span className="ml-3 text-(--text-secondary)">
              · {selected.size} đã chọn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
