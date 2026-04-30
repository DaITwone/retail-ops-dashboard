/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";

export type StockStatus = "het-hang" | "sap-het" | "ok" | "sap-het-han";

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  stock: number;
  unit: string;
  hsd: string | null;
  status: StockStatus;
  updatedAt: string;
  imageUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 3;

function getStockStatus(stock: number, expiresAt: Date | null): StockStatus {
  if (stock === 0) return "het-hang";
  if (stock < LOW_STOCK_THRESHOLD) return "sap-het";

  if (expiresAt) {
    const daysUntilExpiry =
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) return "sap-het-han";
  }

  return "ok";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getInventoryProducts(): Promise<InventoryProduct[]> {
  const products = await prisma.product.findMany({
    include: {
      supplier: true,
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    // Prisma schema có thể có trường stock, expiresAt, imageUrl — điều chỉnh theo schema thực tế
    const stock: number = (p as any).stock ?? 0;
    const expiresAt: Date | null = (p as any).expiresAt ?? null;
    const imageUrl: string | undefined = (p as any).imageUrl ?? undefined;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      supplier: p.supplier?.name ?? "",
      stock,
      unit: p.unit,
      hsd: expiresAt ? formatDate(expiresAt) : null,
      status: getStockStatus(stock, expiresAt),
      updatedAt: formatDate(p.updatedAt),
      imageUrl,
    };
  });
}
