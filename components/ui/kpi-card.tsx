// components/ui/kpi-card.tsx
// Đặt file này tại: components/ui/kpi-card.tsx

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeltaType = "up" | "down" | "warn";

export interface KpiCardProps {
  /** Tiêu đề hiển thị phía trên (in hoa, mono) */
  title: string;
  /** Giá trị chính — đã format sẵn từ ngoài truyền vào (VD: "108.900.000 ₫", "421", "2.4%") */
  value: string;
  /** Chuỗi thay đổi phụ, hiển thị phía dưới value (VD: "+11.4%", "-0.3%", "+3 SKU") */
  change?: string;
  /**
   * Loại delta để quyết định màu sắc & icon prefix:
   *  - "up"   → xanh lá, prefix ▲
   *  - "down" → đỏ,     prefix ▼
   *  - "warn" → cam,    prefix ⚠
   *  - undefined → neutral (xám)
   */
  deltaType?: DeltaType;
  /** Icon hiển thị góc phải (Lucide hoặc bất kỳ ReactNode) */
  icon: React.ReactNode;
  /** Dòng phụ nhỏ bên dưới value (tùy chọn, VD: "đang theo dõi", "cần nhắc nhở") */
  sub?: string;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const STATE_STYLES = {
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
} satisfies Record<DeltaType, object>;

const NEUTRAL_STYLES = {
  border: "border-[#A8A29A] dark:border-[#3C3C3A]",
  shadow: "shadow-[2px_2px_0px_2px_rgba(168,162,154,0.15)]",
  valueColor: "text-[#1A1A1A] dark:text-white",
  deltaColor: "text-[#B0ABA3]",
  dot: "bg-[#B0ABA3]",
  prefix: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function KpiCard({
  title,
  value,
  change,
  deltaType,
  icon,
  sub,
}: KpiCardProps) {
  const s = deltaType ? STATE_STYLES[deltaType] : NEUTRAL_STYLES;

  return (
    <div
      className={[
        "rounded p-4 bg-(--bg-base) border-2 flex flex-col gap-1",
        s.border,
        s.shadow,
      ].join(" ")}
    >
      {/* Header: label + icon */}
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

      {/* Value */}
      <p className={`text-2xl font-bold font-mono mt-1 ${s.valueColor}`}>
        {value}
      </p>

      {/* Change delta */}
      {change && (
        <p className={`text-[11px] font-mono ${s.deltaColor}`}>
          {s.prefix ? `${s.prefix} ${change}` : change}
        </p>
      )}

      {/* Optional sub-label (dùng thay change nếu không có delta) */}
      {!change && sub && (
        <p className="text-[11px] font-mono text-[#B0ABA3]">{sub}</p>
      )}
    </div>
  );
}

/**
import { KpiCard } from "@/components/ui/kpi-card";
import { Users } from "lucide-react";

// Inventory page
<KpiCard title="Tổng sản phẩm" value="52" sub="đang theo dõi" deltaType="up" icon={<Package />} />
<KpiCard title="Hết hàng" value="52" change="cần nhập ngay" deltaType="down" icon={<AlertCircle />} />

// Nhân sự page
<KpiCard title="Tổng nhân viên" value="3" sub="đang theo dõi" deltaType="up" icon={<Users />} />
<KpiCard title="Chưa check-in" value="0" sub="cần nhắc nhở" icon={<Clock />} />

 */