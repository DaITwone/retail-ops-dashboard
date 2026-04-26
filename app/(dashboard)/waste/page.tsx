"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  TrendingDown,
  User,
  AlertCircle,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";

// ─── Types ────────────────────────────────────────────────────────────────────

type WasteStatus = "cho-duyet" | "da-duyet" | "tu-choi";
type TabKey = "all" | WasteStatus;
type ReasonKey = "" | "het-han" | "hong" | "mat-pham-chat" | "khac";

interface WasteRecord {
  id: number;
  productName: string;
  sku: string;
  reason: string;
  quantity: number;
  unit: string;
  value: number; // VND
  createdBy: string;
  createdAt: string; // "dd/mm/yyyy hh:mm"
  status: WasteStatus;
  note?: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_WASTE: WasteRecord[] = [
  {
    id: 1,
    productName: "Ba rọi heo MEATDeli 500g",
    sku: "MEAT-014",
    reason: "Hết hạn",
    quantity: 5,
    unit: "khay",
    value: 475000,
    createdBy: "Nguyễn Văn A",
    createdAt: "20/4/2026 08:12",
    status: "cho-duyet",
  },
  {
    id: 2,
    productName: "Cải bó xôi WinEco 300g",
    sku: "WIN-003",
    reason: "Hỏng / Dập nát",
    quantity: 12,
    unit: "gói",
    value: 216000,
    createdBy: "Trần Thị B",
    createdAt: "19/4/2026 14:35",
    status: "da-duyet",
  },
  {
    id: 3,
    productName: "Nước mắm Ajinomoto 500ml",
    sku: "AJI-001",
    reason: "Mất phẩm chất",
    quantity: 2,
    unit: "chai",
    value: 68000,
    createdBy: "Lê Văn C",
    createdAt: "18/4/2026 10:00",
    status: "tu-choi",
    note: "Cần kiểm tra lại thực tế",
  },
  {
    id: 4,
    productName: "Rau muống WinEco 300g",
    sku: "WIN-007",
    reason: "Hỏng / Dập nát",
    quantity: 8,
    unit: "bó",
    value: 96000,
    createdBy: "Nguyễn Văn A",
    createdAt: "18/4/2026 09:20",
    status: "da-duyet",
  },
  {
    id: 5,
    productName: "Thịt bò Úc Wagyu 300g",
    sku: "BEEF-001",
    reason: "Hết hạn",
    quantity: 3,
    unit: "khay",
    value: 870000,
    createdBy: "Phạm Thị D",
    createdAt: "17/4/2026 16:45",
    status: "cho-duyet",
  },
  {
    id: 6,
    productName: "Cà rốt WinEco 500g",
    sku: "WIN-011",
    reason: "Hỏng / Dập nát",
    quantity: 4,
    unit: "túi",
    value: 52000,
    createdBy: "Trần Thị B",
    createdAt: "17/4/2026 11:10",
    status: "da-duyet",
  },
  {
    id: 7,
    productName: "Sườn non heo MEATDeli 500g",
    sku: "MEAT-003",
    reason: "Khác",
    quantity: 1,
    unit: "khay",
    value: 95000,
    createdBy: "Lê Văn C",
    createdAt: "16/4/2026 13:00",
    status: "da-duyet",
    note: "Bao bì bị rách khi vận chuyển",
  },
];

const REASON_OPTIONS: { value: ReasonKey; label: string }[] = [
  { value: "", label: "Lý do" },
  { value: "het-han", label: "Hết hạn" },
  { value: "hong", label: "Hỏng / Dập nát" },
  { value: "mat-pham-chat", label: "Mất phẩm chất" },
  { value: "khac", label: "Khác" },
];

const REASON_LABEL_MAP: Record<string, ReasonKey> = {
  "Hết hạn": "het-han",
  "Hỏng / Dập nát": "hong",
  "Mất phẩm chất": "mat-pham-chat",
  "Khác": "khac",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusTag({ status }: { status: WasteStatus }) {
  const map: Record<WasteStatus, { label: string; className: string; icon: React.ReactNode }> = {
    "cho-duyet": {
      label: "Chờ duyệt",
      className: "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]",
      icon: <Clock size={10} />,
    },
    "da-duyet": {
      label: "Đã duyệt",
      className: "border-[#227D52] text-[#227D52] bg-[rgba(34,125,82,0.06)]",
      icon: <CheckCircle size={10} />,
    },
    "tu-choi": {
      label: "Từ chối",
      className: "border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.06)]",
      icon: <XCircle size={10} />,
    },
  };
  const { label, className, icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-[3px] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

function ReasonTag({ reason }: { reason: string }) {
  const colorMap: Record<string, string> = {
    "Hết hạn": "border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.06)]",
    "Hỏng / Dập nát": "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]",
    "Mất phẩm chất": "border-[#7B4FC8] text-[#7B4FC8] bg-[rgba(123,79,200,0.06)]",
    "Khác": "border-(--border-button) text-(--text-muted) bg-(--bg-base)",
  };
  const cls = colorMap[reason] ?? colorMap["Khác"];
  return (
    <span className={`inline-block border rounded-[3px] px-1.5 py-0.5 text-[11px] whitespace-nowrap ${cls}`}>
      {reason}
    </span>
  );
}

// ─── Create Phiếu Modal ────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
  onSubmit: (record: Omit<WasteRecord, "id" | "status" | "createdAt">) => void;
}

function CreateModal({ onClose, onSubmit }: CreateModalProps) {
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [reason, setReason] = useState<ReasonKey>("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("khay");
  const [value, setValue] = useState(0);
  const [createdBy, setCreatedBy] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit() {
    if (!productName || !reason || !createdBy) return;
    onSubmit({ productName, sku, reason: REASON_OPTIONS.find(r => r.value === reason)?.label ?? reason, quantity, unit, value, createdBy, note });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white border-2 border-(--border-button) rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-button)">
          <div>
            <h2 className="text-[14px] font-bold text-(--text-primary)">TẠO PHIẾU HỦY</h2>
            <p className="text-[11px] text-(--text-muted) mt-0.5">Phiếu sẽ chờ manager duyệt trước khi trừ tồn</p>
          </div>
          <button
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="VD: MEAT-014"
                className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888] font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Lý do *</label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as ReasonKey)}
                  className="appearance-none w-full pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none cursor-pointer"
                >
                  <option value="">Chọn lý do...</option>
                  {REASON_OPTIONS.filter(r => r.value).map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Số lượng</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Đơn vị</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="khay, gói, chai..."
                className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Giá trị (đ)</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Người tạo *</label>
            <div className="relative">
              <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
              <input
                type="text"
                value={createdBy}
                onChange={e => setCreatedBy(e.target.value)}
                placeholder="Họ tên người tạo phiếu..."
                className="w-full pl-7 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-(--text-muted) uppercase mb-1">Ghi chú</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Mô tả thêm tình trạng sản phẩm..."
              rows={2}
              className="w-full px-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded outline-none focus:border-[#888] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-(--border-button)">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] border-2 border-(--border-button) text-(--text-secondary) rounded hover:bg-(--bg-button) transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!productName || !reason || !createdBy}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} />
            Tạo phiếu hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function WastePage() {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ReasonKey>("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState<WasteRecord[]>(MOCK_WASTE);

  // ── Today's date (dd/mm/yyyy) ──
  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  // ── KPIs ──
  const todayRecords = records.filter(r => r.createdAt.startsWith(today.split("/").reverse().join("/").slice(2).replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3").split("/")[0] ?? "") || r.createdAt.includes(today));
  const todayValue = todayRecords.reduce((s, r) => s + r.value, 0);

  // Records this week (just use all for demo)
  const weekCount = records.filter(r => r.status !== "tu-choi").length;

  // Top hủy nhiều nhất by product
  const topProduct = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => { map[r.productName] = (map[r.productName] ?? 0) + r.quantity; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  }, [records]);

  // ── Tab counts ──
  const countTab = (key: WasteStatus) => records.filter(r => r.status === key).length;

  // ── Filtered data ──
  const data = useMemo(() => {
    return records.filter(r => {
      if (search && !r.productName.toLowerCase().includes(search.toLowerCase()) && !r.sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (reasonFilter && REASON_LABEL_MAP[r.reason] !== reasonFilter) return false;
      if (activeTab !== "all" && r.status !== activeTab) return false;
      return true;
    });
  }, [search, reasonFilter, activeTab, records]);

  // ── Select ──
  const allSelected = data.length > 0 && data.every(r => selected.has(r.id));
  function toggleAll() {
    if (allSelected) setSelected(prev => { const n = new Set(prev); data.forEach(r => n.delete(r.id)); return n; });
    else setSelected(prev => { const n = new Set(prev); data.forEach(r => n.add(r.id)); return n; });
  }
  function toggleOne(id: number) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // ── Add record ──
  function handleCreate(record: Omit<WasteRecord, "id" | "status" | "createdAt">) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setRecords(prev => [{ ...record, id: prev.length + 1, status: "cho-duyet", createdAt }, ...prev]);
  }

  const TABS: { key: TabKey; label: string; badge?: number }[] = [
    { key: "all", label: "Tất cả", badge: records.length },
    { key: "cho-duyet", label: "Chờ duyệt", badge: countTab("cho-duyet") },
    { key: "da-duyet", label: "Đã duyệt", badge: countTab("da-duyet") },
    { key: "tu-choi", label: "Từ chối", badge: countTab("tu-choi") },
  ];

  return (
    <div className="p-6 space-y-6 bg-(--bg-base) min-h-screen">
      {showModal && <CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}

      {/* ── Page header ── */}
      <div>
        <h1 className="text-md font-bold text-gray-900">XỬ LÝ HÀNG HỎNG HỦY</h1>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <KpiCard
          title="Giá trị hủy hôm nay"
          value={formatVND(todayValue)}
          deltaType={Number(todayValue) > 0 ? "down" : "up"}
          icon={<TrendingDown size={14} />}
        />
        <KpiCard
          title="Records tuần này"
          value={String(weekCount)}
          icon={<Trash2 size={14} />}
        />
        <KpiCard
          title="Top hủy nhiều nhất"
          value={topProduct === "—" ? "—" : topProduct.length > 28 ? topProduct.slice(0, 28) + "…" : topProduct}
          icon={<AlertCircle size={14} />}
          deltaType="down"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
          <input
            type="text"
            placeholder="Tìm sản phẩm, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none focus:border-[#888] w-44"
          />
        </div>

        {/* Reason filter */}
        <div className="relative">
          <select
            value={reasonFilter}
            onChange={e => setReasonFilter(e.target.value as ReasonKey)}
            className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none cursor-pointer"
          >
            {REASON_OPTIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold bg-[#C0392B] text-white rounded hover:bg-[#a93226] transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Tạo phiếu hủy
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b-2 border-(--border-button) mb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "border-[#C0392B] text-[#C0392B] font-medium"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`inline-flex items-center justify-center rounded-full text-[10px] font-semibold px-1.5 min-w-[18px] leading-[18px] ${
                  activeTab === tab.key
                    ? "bg-[#C0392B] text-white"
                    : "bg-(--bg-button) text-(--text-muted)"
                }`}
              >
                {tab.badge}
              </span>
            )}
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
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Sản phẩm</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Lý do</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">SL</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Giá trị</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Người tạo</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Thời gian</th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map(record => (
              <tr
                key={record.id}
                className="border-t border-[#F0EDE8] hover:bg-[rgba(245,242,237,0.6)] transition-colors"
              >
                {/* Checkbox */}
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(record.id)}
                    onChange={() => toggleOne(record.id)}
                    className="w-3.5 h-3.5 accent-[#C0392B] cursor-pointer"
                  />
                </td>

                {/* Product */}
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-(--text-primary)">{record.productName}</span>
                    <span className="text-[11px] font-mono text-(--text-muted)">{record.sku}</span>
                    {record.note && (
                      <span className="text-[11px] text-(--text-muted) italic">{record.note}</span>
                    )}
                  </div>
                </td>

                {/* Reason */}
                <td className="px-3 py-3">
                  <ReasonTag reason={record.reason} />
                </td>

                {/* Quantity */}
                <td className="px-3 py-3">
                  <span className="text-[13px] font-bold text-(--text-primary)">
                    {record.quantity} {record.unit}
                  </span>
                </td>

                {/* Value */}
                <td className="px-3 py-3">
                  <span className="text-[13px] font-mono text-[#C0392B] font-semibold">
                    {formatVND(record.value)}
                  </span>
                </td>

                {/* Created by */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-(--bg-button) flex items-center justify-center text-[9px] font-bold text-(--text-muted) flex-shrink-0">
                      {record.createdBy.split(" ").pop()?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-[12px] text-(--text-secondary)">{record.createdBy}</span>
                  </div>
                </td>

                {/* Time */}
                <td className="px-3 py-3">
                  <span className="text-[12px] font-mono text-(--text-muted) whitespace-nowrap">
                    {record.createdAt}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  <StatusTag status={record.status} />
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-(--text-muted) text-[13px]">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-3.5 py-2.5 text-[12px] text-(--text-muted) border-t border-[#F0EDE8]">
          Hiển thị {data.length} / {records.length} records
          {selected.size > 0 && (
            <span className="ml-3 text-(--text-secondary)">· {selected.size} đã chọn</span>
          )}
        </div>
      </div>
    </div>
  );
}