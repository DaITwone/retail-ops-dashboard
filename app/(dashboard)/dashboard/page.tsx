/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
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
  ShoppingCart,
  Package,
  Trash2,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const revenueData = [
  { date: "18/04", revenue: 84200000, orders: 312 },
  { date: "19/04", revenue: 91500000, orders: 345 },
  { date: "20/04", revenue: 78300000, orders: 289 },
  { date: "21/04", revenue: 102400000, orders: 401 },
  { date: "22/04", revenue: 96700000, orders: 378 },
  { date: "23/04", revenue: 115200000, orders: 452 },
  { date: "24/04", revenue: 108900000, orders: 421 },
];

const topProducts = [
  { name: "Sữa TH True Milk 1L", sold: 284, revenue: 8520000 },
  { name: "Trứng gà CP (vỉ 10)", sold: 231, revenue: 4389000 },
  { name: "Thịt heo ba chỉ 500g", sold: 198, revenue: 9900000 },
  { name: "Mì Hảo Hảo thùng 30g", sold: 176, revenue: 2816000 },
  { name: "Nước suối Aquafina 500ml", sold: 163, revenue: 1467000 },
  { name: "Dầu ăn Neptune 1L", sold: 142, revenue: 5538000 },
];

const cancelReasons = [
  { name: "Hết hạn SD", value: 38, color: "#ef4444" },
  { name: "Hàng hỏng", value: 27, color: "#f97316" },
  { name: "Khách trả", value: 21, color: "#eab308" },
  { name: "Lỗi nhập kho", value: 14, color: "#6b7280" },
];

const inventoryByCategory = [
  { category: "Thực phẩm tươi sống", current: 420, minimum: 300 },
  { category: "Đồ uống", current: 890, minimum: 400 },
  { category: "Bánh kẹo", current: 156, minimum: 200 },
  { category: "Gia vị / Nấu ăn", current: 310, minimum: 150 },
  { category: "Chăm sóc cá nhân", current: 88, minimum: 120 },
];

const recentOrders = [
  { id: "DH-20240", supplier: "Metro C&C", items: 24, total: 18400000, status: "Đã giao", time: "08:15" },
  { id: "DH-20239", supplier: "Vissan", items: 12, total: 9600000, status: "Đang giao", time: "09:42" },
  { id: "DH-20238", supplier: "TH TrueMilk", items: 36, total: 24300000, status: "Đã giao", time: "10:07" },
  { id: "DH-20237", supplier: "Masan", items: 18, total: 7200000, status: "Chờ xác nhận", time: "11:30" },
  { id: "DH-20236", supplier: "Coca-Cola VN", items: 60, total: 15000000, status: "Đã giao", time: "13:00" },
];

const staffOnShift = [
  { name: "Nguyễn Thị Lan", role: "Thu ngân", shift: "06:00 – 14:00", status: "active" },
  { name: "Trần Văn Minh", role: "Kho hàng", shift: "06:00 – 14:00", status: "active" },
  { name: "Phạm Hoàng Nam", role: "Bán hàng", shift: "14:00 – 22:00", status: "upcoming" },
  { name: "Lê Thị Hoa", role: "Thu ngân", shift: "14:00 – 22:00", status: "upcoming" },
];

const lowStockItems = [
  { name: "Chăm sóc cá nhân", stock: 88, min: 120 },
  { name: "Bánh kẹo", stock: 156, min: 200 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const formatVNDFull = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const statusColor: Record<string, string> = {
  "Đã giao": "bg-green-100 text-green-700",
  "Đang giao": "bg-blue-100 text-blue-700",
  "Chờ xác nhận": "bg-yellow-100 text-yellow-700",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────


type DeltaType = "up" | "down" | "warn";

const STATE = {
  up: {
    border: "border-[#227D52]",
    shadow: "shadow-[2px_2px_0px_2px_rgba(34,125,82,0.12)]",
    valueColor: "text-[#1A1A1A] dark:text-white",
    deltaColor: "text-[#227D52]",
    dot: "bg-[#227D52]",
    prefix: "▲",
  },
  down: {
    border: "border-[#C0392B]",
    shadow: "shadow-[2px_2px_0px_2px_rgba(192,57,43,0.12)]",
    valueColor: "text-[#C0392B]",
    deltaColor: "text-[#C0392B]",
    dot: "bg-[#C0392B]",
    prefix: "▼",
  },
  warn: {
    border: "border-[#C07A2B]",
    shadow: "shadow-[2px_2px_0px_2px_rgba(192,122,43,0.12)]",
    valueColor: "text-[#C07A2B]",
    deltaColor: "text-[#C07A2B]",
    dot: "bg-[#C07A2B]",
    prefix: "⚠",
  },
} satisfies Record<DeltaType, any>;

const NEUTRAL = {
  border: "border-[#A8A29A] dark:border-[#3C3C3A]",
  shadow: "shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)]",
  valueColor: "text-[#1A1A1A] dark:text-white",
  deltaColor: "text-[#B0ABA3]",
  dot: "bg-[#B0ABA3]",
  prefix: "",
};

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  deltaType?: DeltaType;
  icon: React.ReactNode;
  sub?: string;
}

function KpiCard({
  title,
  value,
  change,
  deltaType,
  icon,
}: KpiCardProps) {
  const s = deltaType ? STATE[deltaType] : NEUTRAL;

  return (
    <div
      className={`rounded p-4 bg-(--bg-base) border-2 flex flex-col gap-1 ${s.border} ${s.shadow}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          <p className="text-[10px] font-mono text-[#B0ABA3] tracking-widest uppercase">
            {title}
          </p>
        </div>

        <div className="w-7 h-7 text-(--text-muted) rounded-sm bg-(--bg-button) flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className={`text-2xl font-bold font-mono mt-1 ${s.valueColor}`}>
        {value}
      </p>

      {change && (
        <p className={`text-[11px] font-mono ${s.deltaColor}`}>
          {s.prefix ? `${s.prefix} ${change}` : change}
        </p>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-(--bg-base) border border-gray-100 rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-red-600">Doanh thu: <span className="font-bold">{formatVNDFull(payload[0].value)}</span></p>
        <p className="text-gray-500">Đơn hàng: <span className="font-semibold">{payload[1]?.value}</span></p>
      </div>
    );
  }
  return null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const todayRevenue = revenueData[revenueData.length - 1].revenue;
  const yesterdayRevenue = revenueData[revenueData.length - 2].revenue;
  const revenueChange = (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 min-h-screen">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-md font-bold text-gray-900">TỔNG QUAN HÔM NAY</h1>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Doanh thu hôm nay"
          value={formatVNDFull(todayRevenue)}
          change={`${revenueChange}%`}
          deltaType={Number(revenueChange) > 0 ? "up" : "down"}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          title="Tổng đơn hàng"
          value="421"
          change="+11.4%"
          deltaType={Number(revenueChange) > 0 ? "up" : "down"}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <KpiCard
          title="Sản phẩm sắp hết"
          value="12 SKU"
          change="+3 SKU"
          deltaType="warn"
          icon={<Package className="w-5 h-5" />}
        />
        <KpiCard
          title="Tỉ lệ hàng hủy"
          value="2.4%"
          change="-0.3%"
          deltaType={Number(revenueChange) < 0 ? "down" : "up"}
          icon={<Trash2 className="w-5 h-5" />}
        />
      </div>

      {/* Row 2: Area Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Area Chart (2/3) */}
        <Card className="lg:col-span-2 border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] bg-(--bg-base) font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Doanh Thu 7 Ngày Gần Nhất</CardTitle>
            <CardDescription>Đơn vị: VNĐ — so sánh doanh thu và số đơn</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatVND} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                />
                <Bar dataKey="orders" fill="#fca5a5" opacity={0.4} radius={[3, 3, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cancel Reason Donut (1/3) */}
        <Card className="border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lý Do Hàng Hủy</CardTitle>
            <CardDescription>Hôm nay — 100 đơn vị bị hủy</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={cancelReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cancelReasons.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-1">
              {cancelReasons.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-gray-600">{r.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{r.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Products Bar + Inventory Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Products */}
        <Card className="border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Sản Phẩm Bán Chạy</CardTitle>
            <CardDescription>7 ngày gần nhất — theo số lượng bán</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => [`${v} sản phẩm`, "Đã bán"]} />
                <Bar dataKey="sold" fill="#ef4444" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#dc2626" : i < 3 ? "#ef4444" : "#fca5a5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory by Category */}
        <Card className="border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tồn Kho Theo Danh Mục</CardTitle>
            <CardDescription>Tồn thực tế vs mức tối thiểu yêu cầu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inventoryByCategory} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={130}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current" name="Tồn hiện tại" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="minimum" name="Mức tối thiểu" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Orders Table + Staff + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders Table (2/3) */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Đơn Đặt Hàng Mới Nhất</CardTitle>
            <CardDescription>5 đơn gần nhất từ nhà cung cấp</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="text-xs text-gray-500 pl-6">Mã đơn</TableHead>
                  <TableHead className="text-xs text-gray-500">Nhà cung cấp</TableHead>
                  <TableHead className="text-xs text-gray-500 text-center">SL mặt hàng</TableHead>
                  <TableHead className="text-xs text-gray-500 text-right">Tổng tiền</TableHead>
                  <TableHead className="text-xs text-gray-500">Trạng thái</TableHead>
                  <TableHead className="text-xs text-gray-500 pr-6">Giờ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="pl-6 font-mono text-xs font-medium text-gray-700">{order.id}</TableCell>
                    <TableCell className="text-sm text-gray-700">{order.supplier}</TableCell>
                    <TableCell className="text-center text-sm text-gray-600">{order.items}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-gray-800">
                      {formatVNDFull(order.total)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-xs text-gray-400">{order.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Staff + Low Stock */}
        <div className="space-y-4">

          {/* Staff on Shift */}
          <Card className="border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Nhân Sự Hôm Nay</CardTitle>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>4 nhân viên</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {staffOnShift.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{s.shift}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-0 shadow-sm bg-(--bg-base) border-1 border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base font-semibold">Cảnh Báo Tồn Kho Thấp</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockItems.map((item) => {
                const pct = Math.round((item.stock / item.min) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{item.name}</span>
                      <span className="text-red-500 font-semibold">{item.stock}/{item.min}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-red-500 to-orange-400"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Đạt {pct}% mức tối thiểu — cần đặt bổ sung</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}