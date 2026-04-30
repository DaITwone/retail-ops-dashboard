"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Search,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Upload,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import Image from "next/image";
import type { InventoryProduct, StockStatus } from "./action";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | StockStatus;
type SortCol = "name" | "stock" | null;

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProductThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string;
}) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-9 h-9 rounded flex items-center justify-center bg-(--bg-button) text-[--text-muted] text-[11px] font-bold font-mono flex-shrink-0 overflow-hidden relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-cover rounded"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function StatusTag({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { label: string; className: string }> = {
    "het-hang": {
      label: "Hết hàng",
      className: "border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.06)]",
    },
    "sap-het": {
      label: "Sắp hết",
      className: "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]",
    },
    "sap-het-han": {
      label: "Sắp hết hạn",
      className: "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]",
    },
    ok: {
      label: "Còn hàng",
      className: "border-[#227D52] text-[#227D52] bg-[rgba(34,125,82,0.06)]",
    },
  };
  const { label, className } = map[status];
  return (
    <span
      className={`inline-block border rounded-[3px] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

function SortIcon({
  col,
  current,
  asc,
}: {
  col: string;
  current: SortCol;
  asc: boolean;
}) {
  if (current !== col) return <ArrowUpDown size={12} className="opacity-40" />;
  return asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

// ─── Main Client Component ─────────────────────────────────────────────────────

interface InventoryClientProps {
  initialProducts: InventoryProduct[];
}

export function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [nccFilter, setNccFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── KPI counts ──
  const kpiTotal = initialProducts.length;
  const kpiSapHet = initialProducts.filter((p) => p.status === "sap-het").length;
  const kpiHetHang = initialProducts.filter((p) => p.status === "het-hang").length;
  const kpiSapHetHan = initialProducts.filter((p) => p.status === "sap-het-han").length;

  // ── Unique filter options ──
  const categories = useMemo(
    () => [...new Set(initialProducts.map((p) => p.category))].sort(),
    [initialProducts]
  );
  const suppliers = useMemo(
    () => [...new Set(initialProducts.map((p) => p.supplier))].sort(),
    [initialProducts]
  );

  // ── Filtered + sorted data ──
  const data = useMemo(() => {
    let rows = initialProducts.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.sku.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (catFilter && p.category !== catFilter) return false;
      if (nccFilter && p.supplier !== nccFilter) return false;
      if (activeTab !== "all" && p.status !== activeTab) return false;
      return true;
    });

    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        const va = sortCol === "stock" ? a.stock : a.name.toLowerCase();
        const vb = sortCol === "stock" ? b.stock : b.name.toLowerCase();
        if (va < vb) return sortAsc ? -1 : 1;
        if (va > vb) return sortAsc ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [search, catFilter, nccFilter, activeTab, sortCol, sortAsc, initialProducts]);

  // ── Sort toggle ──
  function handleSort(col: SortCol) {
    if (sortCol === col) setSortAsc((v) => !v);
    else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  // ── Select all ──
  const allSelected =
    data.length > 0 && data.every((p) => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        data.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        data.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Tabs definition ──
  const TABS: { key: TabKey; label: string; badge?: number }[] = [
    { key: "all", label: "Tất cả" },
    { key: "sap-het", label: "Sắp hết" },
    { key: "het-hang", label: "Hết hàng", badge: kpiHetHang },
    { key: "sap-het-han", label: "Sắp hết hạn" },
  ];

  return (
    <div className="p-6 space-y-6 bg-(--bg-base) min-h-screen">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-md font-bold text-gray-900">TỒN KHO</h1>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <KpiCard
          title="Tổng sản phẩm"
          value={String(kpiTotal)}
          sub="đang theo dõi"
          deltaType="up"
          icon={<Package size={14} />}
        />
        <KpiCard
          title="Sắp hết hàng"
          value={String(kpiSapHet)}
          sub="dưới ngưỡng tối thiểu"
          icon={<AlertTriangle size={14} />}
        />
        <KpiCard
          title="Hết hàng"
          value={String(kpiHetHang)}
          change="cần nhập ngay"
          deltaType="down"
          icon={<XCircle size={14} />}
        />
        <KpiCard
          title="Sắp hết hạn"
          value={String(kpiSapHetHan)}
          sub="trong 3 ngày tới"
          icon={<CalendarClock size={14} />}
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
          />
          <input
            type="text"
            placeholder="Tìm tên, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none focus:border-[#888] w-44"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none cursor-pointer"
          >
            <option value="">Danh mục</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
        </div>

        {/* Supplier */}
        <div className="relative">
          <select
            value={nccFilter}
            onChange={(e) => setNccFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-[13px] border-2 border-(--border-button) rounded text-(--text-primary) outline-none cursor-pointer max-w-[180px]"
          >
            <option value="">NCC</option>
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none"
          />
        </div>

        {/* Quick filter buttons */}
        <button
          onClick={() =>
            setActiveTab(activeTab === "sap-het" ? "all" : "sap-het")
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] border rounded cursor-pointer transition-colors ${
            activeTab === "sap-het"
              ? "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]"
              : "border-2 border-(--border-button) text-(--text-secondary) bg-(--bg-base) hover:bg-(--bg-button)"
          }`}
        >
          <AlertTriangle size={12} />
          Sắp hết
        </button>
        <button
          onClick={() =>
            setActiveTab(activeTab === "het-hang" ? "all" : "het-hang")
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] border rounded cursor-pointer transition-colors ${
            activeTab === "het-hang"
              ? "border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.06)]"
              : "border-2 border-(--border-button) text-(--text-secondary) bg-(--bg-base) hover:bg-(--bg-button)"
          }`}
        >
          <XCircle size={12} />
          Hết hàng
        </button>
        <button
          onClick={() =>
            setActiveTab(activeTab === "sap-het-han" ? "all" : "sap-het-han")
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] border rounded cursor-pointer transition-colors ${
            activeTab === "sap-het-han"
              ? "border-[#C07A2B] text-[#C07A2B] bg-[rgba(192,122,43,0.06)]"
              : "border-2 border-(--border-button) text-(--text-secondary) bg-(--bg-base) hover:bg-(--bg-button)"
          }`}
        >
          <CalendarClock size={12} />
          Sắp hết hạn
        </button>

        <div className="flex-1" />

        {/* Action buttons */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold border-2 border-[#227D52] text-[#227D52] rounded hover:bg-[rgba(34,125,82,0.06)] transition-colors cursor-pointer">
          <Plus size={14} />
          Nhập hàng
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] border-2 border-(--border-button) text-(--text-secondary) rounded hover:bg-(--bg-button) transition-colors cursor-pointer">
          <Upload size={14} />
          Xuất hàng
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b-2 border-(--border-button) mb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === tab.key
                ? "border-[#ef4444] text-[#ef4444] font-medium"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="inline-flex items-center justify-center bg-[#C0392B] text-white rounded-full text-[10px] font-semibold px-1.5 py-0 min-w-[18px] leading-[18px]">
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
                  className="w-3.5 h-3.5 accent-[#ef4444] cursor-pointer"
                />
              </th>
              <th
                className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide cursor-pointer hover:text-(--text-primary) select-none"
                onClick={() => handleSort("name")}
              >
                <span className="flex items-center gap-1">
                  Sản phẩm
                  <SortIcon col="name" current={sortCol} asc={sortAsc} />
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                SKU
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                Danh mục
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                NCC
              </th>
              <th
                className="px-3 py-2.5 text-left text-[11px] font-semibold text-(--text-muted) uppercase tracking-wide cursor-pointer hover:text-(--text-primary) select-none"
                onClick={() => handleSort("stock")}
              >
                <span className="flex items-center gap-1">
                  Tồn kho
                  <SortIcon col="stock" current={sortCol} asc={sortAsc} />
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                HSD
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-3 py-2.5 text-left text-md font-semibold text-(--text-muted) uppercase tracking-wide">
                Cập nhật
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr
                key={product.id}
                className="border-t border-[#F0EDE8] hover:bg-[rgba(245,242,237,0.6)] transition-colors"
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="w-3.5 h-3.5 accent-[#ef4444] cursor-pointer"
                  />
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <ProductThumb
                      name={product.name}
                      imageUrl={product.imageUrl}
                    />
                    <span className="text-[13px] text-(--text-primary)">
                      {product.name}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="text-[12px] font-mono text-(--text-muted)">
                    {product.sku}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="inline-block border border-(--border-button) rounded-[3px] px-1.5 py-0.5 text-[11px] text-(--text-secondary) bg-(--bg-base)">
                    {product.category}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="text-[12px] text-(--text-secondary)">
                    {product.supplier}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span
                    className={`text-[13px] font-bold ${
                      product.stock === 0
                        ? "text-[#C0392B]"
                        : product.stock < 5
                        ? "text-[#C07A2B]"
                        : "text-(--text-primary)"
                    }`}
                  >
                    {product.stock} {product.unit}
                  </span>
                </td>

                <td className="px-3 py-3">
                  {product.hsd ? (
                    <span className="text-[12px] font-mono text-(--text-muted)">
                      {product.hsd}
                    </span>
                  ) : (
                    <span className="text-(--text-muted)">—</span>
                  )}
                </td>

                <td className="px-3 py-3">
                  <StatusTag status={product.status} />
                </td>

                <td className="px-3 py-3">
                  <span className="text-[12px] font-mono text-(--text-muted) whitespace-nowrap">
                    {product.updatedAt}
                  </span>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-12 text-(--text-muted) text-[13px]"
                >
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-3.5 py-2.5 text-[12px] text-(--text-muted) border-t border-[#F0EDE8]">
          Hiển thị {data.length} / {initialProducts.length} sản phẩm
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