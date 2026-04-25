"use client";

import ThemeToggle from "./theme-toggle";
import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 border-b border-(--border-base) bg-(--bg-base) px-6 flex items-center justify-between">
      {/* LEFT */}
      <div>
        <h1 className="font-semibold text-[13px] text-(--text-primary)">
          Dashboard ·{" "}
          <span className="text-(--color-success)">Chào buổi trưa</span>
        </h1>
        <p className="text-xs text-(--text-muted)">
          Thứ Năm, 23 tháng 4, 2026
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* search */}
        <input
          placeholder="Tìm kiếm..."
          className="h-8 px-3 rounded-md border border-(--border-button) bg-(--bg-button) text-sm outline-none focus:border-(--border-focus) focus:ring-1 focus:ring-(--border-button)/30"
        />

        {/* notification */}
        <button className="p-2 text-(--text-muted) rounded-full border border-(--border-button) bg-(--bg-button) hover:bg-(--bg-button-hover) transition">
          <Bell size={14} />
        </button>

        {/* theme */}
        <ThemeToggle />

        {/* avatar */}
        <div className="w-8 h-8 rounded-full bg-(--bg-button) border border-(--border-button) hover:bg-(--bg-button-hover) transition flex items-center justify-center text-sm text-(--text-muted)">
          Đ
        </div>
      </div>
    </header>
  );
}