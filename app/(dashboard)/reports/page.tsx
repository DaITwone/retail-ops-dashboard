/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  TrendingUp,
  TrendingDown,
  Package,
  Trash2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  ShoppingBag,
  Download,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "week" | "month" | "quarter" | "year";
type ReportTab = "revenue" | "inventory" | "staff" | "waste" | "supplier";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const revenueByWeek = {
  month: [
    { label: "Tuần 1", current: 482000000, prev: 410000000 },
    { label: "Tuần 2", current: 531000000, prev: 468000000 },
    { label: "Tuần 3", current: 618000000, prev: 502000000 },
    { label: "Tuần 4", current: 679000000, prev: 598000000 },
  ],
  quarter: [
    { label: "Tháng 1", current: 1920000000, prev: 1750000000 },
    { label: "Tháng 2", current: 2100000000, prev: 1890000000 },
    { label: "Tháng 3", current: 2310000000, prev: 2180000000 },
  ],
  year: [
    { label: "Q1", current: 6330000000, prev: 5820000000 },
    { label: "Q2", current: 7100000000, prev: 6500000000 },
    { label: "Q3", current: 6800000000, prev: 6200000000 },
    { label: "Q4", current: 8200000000, prev: 7400000000 },
  ],
  week: [
    { label: "T2", current: 108900000, prev: 95000000 },
    { label: "T3", current: 115200000, prev: 102000000 },
    { label: "T4", current: 96700000, prev: 91000000 },
    { label: "T5", current: 102400000, prev: 88000000 },
    { label: "T6", current: 121000000, prev: 109000000 },
    { label: "T7", current: 134000000, prev: 118000000 },
    { label: "CN", current: 98000000, prev: 87000000 },
  ],
};

const kpiCompare = {
  week: {
    revenue: { current: 776200000, prev: 690000000 },
    orders: { current: 2940, prev: 2610 },
    avgOrder: { current: 264000, prev: 264000 },
    cancelRate: { current: 2.1, prev: 2.8 },
  },
  month: {
    revenue: { current: 2310000000, prev: 2180000000 },
    orders: { current: 9840, prev: 9210 },
    avgOrder: { current: 235000, prev: 237000 },
    cancelRate: { current: 2.4, prev: 3.1 },
  },
  quarter: {
    revenue: { current: 6330000000, prev: 5820000000 },
    orders: { current: 28400, prev: 26100 },
    avgOrder: { current: 223000, prev: 223000 },
    cancelRate: { current: 2.6, prev: 3.4 },
  },
  year: {
    revenue: { current: 28430000000, prev: 25920000000 },
    orders: { current: 112000, prev: 98000 },
    avgOrder: { current: 254000, prev: 264000 },
    cancelRate: { current: 2.8, prev: 3.6 },
  },
};

const productAnalysis = [
  { name: "Sữa TH True Milk 1L", revenue: 48200000, sold: 1284, turnover: 12, margin: 18, trend: "up" },
  { name: "Trứng gà CP (vỉ 10)", revenue: 31500000, sold: 1050, turnover: 10, margin: 22, trend: "up" },
  { name: "Thịt heo ba chỉ 500g", revenue: 28900000, sold: 578, turnover: 8, margin: 14, trend: "stable" },
  { name: "Dầu ăn Simply 1L", revenue: 18900000, sold: 485, turnover: 5, margin: 20, trend: "down" },
  { name: "Mì Hảo Hảo thùng 30g", revenue: 12100000, sold: 756, turnover: 6, margin: 25, trend: "up" },
  { name: "Cải bó xôi WinEco 300g", revenue: 6800000, sold: 340, turnover: 2, margin: 12, trend: "down" },
];

const staffReport = [
  { name: "Lê Thị Hoa", role: "Thu ngân", shifts: 20, total: 26, onTime: 98, late: 0, absent: 6, grade: "A" },
  { name: "Phạm Quốc Tuấn", role: "Bán hàng", shifts: 14, total: 26, onTime: 72, late: 3, absent: 9, grade: "B" },
  { name: "Trần Văn Minh", role: "Kho hàng", shifts: 22, total: 26, onTime: 95, late: 1, absent: 3, grade: "A" },
  { name: "Nguyễn Thị Ngọc Nga", role: "Thu ngân", shifts: 0, total: 26, onTime: 0, late: 0, absent: 26, grade: "—" },
  { name: "Trần Văn Bình", role: "Bán hàng", shifts: 0, total: 26, onTime: 0, late: 0, absent: 26, grade: "—" },
];

const wasteByReason = [
  { reason: "Hết hạn SD", qty: 38, value: 4200000, pct: 38 },
  { reason: "Hàng hỏng / Dập nát", qty: 27, value: 2900000, pct: 27 },
  { reason: "Khách trả", qty: 21, value: 1800000, pct: 21 },
  { reason: "Lỗi nhập kho", qty: 14, value: 1200000, pct: 14 },
];

const wasteByProduct = [
  { name: "Cải bó xôi WinEco 300g", qty: 12, value: 216000, reason: "Hỏng / Dập nát" },
  { name: "Thịt bò Úc Wagyu 300g", qty: 3, value: 870000, reason: "Hết hạn SD" },
  { name: "Ba rọi heo MEATDeli 500g", qty: 5, value: 475000, reason: "Hết hạn SD" },
  { name: "Sườn non heo MEATDeli", qty: 1, value: 95000, reason: "Khác" },
  { name: "Rau muống WinEco 300g", qty: 8, value: 96000, reason: "Hỏng / Dập nát" },
];

const supplierReport = [
  { name: "Công ty CP Masan MEATLife", orders: 12, value: 48200000, onTime: 92, quality: "Tốt" },
  { name: "Công ty TNHH WinEco", orders: 8, value: 21500000, onTime: 87, quality: "Trung bình" },
  { name: "Công ty Ajinomoto", orders: 5, value: 14300000, onTime: 100, quality: "Tốt" },
  { name: "Metro C&C", orders: 3, value: 18400000, onTime: 100, quality: "Tốt" },
  { name: "Coca-Cola VN", orders: 4, value: 15000000, onTime: 75, quality: "Cần cải thiện" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
};

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const delta = (curr: number, prev: number) => {
  const pct = (((curr - prev) / prev) * 100).toFixed(1);
  return { pct, up: curr >= prev };
};

const periodLabel: Record<Period, string> = {
  week: "Tuần này",
  month: "Tháng 4 / 2026",
  quarter: "Quý 1 / 2026",
  year: "Năm 2026",
};

const prevLabel: Record<Period, string> = {
  week: "Tuần trước",
  month: "Tháng 3 / 2026",
  quarter: "Quý 4 / 2025",
  year: "Năm 2025",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const cardClass =
  "bg-(--bg-base) border border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono";

function CompareKpiCard({
  label,
  current,
  prev,
  format = "number",
  icon,
  invertDelta = false,
}: {
  label: string;
  current: number;
  prev: number;
  format?: "number" | "currency" | "percent";
  icon: React.ReactNode;
  invertDelta?: boolean;
}) {
  const d = delta(current, prev);
  const isGood = invertDelta ? !d.up : d.up;
  const display =
    format === "currency"
      ? fmt(current)
      : format === "percent"
      ? `${current}%`
      : current.toLocaleString("vi-VN");
  const prevDisplay =
    format === "currency"
      ? fmt(prev)
      : format === "percent"
      ? `${prev}%`
      : prev.toLocaleString("vi-VN");

  return (
    <div className="bg-(--bg-table) rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--text-secondary)">{label}</span>
        <span className="text-(--text-muted) opacity-60">{icon}</span>
      </div>
      <div className="text-2xl font-semibold text-(--text-primary) leading-none">{display}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--text-muted)">Kỳ trước: {prevDisplay}</span>
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            isGood ? "text-(--color-success)" : "text-(--color-danger)"
          }`}
        >
          {d.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {d.pct}%
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-(--bg-base) border border-(--border-chart) rounded-lg p-3 text-xs shadow-xl">
        <p className="font-semibold text-(--text-primary) mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="mb-0.5">
            {p.name}: <span className="font-bold">{fmt(p.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Tab Content Components ───────────────────────────────────────────────────

function RevenueTab({ period }: { period: Period }) {
  const kpi = kpiCompare[period];
  const chartData = revenueByWeek[period];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CompareKpiCard
          label="Doanh thu"
          current={kpi.revenue.current}
          prev={kpi.revenue.prev}
          format="currency"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <CompareKpiCard
          label="Số đơn hàng"
          current={kpi.orders.current}
          prev={kpi.orders.prev}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <CompareKpiCard
          label="Giá trị đơn TB"
          current={kpi.avgOrder.current}
          prev={kpi.avgOrder.prev}
          format="currency"
          icon={<Package className="w-4 h-4" />}
        />
        <CompareKpiCard
          label="Tỉ lệ hủy đơn"
          current={kpi.cancelRate.current}
          prev={kpi.cancelRate.prev}
          format="percent"
          icon={<Trash2 className="w-4 h-4" />}
          invertDelta
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* So sánh doanh thu */}
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Doanh Thu — So Sánh Kỳ Trước</CardTitle>
            <CardDescription className="text-xs">
              {periodLabel[period]} vs {prevLabel[period]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-chart)" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                <Bar dataKey="current" name="Kỳ này" fill="var(--color-danger)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="prev" name="Kỳ trước" fill="var(--border-chart)" opacity={0.5} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phân tích sản phẩm */}
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Phân Tích Sản Phẩm Theo Kỳ</CardTitle>
            <CardDescription className="text-xs">Doanh thu, vòng quay tồn kho, biên lợi nhuận</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-(--border-chart)">
                  <TableHead className="text-xs text-(--text-secondary) pl-4">Sản phẩm</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-right">DT tháng</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Vòng quay</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Biên LN</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center pr-4">XH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productAnalysis.map((p) => (
                  <TableRow key={p.name} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                    <TableCell className="pl-4 text-xs text-(--text-primary) font-medium max-w-[140px] truncate">{p.name}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-(--text-primary)">{fmt(p.revenue)}</TableCell>
                    <TableCell className="text-center text-xs text-(--text-secondary)">{p.turnover}x</TableCell>
                    <TableCell className="text-center text-xs text-(--text-secondary)">{p.margin}%</TableCell>
                    <TableCell className="text-center pr-4">
                      {p.trend === "up" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-(--color-success) inline" />
                      ) : p.trend === "down" ? (
                        <TrendingDown className="w-3.5 h-3.5 text-(--color-danger) inline" />
                      ) : (
                        <span className="text-(--text-muted) text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryTab() {
  const turnoverData = [
    { name: "Thực phẩm tươi sống", days: 3.2, target: 5 },
    { name: "Đồ uống", days: 8.1, target: 14 },
    { name: "Bánh kẹo", days: 18.5, target: 14 },
    { name: "Gia vị / Nấu ăn", days: 12.3, target: 21 },
    { name: "Chăm sóc cá nhân", days: 28.4, target: 21 },
  ];

  const stockTrend = [
    { week: "T1", inbound: 420, outbound: 380, balance: 40 },
    { week: "T2", inbound: 310, outbound: 360, balance: -50 },
    { week: "T3", inbound: 580, outbound: 420, balance: 160 },
    { week: "T4", inbound: 290, outbound: 450, balance: -160 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng SKU theo dõi</div>
          <div className="text-2xl font-semibold text-(--text-primary)">20</div>
          <div className="text-xs text-(--text-muted) mt-1">17 đang hết hàng</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Vòng quay TB</div>
          <div className="text-2xl font-semibold text-(--text-primary)">14.1 ngày</div>
          <div className="text-xs text-(--color-warning) mt-1">▲ 2.3 ngày so kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Giá trị tồn kho</div>
          <div className="text-2xl font-semibold text-(--text-primary)">84.2M</div>
          <div className="text-xs text-(--color-success) mt-1">▼ 5.1% so kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">SKU sắp hết hạn</div>
          <div className="text-2xl font-semibold text-(--color-danger)">3</div>
          <div className="text-xs text-(--text-muted) mt-1">Trong 7 ngày tới</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vòng Quay Tồn Kho Theo Danh Mục</CardTitle>
            <CardDescription className="text-xs">Số ngày tồn thực tế vs mục tiêu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={turnoverData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-chart)" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} unit=" ngày" />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={14} stroke="var(--color-warning)" strokeDasharray="4 2" label={{ value: "Mục tiêu", fill: "var(--color-warning)", fontSize: 10 }} />
                <Bar dataKey="days" name="Vòng quay (ngày)" radius={[0, 4, 4, 0]}>
                  {turnoverData.map((d, i) => (
                    <Cell key={i} fill={d.days > d.target ? "var(--color-danger)" : "var(--color-success)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Biến Động Nhập / Xuất Kho Theo Tuần</CardTitle>
            <CardDescription className="text-xs">Số lượng đơn vị nhập vs xuất — tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stockTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-chart)" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                <Line dataKey="inbound" name="Nhập kho" stroke="var(--color-info)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-info)" }} />
                <Line dataKey="outbound" name="Xuất kho" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-danger)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StaffTab() {
  const shiftDist = [
    { shift: "Ca rau 05–13", count: 4 },
    { shift: "Ca sáng 06–14", count: 7 },
    { shift: "Ca gãy 06–22", count: 2 },
    { shift: "Ca chiều 14–22", count: 6 },
    { shift: "HC01 08–17", count: 3 },
  ];

  const gradeColor: Record<string, string> = {
    A: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    B: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "—": "bg-(--bg-table) text-(--text-muted)",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng nhân viên</div>
          <div className="text-2xl font-semibold text-(--text-primary)">5</div>
          <div className="text-xs text-(--text-muted) mt-1">2 đang nghỉ dài hạn</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tỉ lệ đúng giờ TB</div>
          <div className="text-2xl font-semibold text-(--color-success)">88.3%</div>
          <div className="text-xs text-(--color-success) mt-1">▲ 3.1% kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng ca hoàn thành</div>
          <div className="text-2xl font-semibold text-(--text-primary)">56</div>
          <div className="text-xs text-(--text-muted) mt-1">/ 130 ca kế hoạch</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Số lần đi trễ</div>
          <div className="text-2xl font-semibold text-(--color-warning)">4</div>
          <div className="text-xs text-(--color-warning) mt-1">▼ 2 so kỳ trước</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`${cardClass} lg:col-span-2`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Bảng Tổng Kết Nhân Sự</CardTitle>
            <CardDescription className="text-xs">Chuyên cần, đúng giờ, xếp loại tháng</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-(--border-chart)">
                  <TableHead className="text-xs text-(--text-secondary) pl-4">Nhân viên</TableHead>
                  <TableHead className="text-xs text-(--text-secondary)">Vị trí</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Ca làm</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Đúng giờ</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Đi trễ</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">Vắng</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center pr-4">Xếp loại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffReport.map((s) => (
                  <TableRow key={s.name} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                    <TableCell className="pl-4 text-xs font-medium text-(--text-primary)">{s.name}</TableCell>
                    <TableCell className="text-xs text-(--text-secondary)">{s.role}</TableCell>
                    <TableCell className="text-center text-xs text-(--text-primary)">{s.shifts}/{s.total}</TableCell>
                    <TableCell className="text-center text-xs text-(--text-primary)">{s.onTime > 0 ? `${s.onTime}%` : "—"}</TableCell>
                    <TableCell className="text-center text-xs text-(--text-primary)">{s.late}</TableCell>
                    <TableCell className="text-center text-xs text-(--color-danger) font-medium">{s.absent}</TableCell>
                    <TableCell className="text-center pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gradeColor[s.grade]}`}>{s.grade}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Phân Bổ Ca Làm Việc</CardTitle>
            <CardDescription className="text-xs">Tháng này — tổng số ca theo loại</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={shiftDist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-chart)" opacity={0.3} />
                <XAxis dataKey="shift" tick={{ fontSize: 8, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Số ca" fill="var(--color-info)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WasteTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng đơn vị hủy</div>
          <div className="text-2xl font-semibold text-(--color-danger)">100</div>
          <div className="text-xs text-(--text-muted) mt-1">7 records tháng này</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Giá trị hủy</div>
          <div className="text-2xl font-semibold text-(--color-danger)">10.1M ₫</div>
          <div className="text-xs text-(--color-success) mt-1">▼ 18% kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tỉ lệ trên doanh thu</div>
          <div className="text-2xl font-semibold text-(--text-primary)">0.44%</div>
          <div className="text-xs text-(--color-success) mt-1">▼ 0.1% kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Sản phẩm hủy nhiều nhất</div>
          <div className="text-sm font-semibold text-(--text-primary) leading-tight mt-1">Cải bó xôi WinEco</div>
          <div className="text-xs text-(--text-muted) mt-1">12 đơn vị</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Phân Tích Lý Do Hủy</CardTitle>
            <CardDescription className="text-xs">Số lượng và giá trị theo từng nguyên nhân</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wasteByReason.map((r) => (
              <div key={r.reason}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-(--text-primary)">{r.reason}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-(--text-secondary)">{r.qty} đv</span>
                    <span className="text-xs font-semibold text-(--color-danger)">{fmtVND(r.value)}</span>
                    <span className="text-xs w-8 text-right text-(--text-muted)">{r.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-(--bg-table) rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-(--color-danger)"
                    style={{ width: `${r.pct}%`, opacity: 0.6 + r.pct / 100 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sản Phẩm Bị Hủy Nhiều Nhất</CardTitle>
            <CardDescription className="text-xs">Danh sách theo giá trị thiệt hại</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-(--border-chart)">
                  <TableHead className="text-xs text-(--text-secondary) pl-4">Sản phẩm</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-center">SL</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) text-right">Giá trị</TableHead>
                  <TableHead className="text-xs text-(--text-secondary) pr-4">Lý do</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteByProduct.map((p) => (
                  <TableRow key={p.name} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                    <TableCell className="pl-4 text-xs font-medium text-(--text-primary) max-w-[130px] truncate">{p.name}</TableCell>
                    <TableCell className="text-center text-xs text-(--text-secondary)">{p.qty}</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-(--color-danger)">{fmtVND(p.value)}</TableCell>
                    <TableCell className="pr-4 text-xs text-(--text-muted)">{p.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SupplierTab() {
  const qualityColor: Record<string, string> = {
    "Tốt": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Trung bình": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    "Cần cải thiện": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng NCC hoạt động</div>
          <div className="text-2xl font-semibold text-(--text-primary)">5</div>
          <div className="text-xs text-(--text-muted) mt-1">Tháng này</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng đơn đặt hàng</div>
          <div className="text-2xl font-semibold text-(--text-primary)">32</div>
          <div className="text-xs text-(--color-success) mt-1">▲ 4 so kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Tổng giá trị nhập</div>
          <div className="text-2xl font-semibold text-(--text-primary)">117.4M</div>
          <div className="text-xs text-(--color-success) mt-1">▲ 8.2% kỳ trước</div>
        </div>
        <div className="bg-(--bg-table) rounded-xl p-4">
          <div className="text-xs text-(--text-secondary) mb-1">Giao đúng hạn TB</div>
          <div className="text-2xl font-semibold text-(--color-success)">90.8%</div>
          <div className="text-xs text-(--color-success) mt-1">▲ 2.1% kỳ trước</div>
        </div>
      </div>

      <Card className={cardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Đánh Giá Nhà Cung Cấp</CardTitle>
          <CardDescription className="text-xs">Số đơn, giá trị, tỉ lệ giao đúng hạn, chất lượng</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-(--border-chart)">
                <TableHead className="text-xs text-(--text-secondary) pl-4">Nhà cung cấp</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">Số đơn</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-right">Giá trị</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">Đúng hạn</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center pr-4">Chất lượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierReport.map((s) => (
                <TableRow key={s.name} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                  <TableCell className="pl-4 text-xs font-medium text-(--text-primary)">{s.name}</TableCell>
                  <TableCell className="text-center text-xs text-(--text-secondary)">{s.orders}</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-(--text-primary)">{fmt(s.value)}</TableCell>
                  <TableCell className="text-center text-xs">
                    <span className={s.onTime >= 90 ? "text-(--color-success) font-semibold" : s.onTime >= 80 ? "text-(--color-warning) font-semibold" : "text-(--color-danger) font-semibold"}>
                      {s.onTime}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${qualityColor[s.quality]}`}>{s.quality}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const tabs: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
  { key: "revenue", label: "Doanh thu", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: "inventory", label: "Tồn kho", icon: <Package className="w-3.5 h-3.5" /> },
  { key: "staff", label: "Nhân sự", icon: <Users className="w-3.5 h-3.5" /> },
  { key: "waste", label: "Hồng hủy", icon: <Trash2 className="w-3.5 h-3.5" /> },
  { key: "supplier", label: "Nhà cung cấp", icon: <RotateCcw className="w-3.5 h-3.5" /> },
];

const periods: { key: Period; label: string }[] = [
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "quarter", label: "Quý" },
  { key: "year", label: "Năm" },
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="p-6 space-y-5 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-md font-bold text-(--text-primary)">BÁO CÁO</h1>
          <p className="text-xs text-(--text-secondary) mt-0.5">
            Phân tích theo kỳ — so sánh, xu hướng và đánh giá hiệu suất
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-(--bg-table) rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  period === p.key
                    ? "bg-(--bg-base) text-(--text-primary) shadow-sm border border-(--border-button)"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Period label */}
          <div className="flex items-center gap-1.5 text-xs text-(--text-secondary) bg-(--bg-table) rounded-lg px-3 py-2 border border-(--border-button)">
            <span>{periodLabel[period]}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          {/* Export */}
          <button className="flex items-center gap-1.5 text-xs text-(--text-secondary) bg-(--bg-table) rounded-lg px-3 py-2 border border-(--border-button) hover:text-(--text-primary) cursor-pointer transition-colors">
            <Download className="w-3.5 h-3.5" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-(--border-chart)">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === t.key
                ? "border-(--color-active) text-(--color-active)"
                : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "revenue" && <RevenueTab period={period} />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "staff" && <StaffTab />}
      {activeTab === "waste" && <WasteTab />}
      {activeTab === "supplier" && <SupplierTab />}
    </div>
  );
}