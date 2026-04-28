/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  sku: string;
  name: string;
  unit: string;
  category: string;
  price: number;
  minOrder: number;
  avgDaily: number; // gợi ý sức bán trung bình/ngày
}

interface Supplier {
  id: string;
  name: string;
  short: string;
  color: string;
  colorLight: string;
  products: Product[];
}

// weekQty[sku][dayIdx] = số lượng đặt ngày đó (0 = không đặt)
type WeekQty = Record<string, number[]>;

interface PO {
  id: string;
  supplier: string;
  supplierColor: string;
  items: number;
  total: number;
  status: "Chờ xác nhận" | "Đang giao" | "Đã giao" | "Từ chối";
  createdAt: string;
  deliveryDate: string;
  note: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_DATES = ["28/4", "29/4", "30/4", "1/5", "2/5", "3/5", "4/5"]; // tuần hiện tại

const suppliers: Supplier[] = [
  {
    id: "meatdeli",
    name: "Công ty CP Masan MEATLife",
    short: "MeatDeli",
    color: "#e53e3e",
    colorLight: "rgba(229,62,62,0.08)",
    products: [
      { sku: "MEAT-014", name: "Ba rọi heo đa năng MEATDeli 500g", unit: "khay", category: "Thịt heo", price: 89000, minOrder: 5, avgDaily: 8 },
      { sku: "MEAT-002", name: "Ba rọi rút sườn MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 95000, minOrder: 5, avgDaily: 6 },
      { sku: "MEAT-008", name: "Bắp hoa heo MEATDeli signature 460g", unit: "khay", category: "Thịt heo", price: 92000, minOrder: 5, avgDaily: 5 },
      { sku: "MEAT-017", name: "Đuôi heo MEATDeli signature 460g", unit: "khay", category: "Thịt heo", price: 78000, minOrder: 5, avgDaily: 4 },
      { sku: "MEAT-001", name: "Giò heo cắt khoanh MEATDeli 450g", unit: "khay", category: "Thịt heo", price: 85000, minOrder: 5, avgDaily: 5 },
      { sku: "MEAT-011", name: "Nạc dăm đầu giòn MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 99000, minOrder: 5, avgDaily: 7 },
      { sku: "MEAT-004", name: "Nạc dăm heo MEATDeli 480g", unit: "khay", category: "Thịt heo", price: 88000, minOrder: 5, avgDaily: 6 },
      { sku: "MEAT-012", name: "Sườn non heo MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 105000, minOrder: 5, avgDaily: 9 },
      { sku: "MEAT-010", name: "Sườn St. Louis MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 112000, minOrder: 5, avgDaily: 4 },
      { sku: "MEAT-018", name: "Sườn vai heo MEATDeli 450g", unit: "khay", category: "Thịt heo", price: 82000, minOrder: 5, avgDaily: 5 },
      { sku: "MEAT-007", name: "Thịt Ba rọi heo MEATDeli 500g", unit: "khay", category: "Thịt heo", price: 91000, minOrder: 5, avgDaily: 10 },
      { sku: "MEAT-020", name: "Thịt Ba rọi heo MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 97000, minOrder: 5, avgDaily: 8 },
      { sku: "MEAT-003", name: "Thịt Cốt lết heo MEATDeli 440g", unit: "khay", category: "Thịt heo", price: 86000, minOrder: 5, avgDaily: 6 },
      { sku: "MEAT-015", name: "Thịt heo đặc biệt xiên que MEATDeli 500g", unit: "khay", category: "Chế biến", price: 120000, minOrder: 5, avgDaily: 3 },
      { sku: "MEAT-016", name: "Thịt heo tảng cho món nướng 520g", unit: "khay", category: "Thịt heo", price: 115000, minOrder: 5, avgDaily: 4 },
      { sku: "MEAT-006", name: "Thịt heo xay MEATDeli 500g", unit: "khay", category: "Thịt heo", price: 75000, minOrder: 5, avgDaily: 12 },
      { sku: "MEAT-009", name: "Thịt heo xay MEATDeli signature 480g", unit: "khay", category: "Thịt heo", price: 82000, minOrder: 5, avgDaily: 8 },
      { sku: "MEAT-013", name: "Thịt nạc nong phủ quỳ MEATDeli signature 500g", unit: "khay", category: "Thịt heo", price: 108000, minOrder: 5, avgDaily: 3 },
      { sku: "MEAT-019", name: "Thịt viên ướp sẵn MEATDeli 400g", unit: "khay", category: "Chế biến", price: 72000, minOrder: 5, avgDaily: 7 },
      { sku: "MEAT-005", name: "Xương heo MEATDeli 530g", unit: "khay", category: "Thịt heo", price: 68000, minOrder: 5, avgDaily: 8 },
    ],
  },
  {
    id: "wineco",
    name: "Công ty TNHH WinEco",
    short: "WinEco",
    color: "#38a169",
    colorLight: "rgba(56,161,105,0.08)",
    products: [
      { sku: "WIN-003", name: "Cải bó xôi WinEco gói 300g", unit: "gói", category: "Rau lá", price: 18000, minOrder: 10, avgDaily: 20 },
      { sku: "WIN-004", name: "Cải các WinEco gói 300g", unit: "gói", category: "Rau lá", price: 15000, minOrder: 10, avgDaily: 15 },
      { sku: "WIN-001", name: "Cần tây lớn WinEco 1kg", unit: "kg", category: "Rau lá", price: 35000, minOrder: 5, avgDaily: 8 },
      { sku: "WIN-011", name: "Dưa lưới ruột cam WinEco 1.2kg", unit: "trái", category: "Trái cây", price: 65000, minOrder: 3, avgDaily: 5 },
      { sku: "WIN-005", name: "Giá đỗ WinEco 300g", unit: "gói", category: "Rau lá", price: 12000, minOrder: 10, avgDaily: 25 },
      { sku: "WIN-009", name: "Hành lá WinEco gói 100g", unit: "gói", category: "Rau lá", price: 10000, minOrder: 10, avgDaily: 30 },
      { sku: "WIN-008", name: "Hẹ lá WinEco 100g", unit: "gói", category: "Rau lá", price: 10000, minOrder: 10, avgDaily: 20 },
      { sku: "WIN-007", name: "Rau mầm cải ngọt WinEco 100g", unit: "gói", category: "Rau mầm", price: 22000, minOrder: 10, avgDaily: 12 },
      { sku: "WIN-006", name: "Rau mầm cải xanh WinEco 100g", unit: "gói", category: "Rau mầm", price: 22000, minOrder: 10, avgDaily: 10 },
      { sku: "WIN-002", name: "Tỏi tây WinEco 100g", unit: "gói", category: "Rau lá", price: 18000, minOrder: 10, avgDaily: 15 },
      { sku: "WIN-013", name: "Xà lách iceberg WinEco 300g", unit: "gói", category: "Rau lá", price: 20000, minOrder: 10, avgDaily: 18 },
      { sku: "WIN-010", name: "Xà lách lolo xanh WinEco 300g", unit: "gói", category: "Rau lá", price: 20000, minOrder: 10, avgDaily: 15 },
      { sku: "WIN-012", name: "Xà lách mỡ WinEco 300g", unit: "gói", category: "Rau lá", price: 18000, minOrder: 10, avgDaily: 12 },
    ],
  },
  {
    id: "chinsu",
    name: "Công ty CP Masan Consumer",
    short: "Chin-su",
    color: "#d69e2e",
    colorLight: "rgba(214,158,46,0.08)",
    products: [
      { sku: "CS-DHS-001", name: "Dầu hào sò điệp Chin-su 500ml", unit: "chai", category: "Gia vị", price: 42000, minOrder: 6, avgDaily: 4 },
      { sku: "CS-DAU-001", name: "Dầu mắng gạo Chin-su 1L", unit: "chai", category: "Dầu ăn", price: 58000, minOrder: 6, avgDaily: 5 },
      { sku: "CS-HN-002", name: "Hạt nêm Chin-su ngọt thanh rau củ & nấm 400g", unit: "gói", category: "Hạt nêm", price: 35000, minOrder: 6, avgDaily: 6 },
      { sku: "CS-HN-001", name: "Hạt nêm Chin-su ngọt tôm thơm thịt 400g", unit: "gói", category: "Hạt nêm", price: 35000, minOrder: 6, avgDaily: 8 },
      { sku: "CS-HN-003", name: "Hạt nêm xương hầm gấp 5 lần Chin-su 400g", unit: "gói", category: "Hạt nêm", price: 38000, minOrder: 6, avgDaily: 5 },
      { sku: "CS-TO-003", name: "Muối ớt đỏ Chin-su 90g", unit: "gói", category: "Tương ớt", price: 18000, minOrder: 12, avgDaily: 6 },
      { sku: "CS-NM-003", name: "Nước mắm cá cơm Chin-su 500ml", unit: "chai", category: "Nước mắm", price: 32000, minOrder: 6, avgDaily: 7 },
      { sku: "CS-NM-002", name: "Nước mắm Chin-su 40 độ đậm 500ml", unit: "chai", category: "Nước mắm", price: 38000, minOrder: 6, avgDaily: 5 },
      { sku: "CS-NM-001", name: "Nước mắm Chin-su thượng hạng 500ml", unit: "chai", category: "Nước mắm", price: 45000, minOrder: 6, avgDaily: 6 },
      { sku: "CS-NT-001", name: "Nước tương ủ tự nhiên 120 ngày Chin-su 500ml", unit: "chai", category: "Nước tương", price: 28000, minOrder: 6, avgDaily: 5 },
      { sku: "CS-NT-002", name: "Nước tương Tam Thái Tử 500ml", unit: "chai", category: "Nước tương", price: 25000, minOrder: 6, avgDaily: 4 },
      { sku: "CS-NT-003", name: "Nước tương tỏi ớt Chin-su 500ml", unit: "chai", category: "Nước tương", price: 28000, minOrder: 6, avgDaily: 5 },
      { sku: "CS-SAT-001", name: "Sa tế tôm Chin-su 200g", unit: "gói", category: "Gia vị", price: 32000, minOrder: 6, avgDaily: 4 },
      { sku: "CS-TIEU-001", name: "Tiêu đen xay Chin-su 50g", unit: "gói", category: "Gia vị", price: 22000, minOrder: 12, avgDaily: 4 },
      { sku: "CS-TC-001", name: "Tương cà Chin-su 500g", unit: "chai", category: "Tương ớt", price: 28000, minOrder: 6, avgDaily: 7 },
      { sku: "CS-TO-001", name: "Tương ớt Chin-su 250g", unit: "chai", category: "Tương ớt", price: 22000, minOrder: 6, avgDaily: 8 },
      { sku: "CS-TO-002", name: "Tương ớt siêu cay Chin-su 250g", unit: "chai", category: "Tương ớt", price: 24000, minOrder: 6, avgDaily: 6 },
      { sku: "CS-XGV-002", name: "Xốt gia vị gà chiên nước mắm Chin-su 200g", unit: "gói", category: "Xốt gia vị", price: 28000, minOrder: 6, avgDaily: 3 },
      { sku: "CS-XGV-001", name: "Xốt gia vị hoàn chỉnh thịt kho Chin-su 200g", unit: "gói", category: "Xốt gia vị", price: 28000, minOrder: 6, avgDaily: 3 },
    ],
  },
];

const existingPOs: PO[] = [
  { id: "PO-20247", supplier: "MeatDeli", supplierColor: "#e53e3e", items: 8, total: 7840000, status: "Đang giao", createdAt: "27/4/2026 08:15", deliveryDate: "28/4/2026", note: "Giao trước 10h sáng" },
  { id: "PO-20246", supplier: "WinEco", supplierColor: "#38a169", items: 5, total: 1250000, status: "Đã giao", createdAt: "26/4/2026 14:30", deliveryDate: "27/4/2026", note: "" },
  { id: "PO-20245", supplier: "Chin-su", supplierColor: "#d69e2e", items: 12, total: 4320000, status: "Đã giao", createdAt: "25/4/2026 09:00", deliveryDate: "26/4/2026", note: "Kiểm tra HSD khi nhận" },
  { id: "PO-20244", supplier: "MeatDeli", supplierColor: "#e53e3e", items: 15, total: 13500000, status: "Đã giao", createdAt: "24/4/2026 07:45", deliveryDate: "25/4/2026", note: "" },
  { id: "PO-20243", supplier: "WinEco", supplierColor: "#38a169", items: 7, total: 1890000, status: "Từ chối", createdAt: "23/4/2026 11:20", deliveryDate: "24/4/2026", note: "NCC không đủ hàng" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const fmtCompact = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  "Chờ xác nhận": { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="w-3 h-3" /> },
  "Đang giao": { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Package className="w-3 h-3" /> },
  "Đã giao": { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  "Từ chối": { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3 h-3" /> },
};

const cardClass = "bg-(--bg-base) border border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono";

// ─── Weekly Order Table ───────────────────────────────────────────────────────

function WeeklyOrderTable({
  supplier,
  weekQty,
  onQtyChange,
  onAutoFill,
}: {
  supplier: Supplier;
  weekQty: WeekQty;
  onQtyChange: (sku: string, dayIdx: number, val: number) => void;
  onAutoFill: (sku: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const filtered = supplier.products.filter(
    (p) =>
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // group by category
  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    filtered.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [filtered]);

  const rowTotal = (sku: string) =>
    (weekQty[sku] ?? Array(7).fill(0)).reduce((s: number, v: number) => s + v, 0);

  const dayTotal = (dayIdx: number) =>
    supplier.products.reduce((s, p) => s + ((weekQty[p.sku] ?? Array(7).fill(0))[dayIdx] ?? 0) * p.price, 0);

  const grandTotal = supplier.products.reduce(
    (s, p) => s + rowTotal(p.sku) * p.price, 0
  );

  const activeProductCount = supplier.products.filter((p) => rowTotal(p.sku) > 0).length;

  return (
    <div className="space-y-3">
      {/* Table header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs bg-(--bg-table) border border-(--border-button) rounded-lg text-(--text-primary) outline-none focus:border-(--color-active) transition-colors w-48"
            />
          </div>
          {activeProductCount > 0 && (
            <span className="text-xs text-(--text-secondary)">
              <span className="font-semibold text-(--text-primary)">{activeProductCount}</span> sản phẩm đã lên lịch
            </span>
          )}
        </div>
        {grandTotal > 0 && (
          <div className="text-sm font-bold" style={{ color: supplier.color }}>
            Tổng tuần: {fmtVND(grandTotal)}
          </div>
        )}
      </div>

      {/* Main table */}
      <div className="overflow-x-auto rounded-xl border border-(--border-chart)">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            {/* Day header row */}
            <tr style={{ background: supplier.colorLight }}>
              <th className="text-left px-3 py-2.5 text-(--text-secondary) font-medium w-[280px] sticky left-0 z-10" style={{ background: supplier.colorLight }}>
                Sản phẩm
              </th>
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-14">ĐVT</th>
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-10" title="Gợi ý theo sức bán">
                <TrendingUp className="w-3 h-3 inline text-(--text-muted)" />
              </th>
              {DAYS.map((day, i) => (
                <th key={day} className="text-center px-1 py-2 w-16">
                  <div className="font-semibold" style={{ color: supplier.color }}>{day}</div>
                  <div className="text-[10px] text-(--text-muted) font-normal">{DAY_DATES[i]}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-16">Tổng SL</th>
              <th className="text-right px-3 py-2.5 text-(--text-secondary) font-medium w-24">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([cat, products]) => {
              const isExpanded = expandedCats[cat] !== false; // default expanded
              return (
                <Fragment key={cat}>
                  {/* Category separator row */}
                  <tr
                    className="cursor-pointer hover:bg-(--bg-table)/80"
                    style={{ background: supplier.colorLight + "88" }}
                    onClick={() => setExpandedCats((prev) => ({ ...prev, [cat]: !isExpanded }))}
                  >
                    <td colSpan={11} className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        {isExpanded
                          ? <ChevronDown className="w-3 h-3 text-(--text-muted)" />
                          : <ChevronRight className="w-3 h-3 text-(--text-muted)" />
                        }
                        <span className="font-semibold text-(--text-secondary) uppercase tracking-wide text-[10px]">{cat}</span>
                        <span className="text-[10px] text-(--text-muted)">· {products.length} sản phẩm</span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && products.map((product, rowIdx) => {
                    const qty = weekQty[product.sku] ?? Array(7).fill(0);
                    const total = rowTotal(product.sku);
                    const hasAny = total > 0;

                    return (
                      <tr
                        key={product.sku}
                        className={`border-t border-(--border-chart) transition-colors ${hasAny ? "" : "opacity-70"} hover:bg-(--bg-table)/40`}
                      >
                        {/* Product name - sticky */}
                        <td className="px-3 py-2 sticky left-0 bg-(--bg-base) z-10 border-r border-(--border-chart)">
                          <div className="font-medium text-(--text-primary) leading-tight text-[11px]">{product.name}</div>
                          <div className="text-[10px] text-(--text-muted) mt-0.5">{product.sku}</div>
                        </td>
                        {/* Unit */}
                        <td className="text-center text-(--text-secondary) py-2">{product.unit}</td>
                        {/* Auto-fill hint */}
                        <td className="text-center py-2">
                          <button
                            onClick={() => onAutoFill(product.sku)}
                            title={`Điền tự động theo sức bán TB (${product.avgDaily}/${product.unit}/ngày)`}
                            className="text-(--text-muted) hover:text-(--color-active) cursor-pointer transition-colors"
                          >
                            <TrendingUp className="w-3 h-3" />
                          </button>
                        </td>
                        {/* Day inputs */}
                        {DAYS.map((_, dayIdx) => (
                          <td key={dayIdx} className="text-center px-1 py-1.5">
                            <input
                              type="number"
                              min={0}
                              value={qty[dayIdx] === 0 ? "" : qty[dayIdx]}
                              placeholder="—"
                              onChange={(e) => {
                                const v = parseInt(e.target.value) || 0;
                                onQtyChange(product.sku, dayIdx, v);
                              }}
                              className={`w-12 text-center py-1 rounded-md border text-xs outline-none transition-all
                                ${qty[dayIdx] > 0
                                  ? "font-semibold text-(--text-primary) border-(--color-active) bg-(--bg-table)"
                                  : "text-(--text-muted) border-(--border-button) bg-transparent placeholder-text-(--text-label)"
                                }
                                focus:border-(--color-active) focus:bg-(--bg-table) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                          </td>
                        ))}
                        {/* Row total qty */}
                        <td className="text-center py-2">
                          {total > 0 ? (
                            <span className="font-bold text-(--text-primary)">{total}</span>
                          ) : (
                            <span className="text-(--text-muted)">—</span>
                          )}
                        </td>
                        {/* Row total value */}
                        <td className="text-right px-3 py-2">
                          {total > 0 ? (
                            <span className="font-semibold" style={{ color: supplier.color }}>
                              {fmtCompact(total * product.price)}
                            </span>
                          ) : (
                            <span className="text-(--text-muted)">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}

            {/* Footer: day totals */}
            <tr className="border-t-2 border-(--border-chart)" style={{ background: supplier.colorLight }}>
              <td className="px-3 py-2.5 font-semibold text-(--text-primary) sticky left-0 z-10" style={{ background: supplier.colorLight }}>
                Tổng giá trị / ngày
              </td>
              <td colSpan={2} />
              {DAYS.map((_, dayIdx) => {
                const v = dayTotal(dayIdx);
                return (
                  <td key={dayIdx} className="text-center py-2.5 px-1">
                    {v > 0 ? (
                      <span className="font-semibold text-[11px]" style={{ color: supplier.color }}>
                        {fmtCompact(v)}
                      </span>
                    ) : (
                      <span className="text-(--text-muted)">—</span>
                    )}
                  </td>
                );
              })}
              <td />
              <td className="text-right px-3 py-2.5">
                <span className="font-bold text-sm" style={{ color: supplier.color }}>
                  {grandTotal > 0 ? fmtVND(grandTotal) : "—"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ─── PO Detail Modal ──────────────────────────────────────────────────────────

function PODetailModal({ po, onClose }: { po: PO; onClose: () => void }) {
  const sup = suppliers.find((s) => s.short === po.supplier);
  const fakeItems = useMemo(() => {
  return (sup?.products ?? []).slice(0, po.items).map((p, idx) => {
    const baseSeed = Number(po.id.replace("PO-", "")) + idx;

    const qty = Math.floor(seededRandom(baseSeed) * 10) + 5;

    const received =
      po.status === "Đã giao"
        ? Math.floor(seededRandom(baseSeed + 1) * 2) + (qty + 4)
        : undefined;

    return {
      ...p,
      qty,
      received,
    };
  });
}, [po, sup]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-(--bg-base) border border-(--border-chart) rounded-2xl shadow-2xl w-full max-w-2xl max-h-[82vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border-chart)">
          <div>
            <h2 className="text-sm font-bold text-(--text-primary)">{po.id}</h2>
            <p className="text-xs text-(--text-secondary) mt-0.5">{po.supplier} · {po.createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[po.status].color}`}>
              {statusConfig[po.status].icon}
              {po.status}
            </span>
            <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-(--border-chart)">
                <TableHead className="text-xs text-(--text-secondary) pl-4">Sản phẩm</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">ĐVT</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">SL đặt</TableHead>
                {po.status === "Đã giao" && <TableHead className="text-xs text-(--text-secondary) text-center">SL thực nhận</TableHead>}
                <TableHead className="text-xs text-(--text-secondary) text-right pr-4">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fakeItems.map((item) => (
                <TableRow key={item.sku} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                  <TableCell className="pl-4">
                    <p className="text-xs font-medium text-(--text-primary)">{item.name}</p>
                    <p className="text-[10px] text-(--text-muted)">{item.sku}</p>
                  </TableCell>
                  <TableCell className="text-center text-xs text-(--text-secondary)">{item.unit}</TableCell>
                  <TableCell className="text-center text-xs font-semibold text-(--text-primary)">{item.qty}</TableCell>
                  {po.status === "Đã giao" && (
                    <TableCell className="text-center">
                      <input
                        type="number"
                        defaultValue={item.received ?? item.qty}
                        className="w-16 text-center text-xs border border-(--border-button) rounded-md py-0.5 bg-(--bg-table) text-(--text-primary) outline-none focus:border-(--color-active) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right text-xs font-semibold text-(--text-primary) pr-4">{fmtVND(item.price * item.qty)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-(--border-chart) flex items-center justify-between">
          <div>
            {po.note && <p className="text-xs text-(--text-secondary)">📝 {po.note}</p>}
            <p className="text-xs text-(--text-muted) mt-0.5">Giao: {po.deliveryDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-(--color-danger)">{fmtVND(po.total)}</span>
            {po.status === "Đã giao" && (
              <button className="flex items-center gap-1.5 text-xs text-white bg-(--color-active) rounded-lg px-3 py-2 cursor-pointer hover:bg-(--accent-hover) transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Xác nhận nhập kho
              </button>
            )}
            <button className="flex items-center gap-1.5 text-xs text-(--text-secondary) bg-(--bg-table) rounded-lg px-3 py-2 border border-(--border-button) hover:text-(--text-primary) cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              Xuất PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ poIds, onClose }: { poIds: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-(--bg-base) border border-(--border-chart) rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-(--color-success)" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-(--text-primary)">Tạo PO thành công!</h3>
          <p className="text-xs text-(--text-secondary) mt-1 leading-relaxed">
            Đã tạo <span className="font-semibold">{poIds.length} Purchase Order</span>:<br />
            {poIds.join(" · ")}
          </p>
          <p className="text-xs text-(--text-muted) mt-1">Đã gửi xác nhận đến NCC.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-(--color-active) text-white text-xs font-semibold rounded-lg py-2.5 hover:bg-(--accent-hover) transition-colors cursor-pointer"
        >
          Xem lịch sử PO
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type PageView = "create" | "history";

export default function OrderPage() {
  const [view, setView] = useState<PageView>("create");
  const [activeSupplier, setActiveSupplier] = useState<string>("meatdeli");
  const [weekQtyMap, setWeekQtyMap] = useState<Record<string, WeekQty>>(
    // init all suppliers
    Object.fromEntries(suppliers.map((s) => [s.id, {}]))
  );
  const [note, setNote] = useState("");
  const [poList, setPoList] = useState<PO[]>(existingPOs);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [showSuccess, setShowSuccess] = useState<string[] | null>(null);
  const [poFilter, setPoFilter] = useState("Tất cả");

  const currentSupplier = suppliers.find((s) => s.id === activeSupplier)!;
  const currentWeekQty = weekQtyMap[activeSupplier] ?? {};

  const handleQtyChange = (sku: string, dayIdx: number, val: number) => {
    setWeekQtyMap((prev) => {
      const supQty = { ...(prev[activeSupplier] ?? {}) };
      const row = [...(supQty[sku] ?? Array(7).fill(0))];
      row[dayIdx] = val;
      supQty[sku] = row;
      return { ...prev, [activeSupplier]: supQty };
    });
  };

  const handleAutoFill = (sku: string) => {
    const product = currentSupplier.products.find((p) => p.sku === sku);
    if (!product) return;
    // T2-T5: avgDaily, T6-T7-CN: avgDaily * 1.4
    const autoQty = DAYS.map((_, i) =>
      i >= 5 ? Math.ceil(product.avgDaily * 1.4) : product.avgDaily
    );
    setWeekQtyMap((prev) => {
      const supQty = { ...(prev[activeSupplier] ?? {}) };
      supQty[sku] = autoQty;
      return { ...prev, [activeSupplier]: supQty };
    });
  };

  // compute summary per supplier
  const supplierSummary = useMemo(() => {
    return suppliers.map((sup) => {
      const qty = weekQtyMap[sup.id] ?? {};
      const activeSkus = Object.entries(qty).filter(([, days]) => (days as number[]).some((v) => v > 0));
      const total = activeSkus.reduce((s, [sku, days]) => {
        const product = sup.products.find((p) => p.sku === sku);
        if (!product) return s;
        return s + (days as number[]).reduce((a, v) => a + v, 0) * product.price;
      }, 0);
      return { id: sup.id, activeSkus: activeSkus.length, total };
    });
  }, [weekQtyMap]);

  const totalGrandValue = supplierSummary.reduce((s, x) => s + x.total, 0);
  const totalActiveSkus = supplierSummary.reduce((s, x) => s + x.activeSkus, 0);

  // build POs: one per supplier per day that has any qty
  const handleCreatePO = () => {
    const newPOs: PO[] = [];
    let poCounter = poList.length > 0 ? parseInt(poList[0].id.replace("PO-", "")) + 1 : 20248;

    suppliers.forEach((sup) => {
      const qty = weekQtyMap[sup.id] ?? {};
      const activeSkus = Object.entries(qty).filter(([, days]) => (days as number[]).some((v) => v > 0));
      if (activeSkus.length === 0) return;

      // group by days that have qty
      const daysWithOrders = DAYS.map((day, dayIdx) => {
        const items = activeSkus.filter(([, days]) => (days as number[])[dayIdx] > 0);
        return { day, dayIdx, items };
      }).filter((d) => d.items.length > 0);

      daysWithOrders.forEach(({ dayIdx, items }) => {
        const total = items.reduce((s, [sku, days]) => {
          const product = sup.products.find((p) => p.sku === sku);
          if (!product) return s;
          return s + (days as number[])[dayIdx] * product.price;
        }, 0);
        newPOs.push({
          id: `PO-${poCounter++}`,
          supplier: sup.short,
          supplierColor: sup.color,
          items: items.length,
          total,
          status: "Chờ xác nhận",
          createdAt: new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          deliveryDate: DAY_DATES[dayIdx] + "/2026",
          note,
        });
      });
    });

    if (newPOs.length === 0) return;
    setPoList((prev) => [...newPOs, ...prev]);
    setWeekQtyMap(Object.fromEntries(suppliers.map((s) => [s.id, {}])));
    setNote("");
    setShowSuccess(newPOs.map((p) => p.id));
  };

  const filteredPOs = poFilter === "Tất cả" ? poList : poList.filter((p) => p.status === poFilter);

  return (
    <div className="p-6 space-y-5 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-md font-bold text-(--text-primary)">ĐẶT HÀNG</h1>
          <p className="text-xs text-(--text-secondary) mt-0.5">
            Lên lịch đặt hàng theo tuần · Giao từng ngày · Nhận hàng cập nhật tồn kho
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-(--bg-table) rounded-lg p-1">
            {(["create", "history"] as PageView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  view === v
                    ? "bg-(--bg-base) text-(--text-primary) shadow-sm border border-(--border-button)"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {v === "create" ? "Lên lịch tuần" : "Lịch sử PO"}
              </button>
            ))}
          </div>
          {poList.filter((p) => p.status === "Đang giao").length > 0 && (
            <button
              onClick={() => setView("history")}
              className="flex items-center gap-1.5 bg-(--color-info) text-white text-xs font-semibold rounded-lg px-3 py-2 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              {poList.filter((p) => p.status === "Đang giao").length} đang giao
            </button>
          )}
        </div>
      </div>

      {view === "create" ? (
        <div className="space-y-4">
          {/* Week summary bar */}
          {totalActiveSkus > 0 && (
            <div className="flex items-center justify-between bg-(--bg-table) border border-(--border-chart) rounded-xl px-4 py-3">
              <div className="flex items-center gap-6">
                {supplierSummary.map((s) => {
                  const sup = suppliers.find((x) => x.id === s.id)!;
                  if (s.activeSkus === 0) return null;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: sup.color }} />
                      <span className="text-xs text-(--text-secondary)">{sup.short}:</span>
                      <span className="text-xs font-semibold text-(--text-primary)">{s.activeSkus} sp</span>
                      <span className="text-xs font-bold" style={{ color: sup.color }}>{fmtCompact(s.total)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-(--text-secondary)">Tổng đơn tuần</div>
                  <div className="text-sm font-bold text-(--color-danger)">{fmtVND(totalGrandValue)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ghi chú cho tất cả PO..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="text-xs bg-(--bg-base) border border-(--border-button) rounded-lg px-3 py-2 text-(--text-primary) outline-none focus:border-(--color-active) w-48 transition-colors"
                  />
                  <button
                    onClick={handleCreatePO}
                    className="flex items-center gap-2 bg-(--color-active) text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-(--accent-hover) transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Tạo PO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Supplier tabs */}
          <div className="flex items-center gap-2 border-b border-(--border-chart)">
            {suppliers.map((sup) => {
              const summary = supplierSummary.find((s) => s.id === sup.id)!;
              const isActive = activeSupplier === sup.id;
              return (
                <button
                  key={sup.id}
                  onClick={() => setActiveSupplier(sup.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer -mb-px ${
                    isActive ? "border-[var(--sup-color)] " : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
                  }`}
                  style={isActive ? { "--sup-color": sup.color, color: sup.color } as any : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: sup.color }} />
                  {sup.short}
                  <span className="text-[10px] text-(--text-secondary)">· {sup.products.length} sp</span>
                  {summary.activeSkus > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                      style={{ background: sup.color }}
                    >
                      {summary.activeSkus}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Supplier header */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: currentSupplier.color }} />
            <div>
              <span className="text-sm font-semibold text-(--text-primary)">{currentSupplier.short}</span>
              <span className="text-xs text-(--text-secondary) ml-2">{currentSupplier.name}</span>
            </div>
            <span className="text-xs text-(--text-muted) ml-auto">
              💡 Nhấn <TrendingUp className="w-3 h-3 inline" /> để tự điền theo sức bán trung bình · T7/CN tự động +40%
            </span>
          </div>

          {/* Weekly table */}
          <WeeklyOrderTable
            supplier={currentSupplier}
            weekQty={currentWeekQty}
            onQtyChange={handleQtyChange}
            onAutoFill={handleAutoFill}
          />
        </div>
      ) : (
        /* History */
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Tổng PO", value: poList.length, sub: "tháng này" },
              { label: "Đang giao", value: poList.filter((p) => p.status === "Đang giao").length, sub: "cần theo dõi", color: "text-(--color-info)" },
              { label: "Đã giao", value: poList.filter((p) => p.status === "Đã giao").length, sub: "hoàn tất", color: "text-(--color-success)" },
              { label: "Chờ xác nhận", value: poList.filter((p) => p.status === "Chờ xác nhận").length, sub: "chờ NCC duyệt", color: "text-(--color-warning)" },
            ].map((s) => (
              <div key={s.label} className="bg-(--bg-table) rounded-xl p-4">
                <div className="text-xs text-(--text-secondary) mb-1">{s.label}</div>
                <div className={`text-2xl font-semibold ${s.color ?? "text-(--text-primary)"}`}>{s.value}</div>
                <div className="text-xs text-(--text-muted) mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Danh Sách Purchase Order</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Click vào PO để xem chi tiết · Nhập SL thực nhận khi hàng về để cập nhật tồn kho
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["Tất cả", "Chờ xác nhận", "Đang giao", "Đã giao", "Từ chối"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setPoFilter(f)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer transition-all ${
                        poFilter === f
                          ? "bg-(--color-active) text-white"
                          : "bg-(--bg-table) text-(--text-secondary) border border-(--border-button) hover:text-(--text-primary)"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-(--border-chart)">
                    <TableHead className="text-xs text-(--text-secondary) pl-4">Mã PO</TableHead>
                    <TableHead className="text-xs text-(--text-secondary)">NCC</TableHead>
                    <TableHead className="text-xs text-(--text-secondary) text-center">Mặt hàng</TableHead>
                    <TableHead className="text-xs text-(--text-secondary) text-right">Tổng tiền</TableHead>
                    <TableHead className="text-xs text-(--text-secondary)">Tạo lúc</TableHead>
                    <TableHead className="text-xs text-(--text-secondary)">Giao ngày</TableHead>
                    <TableHead className="text-xs text-(--text-secondary)">Ghi chú</TableHead>
                    <TableHead className="text-xs text-(--text-secondary) text-center">Trạng thái</TableHead>
                    <TableHead className="text-xs text-(--text-secondary) text-center pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow
                      key={po.id}
                      className="border-(--border-chart) hover:bg-(--bg-table)/60 cursor-pointer"
                      onClick={() => setSelectedPO(po)}
                    >
                      <TableCell className="pl-4 font-mono text-xs font-semibold text-(--text-primary)">{po.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: po.supplierColor }} />
                          <span className="text-xs text-(--text-primary)">{po.supplier}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-(--text-secondary)">{po.items}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-(--text-primary)">{fmtVND(po.total)}</TableCell>
                      <TableCell className="text-xs text-(--text-secondary)">{po.createdAt}</TableCell>
                      <TableCell className="text-xs font-medium text-(--text-primary)">{po.deliveryDate}</TableCell>
                      <TableCell className="text-xs text-(--text-muted) max-w-[120px] truncate">{po.note || "—"}</TableCell>
                      <TableCell className="text-center">
                        <span className={`flex items-center justify-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium w-fit mx-auto ${statusConfig[po.status].color}`}>
                          {statusConfig[po.status].icon}
                          {po.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPO(po); }}
                          className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      {selectedPO && <PODetailModal po={selectedPO} onClose={() => setSelectedPO(null)} />}
      {showSuccess && (
        <SuccessModal
          poIds={showSuccess}
          onClose={() => { setShowSuccess(null); setView("history"); }}
        />
      )}
    </div>
  );
}