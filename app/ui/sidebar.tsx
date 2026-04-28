"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Trash2,
  Users,
  CalendarDays,
  BarChart3,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import Image from "next/image";

const menu = [
  {
    label: "VẬN HÀNH",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Tồn Kho", href: "/inventory", icon: Boxes },
      { name: "Đặt Hàng", href: "/orders", icon: ShoppingCart },
      { name: "Hỏng Hủy", href: "/waste", icon: Trash2 },
    ],
  },
  {
    label: "NHÂN SỰ",
    items: [
      { name: "Quản Lý Nhân Sự", href: "/staff", icon: Users },
      { name: "Phân Ca", href: "/shifts", icon: CalendarDays },
    ],
  },
  {
    label: "PHÂN TÍCH",
    items: [{ name: "Báo cáo", href: "/reports", icon: BarChart3 }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-full flex flex-col border-r border-(--border-base) bg-(--bg-base) transition-all duration-200 ${
        collapsed ? "w-[52px]" : "w-48"
      }`}
    >
      {/* Top */}
      <div
        className={`flex items-center h-14 border-b border-(--border-button)
        ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}
      >
        {!collapsed && (
          <div className="relative w-20 h-12 flex-1">
            <Image
              src="/logo_dashboard.png"
              alt="Winmart+ logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-5 h-5 flex items-center justify-center rounded
          text-(--text-sidebar)
          hover:text-(--text-primary)
          hover:bg-(--bg-button)
          transition-colors shrink-0"
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {menu.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <p
                className={`text-xs text-(--text-label) px-3 mb-2 overflow-hidden transition-all duration-300
                ${collapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-2"}`}
              >
                {section.label}
              </p>
            ) : (
              <div className="mx-3 my-1 border-t border-[#D8D3C8] dark:border-[#2C2C2A]" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center py-2 relative transition-colors
                      ${collapsed ? "justify-center px-0" : "px-4"}
                      ${
                        isActive
                          ? "text-(--color-active) font-semibold bg-(--bg-sidebar-active)"
                          : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-button)"
                      }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-1.25 bg-(--color-active) rounded-r" />
                    )}

                    <Icon
                      size={16}
                      className={isActive ? "opacity-100" : "opacity-60"}
                    />

                    {!collapsed && (
                      <span
                        className={`text-xs whitespace-nowrap overflow-hidden transition-all duration-300
                        ${collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2"}`}
                      >
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className={`border-t border-(--border-button) p-3 flex items-center 
        ${collapsed ? "justify-center" : "gap-3"}`}
      >
        <div className="w-7 h-7 shrink-0 rounded-full bg-(--bg-button) border border-(--border-button) hover:bg-(--bg-button-hover) transition flex items-center justify-center text-(--text-muted)">
          Đ
        </div>

        {!collapsed && (
          <div
            className={`text-[13px] overflow-hidden transition-all duration-300
            ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            <p className="font-medium text-(--color-active) whitespace-nowrap">
              Nguyễn Văn Đạt
            </p>
            <p className="text-(--text-muted) text-[11px] whitespace-nowrap">
              Cửa Hàng Trưởng
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
