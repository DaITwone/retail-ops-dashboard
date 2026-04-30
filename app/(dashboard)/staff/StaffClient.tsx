/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  Phone,
  Mail,
  XCircle,
  Loader2,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { createStaff, StaffRow } from "./action";
import { Role } from "@/generated/prisma/enums";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | "dang-lam" | "nghi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  const last = parts[parts.length - 1]?.[0] ?? "";
  const second = parts[parts.length - 2]?.[0] ?? "";
  return (second + last).toUpperCase();
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!name || !email || !phone) return;
    setError("");

    startTransition(async () => {
      const result = await createStaff({
        name,
        email,
        phone,
        role,
        password: password || "123456",
      });
      if (result.success) {
        // Tạo StaffRow tạm để update UI ngay, server sẽ revalidate sau
        const tempRow: StaffRow = {
          id: crypto.randomUUID(),
          name,
          email,
          phone,
          role,
          isActive: true,
          createdAt: new Date(),
          currentShiftName: null,
          shiftStatus: "nghi-ca",
          daysWorked: 0,
          totalDaysInMonth: 26,
        };
        onSuccess(tempRow);
        onClose();
      } else {
        setError(result.error ?? "Có lỗi xảy ra");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white border-2 border-(--border-button) rounded-lg shadow-xl w-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-button)">
          <div>
            <h2 className="text-[14px] font-bold text-(--text-primary)">
              TẠO TÀI KHOẢN
            </h2>
            <p className="text-[11px] text-(--text-muted) mt-0.5">
              Thêm nhân viên mới vào hệ thống · mật khẩu mặc định:{" "}
              <span className="font-mono font-semibold">123456</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {error && (
            <div className="px-3 py-2 rounded bg-red-50 border border-red-200 text-[12px] text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">
              Họ tên *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@winmart.com"
                className="w-full pl-7 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">
                Số điện thoại *
              </label>
              <div className="relative">
                <Phone
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full pl-7 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">
                Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="appearance-none w-full pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none cursor-pointer"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">
              Mật khẩu{" "}
              <span className="font-normal normal-case">
                (để trống = dùng 123456)
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-(--border-button)">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-1.5 text-[13px] border-2 border-(--border-button) text-(--text-secondary) rounded hover:bg-(--bg-button) transition-colors cursor-pointer disabled:opacity-40"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !email || !phone || isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            {isPending ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </div>
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

  return (
    <div className="p-6 space-y-6 bg-(--bg-base) min-h-screen">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onSuccess={(newStaff) => setStaffList((prev) => [...prev, newStaff])}
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
                Ca hiện tại
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide">
                Ngày làm
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
                className="border-t border-[#F0EDE8] hover:bg-[rgba(245,242,237,0.6)] transition-colors"
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
                  <span className="text-[13px] font-mono text-(--text-primary)">
                    {staff.daysWorked}
                    <span className="text-(--text-muted)">
                      {" "}
                      / {staff.totalDaysInMonth}
                    </span>
                  </span>
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
