"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Package,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
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
  createWeeklyOrders,
  receiveOrder,
  type OrderProduct,
  type OrderRow,
  type OrderSupplier,
  type OrdersPageData,
} from "./action";
import type { OrderStatus } from "@/generated/prisma/enums";

type WeekQty = Record<string, number[]>;
type PageView = "create" | "history";
type FilterStatus = "ALL" | OrderStatus;

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const cardClass =
  "bg-(--bg-base) border border-(--border-chart) shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)] font-mono";

const fmtVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const fmtCompact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: <Clock className="w-3 h-3" />,
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  DELIVERING: {
    label: "Đang giao",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Package className="w-3 h-3" />,
  },
  DELIVERED: {
    label: "Đã nhận đủ",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const itemStatusConfig = {
  PENDING: "Chưa nhận",
  PARTIAL: "Nhận một phần",
  RECEIVED: "Đã nhận đủ",
};

function startOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + diff);
  return monday;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function displayShortDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function WeeklyOrderTable({
  supplier,
  weekQty,
  dayLabels,
  onQtyChange,
  onAutoFill,
}: {
  supplier: OrderSupplier;
  weekQty: WeekQty;
  dayLabels: string[];
  onQtyChange: (productId: string, dayIdx: number, value: number) => void;
  onAutoFill: (productId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const filtered = supplier.products.filter((product) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  });

  const grouped = useMemo(() => {
    const map: Record<string, OrderProduct[]> = {};
    filtered.forEach((product) => {
      map[product.category] ??= [];
      map[product.category].push(product);
    });
    return map;
  }, [filtered]);

  const rowTotal = (productId: string) =>
    (weekQty[productId] ?? Array(7).fill(0)).reduce((sum, value) => sum + value, 0);

  const dayTotal = (dayIdx: number) =>
    supplier.products.reduce(
      (sum, product) =>
        sum + ((weekQty[product.id] ?? Array(7).fill(0))[dayIdx] ?? 0) * product.price,
      0,
    );

  const grandTotal = supplier.products.reduce(
    (sum, product) => sum + rowTotal(product.id) * product.price,
    0,
  );

  const activeProductCount = supplier.products.filter((product) => rowTotal(product.id) > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

      <div className="overflow-x-auto rounded-xl border border-(--border-chart)">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr style={{ background: supplier.colorLight }}>
              <th className="text-left px-3 py-2.5 text-(--text-secondary) font-medium w-[280px] sticky left-0 z-10" style={{ background: supplier.colorLight }}>
                Sản phẩm
              </th>
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-14">ĐVT</th>
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-14">Tồn</th>
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-10" title="Gợi ý theo sức bán">
                <TrendingUp className="w-3 h-3 inline text-(--text-muted)" />
              </th>
              {DAYS.map((day, index) => (
                <th key={day} className="text-center px-1 py-2 w-16">
                  <div className="font-semibold" style={{ color: supplier.color }}>
                    {day}
                  </div>
                  <div className="text-[10px] text-(--text-muted) font-normal">{dayLabels[index]}</div>
                </th>
              ))}
              <th className="text-center px-2 py-2.5 text-(--text-secondary) font-medium w-16">Tổng SL</th>
              <th className="text-right px-3 py-2.5 text-(--text-secondary) font-medium w-24">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([category, products]) => {
              const isExpanded = expandedCats[category] !== false;

              return (
                <Fragment key={category}>
                  <tr
                    className="cursor-pointer hover:bg-(--bg-table)/80"
                    style={{ background: `${supplier.colorLight}88` }}
                    onClick={() => setExpandedCats((prev) => ({ ...prev, [category]: !isExpanded }))}
                  >
                    <td colSpan={12} className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3 text-(--text-muted)" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-(--text-muted)" />
                        )}
                        <span className="font-semibold text-(--text-secondary) uppercase tracking-wide text-[10px]">
                          {category}
                        </span>
                        <span className="text-[10px] text-(--text-muted)">· {products.length} sản phẩm</span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded &&
                    products.map((product) => {
                      const qty = weekQty[product.id] ?? Array(7).fill(0);
                      const total = rowTotal(product.id);
                      const hasAny = total > 0;

                      return (
                        <tr
                          key={product.id}
                          className={`border-t border-(--border-chart) transition-colors ${hasAny ? "" : "opacity-70"} hover:bg-(--bg-table)/40`}
                        >
                          <td className="px-3 py-2 sticky left-0 bg-(--bg-base) z-10 border-r border-(--border-chart)">
                            <div className="font-medium text-(--text-primary) leading-tight text-[11px]">{product.name}</div>
                            <div className="text-[10px] text-(--text-muted) mt-0.5">{product.sku}</div>
                          </td>
                          <td className="text-center text-(--text-secondary) py-2">{product.unit}</td>
                          <td className="text-center text-(--text-secondary) py-2">{product.stock}</td>
                          <td className="text-center py-2">
                            <button
                              onClick={() => onAutoFill(product.id)}
                              title={`Điền tự động theo sức bán TB (${product.avgDaily}/${product.unit}/ngày)`}
                              className="text-(--text-muted) hover:text-(--color-active) cursor-pointer transition-colors"
                            >
                              <TrendingUp className="w-3 h-3" />
                            </button>
                          </td>
                          {DAYS.map((_, dayIdx) => (
                            <td key={dayIdx} className="text-center px-1 py-1.5">
                              <input
                                type="number"
                                min={0}
                                value={qty[dayIdx] === 0 ? "" : qty[dayIdx]}
                                placeholder="-"
                                onChange={(event) => {
                                  const value = Math.max(parseInt(event.target.value, 10) || 0, 0);
                                  onQtyChange(product.id, dayIdx, value);
                                }}
                                className={`w-12 text-center py-1 rounded-md border text-xs outline-none transition-all ${
                                  qty[dayIdx] > 0
                                    ? "font-semibold text-(--text-primary) border-(--color-active) bg-(--bg-table)"
                                    : "text-(--text-muted) border-(--border-button) bg-transparent placeholder-text-(--text-label)"
                                } focus:border-(--color-active) focus:bg-(--bg-table) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                              />
                            </td>
                          ))}
                          <td className="text-center py-2">
                            {total > 0 ? (
                              <span className="font-bold text-(--text-primary)">{total}</span>
                            ) : (
                              <span className="text-(--text-muted)">-</span>
                            )}
                          </td>
                          <td className="text-right px-3 py-2">
                            {total > 0 ? (
                              <span className="font-semibold" style={{ color: supplier.color }}>
                                {fmtCompact(total * product.price)}
                              </span>
                            ) : (
                              <span className="text-(--text-muted)">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}

            <tr className="border-t-2 border-(--border-chart)" style={{ background: supplier.colorLight }}>
              <td className="px-3 py-2.5 font-semibold text-(--text-primary) sticky left-0 z-10" style={{ background: supplier.colorLight }}>
                Tổng giá trị / ngày
              </td>
              <td colSpan={3} />
              {DAYS.map((_, dayIdx) => {
                const value = dayTotal(dayIdx);
                return (
                  <td key={dayIdx} className="text-center py-2.5 px-1">
                    {value > 0 ? (
                      <span className="font-semibold text-[11px]" style={{ color: supplier.color }}>
                        {fmtCompact(value)}
                      </span>
                    ) : (
                      <span className="text-(--text-muted)">-</span>
                    )}
                  </td>
                );
              })}
              <td />
              <td className="text-right px-3 py-2.5">
                <span className="font-bold text-sm" style={{ color: supplier.color }}>
                  {grandTotal > 0 ? fmtVND(grandTotal) : "-"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PODetailModal({
  po,
  pending,
  error,
  onClose,
  onReceive,
}: {
  po: OrderRow;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onReceive: (items: { orderItemId: string; receive: number }[]) => void;
}) {
  const [receiveQty, setReceiveQty] = useState<Record<string, number>>(
    Object.fromEntries(po.orderItems.map((item) => [item.id, item.remainingQuantity])),
  );
  const canReceive = po.status !== "DELIVERED" && po.status !== "REJECTED";
  const receiveItems = po.orderItems
    .map((item) => ({
      orderItemId: item.id,
      receive: Math.min(receiveQty[item.id] ?? 0, item.remainingQuantity),
    }))
    .filter((item) => item.receive > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-(--bg-base) border border-(--border-chart) rounded-2xl shadow-2xl w-full max-w-3xl max-h-[84vh] overflow-hidden flex flex-col mx-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-(--border-chart)">
          <div>
            <h2 className="text-sm font-bold text-(--text-primary)">{po.code}</h2>
            <p className="text-xs text-(--text-secondary) mt-0.5">
              {po.supplier} · {po.createdAt}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[po.status].color}`}>
              {statusConfig[po.status].icon}
              {statusConfig[po.status].label}
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
                <TableHead className="text-xs text-(--text-secondary) text-center">Đã nhận</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">Còn lại</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-center">Nhận lần này</TableHead>
                <TableHead className="text-xs text-(--text-secondary) text-right pr-4">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.orderItems.map((item) => (
                <TableRow key={item.id} className="border-(--border-chart) hover:bg-(--bg-table)/40">
                  <TableCell className="pl-4">
                    <p className="text-xs font-medium text-(--text-primary)">{item.name}</p>
                    <p className="text-[10px] text-(--text-muted)">
                      {item.sku} · {itemStatusConfig[item.status]}
                    </p>
                  </TableCell>
                  <TableCell className="text-center text-xs text-(--text-secondary)">{item.unit}</TableCell>
                  <TableCell className="text-center text-xs font-semibold text-(--text-primary)">{item.quantity}</TableCell>
                  <TableCell className="text-center text-xs text-(--color-success) font-semibold">{item.receivedQuantity}</TableCell>
                  <TableCell className="text-center text-xs text-(--text-secondary)">{item.remainingQuantity}</TableCell>
                  <TableCell className="text-center">
                    <input
                      type="number"
                      min={0}
                      max={item.remainingQuantity}
                      disabled={!canReceive || item.remainingQuantity === 0}
                      value={receiveQty[item.id] ?? 0}
                      onChange={(event) => {
                        const value = Math.max(parseInt(event.target.value, 10) || 0, 0);
                        setReceiveQty((prev) => ({
                          ...prev,
                          [item.id]: Math.min(value, item.remainingQuantity),
                        }));
                      }}
                      className="w-16 text-center text-xs border border-(--border-button) rounded-md py-0.5 bg-(--bg-table) text-(--text-primary) outline-none focus:border-(--color-active) disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-(--text-primary) pr-4">
                    {fmtVND(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-(--border-chart) space-y-3">
          {error && <div className="text-xs text-(--color-danger)">{error}</div>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {po.note && <p className="text-xs text-(--text-secondary)">Ghi chú: {po.note}</p>}
              <p className="text-xs text-(--text-muted) mt-0.5">
                Giao: {po.deliveryDate ?? "-"} {po.receivedAt ? `· Nhận đủ: ${po.receivedAt}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-(--color-danger)">{fmtVND(po.total)}</span>
              {canReceive && (
                <button
                  disabled={pending || receiveItems.length === 0}
                  onClick={() => onReceive(receiveItems)}
                  className="flex items-center gap-1.5 text-xs text-white bg-(--color-active) rounded-lg px-3 py-2 cursor-pointer hover:bg-(--accent-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pending ? "Đang nhận..." : "Xác nhận nhập kho"}
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
    </div>
  );
}

function SuccessModal({ poCodes, onClose }: { poCodes: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-(--bg-base) border border-(--border-chart) rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-(--color-success)" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-(--text-primary)">Tạo PO thành công!</h3>
          <p className="text-xs text-(--text-secondary) mt-1 leading-relaxed">
            Đã tạo <span className="font-semibold">{poCodes.length} Purchase Order</span>:<br />
            {poCodes.join(" · ")}
          </p>
          <p className="text-xs text-(--text-muted) mt-1">Kho chưa tăng cho tới khi nhận hàng.</p>
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

export default function OrdersClient({ initialData }: { initialData: OrdersPageData }) {
  const router = useRouter();
  const weekDates = useMemo(() => {
    const monday = startOfCurrentWeek();
    return DAYS.map((_, index) => addDays(monday, index));
  }, []);
  const dayLabels = weekDates.map(displayShortDate);
  const dayKeys = weekDates.map(toDateKey);

  const [view, setView] = useState<PageView>("create");
  const [activeSupplier, setActiveSupplier] = useState(initialData.suppliers[0]?.id ?? "");
  const [suppliers] = useState(initialData.suppliers);
  const [weekQtyMap, setWeekQtyMap] = useState<Record<string, WeekQty>>(
    Object.fromEntries(initialData.suppliers.map((supplier) => [supplier.id, {}])),
  );
  const [note, setNote] = useState("");
  const [poList, setPoList] = useState<OrderRow[]>(initialData.orders);
  const [selectedPO, setSelectedPO] = useState<OrderRow | null>(null);
  const [showSuccess, setShowSuccess] = useState<string[] | null>(null);
  const [poFilter, setPoFilter] = useState<FilterStatus>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentSupplier = suppliers.find((supplier) => supplier.id === activeSupplier) ?? suppliers[0];
  const currentWeekQty = currentSupplier ? weekQtyMap[currentSupplier.id] ?? {} : {};

  const supplierSummary = useMemo(() => {
    return suppliers.map((supplier) => {
      const qty = weekQtyMap[supplier.id] ?? {};
      const activeProducts = Object.entries(qty).filter(([, days]) => days.some((value) => value > 0));
      const total = activeProducts.reduce((sum, [productId, days]) => {
        const product = supplier.products.find((p) => p.id === productId);
        if (!product) return sum;
        return sum + days.reduce((daySum, value) => daySum + value, 0) * product.price;
      }, 0);

      return { id: supplier.id, activeProducts: activeProducts.length, total };
    });
  }, [suppliers, weekQtyMap]);

  const totalGrandValue = supplierSummary.reduce((sum, item) => sum + item.total, 0);
  const totalActiveProducts = supplierSummary.reduce((sum, item) => sum + item.activeProducts, 0);
  const filteredPOs = poFilter === "ALL" ? poList : poList.filter((po) => po.status === poFilter);
  const deliveringCount = poList.filter((po) => po.status === "DELIVERING").length;

  const handleQtyChange = (productId: string, dayIdx: number, value: number) => {
    if (!currentSupplier) return;

    setWeekQtyMap((prev) => {
      const supplierQty = { ...(prev[currentSupplier.id] ?? {}) };
      const row = [...(supplierQty[productId] ?? Array(7).fill(0))];
      row[dayIdx] = value;
      supplierQty[productId] = row;
      return { ...prev, [currentSupplier.id]: supplierQty };
    });
  };

  const handleAutoFill = (productId: string) => {
    if (!currentSupplier) return;
    const product = currentSupplier.products.find((item) => item.id === productId);
    if (!product) return;

    const autoQty = DAYS.map((_, index) =>
      index >= 5 ? Math.ceil(product.avgDaily * 1.4) : product.avgDaily,
    );

    setWeekQtyMap((prev) => ({
      ...prev,
      [currentSupplier.id]: {
        ...(prev[currentSupplier.id] ?? {}),
        [productId]: autoQty,
      },
    }));
  };

  const handleCreatePO = () => {
    const orders = suppliers.flatMap((supplier) => {
      const qty = weekQtyMap[supplier.id] ?? {};

      return dayKeys
        .map((deliveryDateKey, dayIdx) => {
          const items = Object.entries(qty)
            .map(([productId, days]) => ({ productId, quantity: days[dayIdx] ?? 0 }))
            .filter((item) => item.quantity > 0);

          return { supplierId: supplier.id, deliveryDateKey, items };
        })
        .filter((order) => order.items.length > 0);
    });

    if (orders.length === 0) return;
    setError(null);

    startTransition(async () => {
      const result = await createWeeklyOrders({ note, orders });

      if (!result.success) {
        setError(result.error ?? "Không thể tạo PO.");
        return;
      }

      const created = result.data ?? [];
      setPoList((prev) => [...created, ...prev]);
      setWeekQtyMap(Object.fromEntries(suppliers.map((supplier) => [supplier.id, {}])));
      setNote("");
      setShowSuccess(created.map((po) => po.code));
      router.refresh();
    });
  };

  const handleReceive = (items: { orderItemId: string; receive: number }[]) => {
    if (!selectedPO) return;
    setError(null);

    startTransition(async () => {
      const result = await receiveOrder({ orderId: selectedPO.id, items });

      if (!result.success) {
        setError(result.error ?? "Không thể nhận hàng.");
        return;
      }

      if (result.data) {
        setPoList((prev) => prev.map((po) => (po.id === result.data?.id ? result.data : po)));
        setSelectedPO(result.data);
      }

      router.refresh();
    });
  };

  if (!currentSupplier) {
    return (
      <div className="p-6 min-h-screen">
        <Card className={cardClass}>
          <CardContent className="p-6 text-sm text-(--text-secondary)">
            Chưa có nhà cung cấp/sản phẩm. Hãy chạy seed dữ liệu trước khi tạo PO.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-md font-bold text-(--text-primary)">ĐẶT HÀNG</h1>
          <p className="text-xs text-(--text-secondary) mt-0.5">
            Đặt hàng chưa tăng kho · Nhận hàng mới cập nhật tồn kho và ghi InventoryLog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-(--bg-table) rounded-lg p-1">
            {(["create", "history"] as PageView[]).map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  view === item
                    ? "bg-(--bg-base) text-(--text-primary) shadow-sm border border-(--border-button)"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {item === "create" ? "Lên lịch tuần" : "Lịch sử PO"}
              </button>
            ))}
          </div>
          {deliveringCount > 0 && (
            <button
              onClick={() => setView("history")}
              className="flex items-center gap-1.5 bg-(--color-info) text-white text-xs font-semibold rounded-lg px-3 py-2 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              {deliveringCount} đang giao
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-xs text-(--color-danger) bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg px-3 py-2">{error}</div>}

      {view === "create" ? (
        <div className="space-y-4">
          {totalActiveProducts > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-(--bg-table) border border-(--border-chart) rounded-xl px-4 py-3">
              <div className="flex flex-wrap items-center gap-6">
                {supplierSummary.map((summary) => {
                  const supplier = suppliers.find((item) => item.id === summary.id);
                  if (!supplier || summary.activeProducts === 0) return null;

                  return (
                    <div key={summary.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: supplier.color }} />
                      <span className="text-xs text-(--text-secondary)">{supplier.short}:</span>
                      <span className="text-xs font-semibold text-(--text-primary)">{summary.activeProducts} sp</span>
                      <span className="text-xs font-bold" style={{ color: supplier.color }}>
                        {fmtCompact(summary.total)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-(--text-secondary)">Tổng đơn tuần</div>
                  <div className="text-sm font-bold text-(--color-danger)">{fmtVND(totalGrandValue)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ghi chú cho tất cả PO..."
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="text-xs bg-(--bg-base) border border-(--border-button) rounded-lg px-3 py-2 text-(--text-primary) outline-none focus:border-(--color-active) w-48 transition-colors"
                  />
                  <button
                    onClick={handleCreatePO}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-(--color-active) text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-(--accent-hover) transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {isPending ? "Đang tạo..." : "Tạo PO"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-(--border-chart) overflow-x-auto">
            {suppliers.map((supplier) => {
              const summary = supplierSummary.find((item) => item.id === supplier.id);
              const isActive = activeSupplier === supplier.id;

              return (
                <button
                  key={supplier.id}
                  onClick={() => setActiveSupplier(supplier.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer -mb-px whitespace-nowrap ${
                    isActive
                      ? "border-[var(--sup-color)]"
                      : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
                  }`}
                  style={isActive ? ({ "--sup-color": supplier.color, color: supplier.color } as React.CSSProperties) : undefined}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: supplier.color }} />
                  {supplier.short}
                  <span className="text-[10px] text-(--text-secondary)">· {supplier.products.length} sp</span>
                  {(summary?.activeProducts ?? 0) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ background: supplier.color }}>
                      {summary?.activeProducts}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: currentSupplier.color }} />
            <div>
              <span className="text-sm font-semibold text-(--text-primary)">{currentSupplier.short}</span>
              <span className="text-xs text-(--text-secondary) ml-2">{currentSupplier.name}</span>
            </div>
            <span className="text-xs text-(--text-muted) ml-auto">
              Nhấn <TrendingUp className="w-3 h-3 inline" /> để tự điền theo sức bán trung bình · T7/CN +40%
            </span>
          </div>

          <WeeklyOrderTable
            supplier={currentSupplier}
            weekQty={currentWeekQty}
            dayLabels={dayLabels}
            onQtyChange={handleQtyChange}
            onAutoFill={handleAutoFill}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Tổng PO", value: poList.length, sub: "trong hệ thống" },
              { label: "Đang giao", value: deliveringCount, sub: "cần theo dõi", color: "text-(--color-info)" },
              { label: "Đã nhận đủ", value: poList.filter((po) => po.status === "DELIVERED").length, sub: "đã tăng kho", color: "text-(--color-success)" },
              { label: "Chờ xác nhận", value: poList.filter((po) => po.status === "PENDING").length, sub: "chưa tăng kho", color: "text-(--color-warning)" },
            ].map((item) => (
              <div key={item.label} className="bg-(--bg-table) rounded-xl p-4">
                <div className="text-xs text-(--text-secondary) mb-1">{item.label}</div>
                <div className={`text-2xl font-semibold ${item.color ?? "text-(--text-primary)"}`}>{item.value}</div>
                <div className="text-xs text-(--text-muted) mt-1">{item.sub}</div>
              </div>
            ))}
          </div>

          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Danh Sách Purchase Order</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Nhập SL thực nhận để cập nhật tồn kho. PO giữ nguyên lịch sử đặt hàng.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["ALL", "PENDING", "APPROVED", "DELIVERING", "DELIVERED", "REJECTED"] as FilterStatus[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPoFilter(filter)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer transition-all ${
                        poFilter === filter
                          ? "bg-(--color-active) text-white"
                          : "bg-(--bg-table) text-(--text-secondary) border border-(--border-button) hover:text-(--text-primary)"
                      }`}
                    >
                      {filter === "ALL" ? "Tất cả" : statusConfig[filter].label}
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
                    <TableHead className="text-xs text-(--text-secondary) text-center pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow
                      key={po.id}
                      className="border-(--border-chart) hover:bg-(--bg-table)/60 cursor-pointer"
                      onClick={() => {
                        setError(null);
                        setSelectedPO(po);
                      }}
                    >
                      <TableCell className="pl-4 font-mono text-xs font-semibold text-(--text-primary)">{po.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: po.supplierColor }} />
                          <span className="text-xs text-(--text-primary)">{po.supplier}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-(--text-secondary)">{po.items}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-(--text-primary)">{fmtVND(po.total)}</TableCell>
                      <TableCell className="text-xs text-(--text-secondary)">{po.createdAt}</TableCell>
                      <TableCell className="text-xs font-medium text-(--text-primary)">{po.deliveryDate ?? "-"}</TableCell>
                      <TableCell className="text-xs text-(--text-muted) max-w-[120px] truncate">{po.note || "-"}</TableCell>
                      <TableCell className="text-center">
                        <span className={`flex items-center justify-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium w-fit mx-auto ${statusConfig[po.status].color}`}>
                          {statusConfig[po.status].icon}
                          {statusConfig[po.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-4">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setError(null);
                            setSelectedPO(po);
                          }}
                          className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPOs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-xs text-(--text-muted) py-8">
                        Chưa có PO phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedPO && (
        <PODetailModal
          po={selectedPO}
          pending={isPending}
          error={error}
          onClose={() => {
            setSelectedPO(null);
            setError(null);
          }}
          onReceive={handleReceive}
        />
      )}
      {showSuccess && (
        <SuccessModal
          poCodes={showSuccess}
          onClose={() => {
            setShowSuccess(null);
            setView("history");
          }}
        />
      )}
    </div>
  );
}
