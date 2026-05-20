"use server";

import { auth } from "@/auth";
import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type OrderItemReceiptStatus = "PENDING" | "PARTIAL" | "RECEIVED";

export type OrderProduct = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: string;
  price: number;
  avgDaily: number;
  stock: number;
  minStock: number;
};

export type OrderSupplier = {
  id: string;
  name: string;
  short: string;
  color: string;
  colorLight: string;
  products: OrderProduct[];
};

export type OrderRow = {
  id: string;
  code: string;
  supplierId: string;
  supplier: string;
  supplierColor: string;
  items: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string | null;
  receivedAt: string | null;
  note: string;
  orderItems: OrderDetailItem[];
};

export type OrderDetailItem = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  status: OrderItemReceiptStatus;
  price: number;
};

export type OrdersPageData = {
  suppliers: OrderSupplier[];
  orders: OrderRow[];
};

export type CreateWeeklyOrdersInput = {
  note?: string;
  orders: {
    supplierId: string;
    deliveryDateKey: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }[];
};

export type ReceiveOrderInput = {
  orderId: string;
  items: {
    orderItemId: string;
    receive: number;
  }[];
};

const createWeeklyOrdersSchema = z.object({
  note: z.string().max(500).optional(),
  orders: z
    .array(
      z.object({
        supplierId: z.string().min(1),
        deliveryDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        items: z
          .array(
            z.object({
              productId: z.string().min(1),
              quantity: z.number().int().positive(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

const receiveOrderSchema = z.object({
  orderId: z.string().min(1),
  items: z
    .array(
      z.object({
        orderItemId: z.string().min(1),
        receive: z.number().int().positive(),
      }),
    )
    .min(1),
});

const supplierStyles = [
  {
    match: "meat",
    short: "MeatDeli",
    color: "#e53e3e",
    colorLight: "rgba(229,62,62,0.08)",
  },
  {
    match: "wineco",
    short: "WinEco",
    color: "#38a169",
    colorLight: "rgba(56,161,105,0.08)",
  },
  {
    match: "masan consumer",
    short: "Chin-su",
    color: "#d69e2e",
    colorLight: "rgba(214,158,46,0.08)",
  },
];

function getSupplierStyle(name: string, contact: string | null) {
  const source = `${name} ${contact ?? ""}`.toLowerCase();
  return (
    supplierStyles.find((style) => source.includes(style.match)) ?? {
      short: contact || name,
      color: "#3b82f6",
      colorLight: "rgba(59,130,246,0.08)",
    }
  );
}

function getAvgDaily(product: { category: string; sku: string }) {
  if (product.sku.startsWith("WIN-")) return product.category.includes("Rau") ? 16 : 6;
  if (product.sku.startsWith("MEAT-")) return product.category.includes("Ch") ? 4 : 7;
  return 5;
}

function getReceiptStatus(quantity: number, receivedQuantity: number): OrderItemReceiptStatus {
  if (receivedQuantity === 0) return "PENDING";
  if (receivedQuantity < quantity) return "PARTIAL";
  return "RECEIVED";
}

function formatDateTime(date: Date) {
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dateKeyToDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function getCreateOrderErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2003"
  ) {
    return "Không thể tạo PO vì dữ liệu liên kết không hợp lệ. Hãy tải lại trang và thử lại.";
  }

  return error instanceof Error ? error.message : "Không thể tạo PO.";
}

function mapOrder(order: {
  id: string;
  code: string;
  status: OrderStatus;
  totalAmount: unknown;
  deliveryDate: Date | null;
  receivedAt: Date | null;
  note: string | null;
  createdAt: Date;
  supplier: { id: string; name: string; contact: string | null };
  items: {
    id: string;
    productId: string;
    quantity: number;
    receivedQuantity: number;
    price: unknown;
    product: { sku: string; name: string; unit: string };
  }[];
}): OrderRow {
  const style = getSupplierStyle(order.supplier.name, order.supplier.contact);
  const orderItems = order.items.map((item) => {
    const receivedQuantity = Math.min(item.receivedQuantity, item.quantity);

    return {
      id: item.id,
      productId: item.productId,
      sku: item.product.sku,
      name: item.product.name,
      unit: item.product.unit,
      quantity: item.quantity,
      receivedQuantity,
      remainingQuantity: Math.max(item.quantity - receivedQuantity, 0),
      status: getReceiptStatus(item.quantity, receivedQuantity),
      price: Number(item.price),
    };
  });

  return {
    id: order.id,
    code: order.code,
    supplierId: order.supplier.id,
    supplier: style.short,
    supplierColor: style.color,
    items: orderItems.length,
    total: Number(order.totalAmount),
    status: order.status,
    createdAt: formatDateTime(order.createdAt),
    deliveryDate: order.deliveryDate ? formatDate(order.deliveryDate) : null,
    receivedAt: order.receivedAt ? formatDateTime(order.receivedAt) : null,
    note: order.note ?? "",
    orderItems,
  };
}

async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
}

async function getNextOrderNumber(tx: Pick<typeof prisma, "order">) {
  const latestOrder = await tx.order.findFirst({
    select: { code: true },
    orderBy: { code: "desc" },
  });

  const latestNumber = latestOrder ? Number(latestOrder.code.replace(/^PO-/, "")) : 20247;

  return Number.isFinite(latestNumber) ? latestNumber + 1 : 20248;
}

export async function getOrdersPageData(): Promise<OrdersPageData> {
  const [suppliers, orders] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: [{ category: "asc" }, { name: "asc" }],
          include: { inventory: true },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: true,
        items: {
          orderBy: { product: { name: "asc" } },
          include: { product: true },
        },
      },
    }),
  ]);

  return {
    suppliers: suppliers.map((supplier) => {
      const style = getSupplierStyle(supplier.name, supplier.contact);

      return {
        id: supplier.id,
        name: supplier.name,
        short: style.short,
        color: style.color,
        colorLight: style.colorLight,
        products: supplier.products.map((product) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          unit: product.unit,
          category: product.category,
          price: Number(product.price),
          avgDaily: getAvgDaily(product),
          stock: product.inventory?.quantity ?? 0,
          minStock: product.inventory?.minStock ?? 10,
        })),
      };
    }),
    orders: orders.map(mapOrder),
  };
}

export async function createWeeklyOrders(input: CreateWeeklyOrdersInput) {
  const currentUser = await requireUser();
  if (!currentUser?.isActive) {
    return { success: false, error: "Bạn cần đăng nhập để tạo PO." };
  }

  const parsed = createWeeklyOrdersSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dữ liệu tạo PO không hợp lệ." };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      let nextNumber = await getNextOrderNumber(tx);
      const result: OrderRow[] = [];
      const allProductIds = [
        ...new Set(parsed.data.orders.flatMap((order) => order.items.map((item) => item.productId))),
      ];
      const products = await tx.product.findMany({
        where: {
          id: { in: allProductIds },
          isActive: true,
        },
        include: { supplier: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));

      for (const orderInput of parsed.data.orders) {
        const hasInvalidProduct = orderInput.items.some((item) => {
          const product = productMap.get(item.productId);
          return !product || product.supplierId !== orderInput.supplierId;
        });

        if (hasInvalidProduct) {
          throw new Error("Một số sản phẩm không thuộc nhà cung cấp đã chọn.");
        }

        const totalAmount = orderInput.items.reduce((sum, item) => {
          const product = productMap.get(item.productId);
          return sum + item.quantity * Number(product?.price ?? 0);
        }, 0);

        const order = await tx.order.create({
          data: {
            code: `PO-${String(nextNumber++).padStart(5, "0")}`,
            supplierId: orderInput.supplierId,
            createdById: currentUser.id,
            status: "PENDING",
            totalAmount,
            deliveryDate: dateKeyToDate(orderInput.deliveryDateKey),
            note: parsed.data.note?.trim() || null,
          },
        });

        await tx.orderItem.createMany({
          data: orderInput.items.map((item) => {
            const product = productMap.get(item.productId);

            return {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              receivedQuantity: 0,
              price: product?.price ?? 0,
            };
          }),
        });

        const createdOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: {
            supplier: true,
            items: { include: { product: true } },
          },
        });

        if (!createdOrder) throw new Error("Không thể tải lại PO vừa tạo.");

        result.push(mapOrder(createdOrder));
      }

      return result;
    }, { timeout: 20_000 });

    revalidatePath("/orders");
    return { success: true, data: created };
  } catch (error) {
    return {
      success: false,
      error: getCreateOrderErrorMessage(error),
    };
  }
}

export async function receiveOrder(input: ReceiveOrderInput) {
  const currentUser = await requireUser();
  if (!currentUser?.isActive) {
    return { success: false, error: "Bạn cần đăng nhập để nhận hàng." };
  }

  const parsed = receiveOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Dữ liệu nhận hàng không hợp lệ." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: parsed.data.orderId },
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) throw new Error("Không tìm thấy PO.");
      if (order.status === "DELIVERED" || order.status === "REJECTED") {
        throw new Error("PO này không còn nhận hàng được nữa.");
      }

      const receiveMap = new Map(
        parsed.data.items.map((item) => [item.orderItemId, item.receive]),
      );

      for (const item of order.items) {
        const receive = receiveMap.get(item.id) ?? 0;
        if (receive <= 0) continue;

        const nextReceivedQuantity = item.receivedQuantity + receive;
        if (nextReceivedQuantity > item.quantity) {
          throw new Error(`${item.product.name}: số lượng nhận vượt quá số lượng đặt.`);
        }

        await tx.orderItem.update({
          where: { id: item.id },
          data: {
            receivedQuantity: {
              increment: receive,
            },
          },
        });

        await tx.inventory.upsert({
          where: { productId: item.productId },
          update: {
            quantity: { increment: receive },
          },
          create: {
            productId: item.productId,
            quantity: receive,
            minStock: 10,
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "IMPORT",
            quantity: receive,
            orderId: order.id,
            createdById: currentUser.id,
            note: `Nhận hàng từ ${order.code}`,
          },
        });
      }

      const refreshedItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true },
      });

      const receivedAny = refreshedItems.some((item) => item.receivedQuantity > 0);
      const receivedAll = refreshedItems.every(
        (item) => item.receivedQuantity >= item.quantity,
      );

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: receivedAll ? "DELIVERED" : receivedAny ? "DELIVERING" : order.status,
          receivedAt: receivedAll ? new Date() : order.receivedAt,
        },
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
        },
      });

      return mapOrder(updatedOrder);
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể nhận hàng.",
    };
  }
}
