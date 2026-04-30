// pnpm dlx tsx prisma/seed.ts

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // ─── Users ───────────────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash("123456", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@winmart.com" },
    update: {},
    create: {
      name: "Nguyễn Văn Đạt",
      email: "manager@winmart.com",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  console.log("Seeded user:", manager);

  // ─── Shifts ───────────────────────────────────────────────────────────────────
  // startTime / endTime lưu dạng số nguyên (giờ, 0–23)
  // color lưu màu nền chính — border, textColor, darkBg... tính ở frontend

  const shifts = [
    {
      code: "ca-rau",
      name: "Ca rau",
      startTime: 5,
      endTime: 13,
      color: "rgba(234,243,222,0.9)",
    },
    {
      code: "ca-sang",
      name: "Ca sáng",
      startTime: 6,
      endTime: 14,
      color: "rgba(192,221,151,0.55)",
    },
    {
      code: "ca-gay",
      name: "Ca gãy",
      startTime: 6,
      endTime: 22,
      color: "rgba(255,243,205,0.9)",
    },
    {
      code: "ca-chieu",
      name: "Ca chiều",
      startTime: 14,
      endTime: 22,
      color: "rgba(255,235,235,0.9)",
    },
    {
      code: "hc01",
      name: "HC01",
      startTime: 8,
      endTime: 17,
      color: "rgba(220,235,255,0.9)",
    },
    {
      code: "hc02",
      name: "HC02",
      startTime: 9,
      endTime: 18,
      color: "rgba(220,235,255,0.9)",
    },
  ];

  for (const shift of shifts) {
    await prisma.shift.upsert({
      where: { code: shift.code },
      update: {},
      create: shift,
    });
  }

  console.log("Seeded shifts:", shifts.length);

  // ─── Suppliers ───────────────────────────────────────────────────────────────

const suppliers = [
  {
    name: "Công ty CP Masan MEATLife",
    contact: "Masan MEATLife",
  },
  {
    name: "Công ty TNHH WinEco",
    contact: "WinEco",
  },
  {
    name: "Công ty CP Masan Consumer",
    contact: "Masan Consumer",
  },
];

for (const supplier of suppliers) {
  await prisma.supplier.upsert({
    where: { name: supplier.name }, 
    update: {},
    create: supplier,
  });
}

console.log("Seeded suppliers:", suppliers.length);

// ─── Products ───────────────────────────────────────────────────────────────

const suppliersMap = await prisma.supplier.findMany();
const getSupplierId = (name: string) => {
  const supplier = suppliersMap.find((s) => s.name === name);

  if (!supplier) {
    throw new Error(`Supplier not found: ${name}`);
  }

  return supplier.id;
};

const products = [
  // ───────────────────────── Masan MEATLife ─────────────────────────
  {
    name: "Ba rọi heo đa năng MEATDeli 500g",
    sku: "MEAT-014",
    category: "Thịt heo",
    unit: "khay",
    price: 100000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Ba rọi rút sườn MEATDeli signature 500g",
    sku: "MEAT-002",
    category: "Thịt heo",
    unit: "khay",
    price: 110000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Bắp hoa heo MEATDeli signature 460g",
    sku: "MEAT-008",
    category: "Thịt heo",
    unit: "khay",
    price: 95000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Đuôi heo MEATDeli signature 460g",
    sku: "MEAT-017",
    category: "Thịt heo",
    unit: "khay",
    price: 90000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Giò heo cắt khoanh MEATDeli 450g",
    sku: "MEAT-001",
    category: "Thịt heo",
    unit: "khay",
    price: 85000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Nạc dăm đầu giòn MEATDeli signature 500g",
    sku: "MEAT-011",
    category: "Thịt heo",
    unit: "khay",
    price: 105000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Nạc dăm heo MEATDeli 480g",
    sku: "MEAT-004",
    category: "Thịt heo",
    unit: "khay",
    price: 100000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Sườn non heo MEATDeli signature 500g",
    sku: "MEAT-012",
    category: "Thịt heo",
    unit: "khay",
    price: 120000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Sườn St. Louis MEATDeli signature 500g",
    sku: "MEAT-010",
    category: "Thịt heo",
    unit: "khay",
    price: 115000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Sụn vai heo MEATDeli 450g",
    sku: "MEAT-018",
    category: "Thịt heo",
    unit: "khay",
    price: 85000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt ba rọi heo MEATDeli 500g",
    sku: "MEAT-007",
    category: "Thịt heo",
    unit: "khay",
    price: 100000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt ba rọi heo MEATDeli signature 500g",
    sku: "MEAT-020",
    category: "Thịt heo",
    unit: "khay",
    price: 110000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt cốt lết heo MEATDeli 440g",
    sku: "MEAT-003",
    category: "Thịt heo",
    unit: "khay",
    price: 90000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt heo đặc biệt xay que MEATDeli 500g",
    sku: "MEAT-015",
    category: "Chế biến",
    unit: "khay",
    price: 95000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt heo tăng cho món nướng 520g",
    sku: "MEAT-016",
    category: "Thịt heo",
    unit: "khay",
    price: 105000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt heo xay MEATDeli 500g",
    sku: "MEAT-006",
    category: "Thịt heo",
    unit: "khay",
    price: 90000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt heo xay MEATDeli signature 480g",
    sku: "MEAT-009",
    category: "Thịt heo",
    unit: "khay",
    price: 95000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt nạc nọng phủ quy MEATDeli signature 500g",
    sku: "MEAT-013",
    category: "Thịt heo",
    unit: "khay",
    price: 115000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Thịt viên sụn gân MEATDeli 400g",
    sku: "MEAT-019",
    category: "Chế biến",
    unit: "khay",
    price: 80000,
    supplierName: "Công ty CP Masan MEATLife",
  },
  {
    name: "Xương heo MEATDeli 530g",
    sku: "MEAT-005",
    category: "Thịt heo",
    unit: "khay",
    price: 70000,
    supplierName: "Công ty CP Masan MEATLife",
  },

  // ───────────────────────── WinEco ─────────────────────────
  {
    name: "Cải bó xôi WinEco gói 300g",
    sku: "WIN-003",
    category: "Rau lá",
    unit: "gói",
    price: 20000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Cải cúc WinEco gói 300g",
    sku: "WIN-004",
    category: "Rau lá",
    unit: "gói",
    price: 18000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Cần tây lớn WinEco 1kg",
    sku: "WIN-001",
    category: "Rau lá",
    unit: "kg",
    price: 30000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Dưa lưới ruột cam WinEco 1.2kg",
    sku: "WIN-011",
    category: "Trái cây",
    unit: "trái",
    price: 60000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Giá đỗ WinEco 300g",
    sku: "WIN-005",
    category: "Rau lá",
    unit: "gói",
    price: 15000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Hành lá WinEco gói 100g",
    sku: "WIN-009",
    category: "Rau lá",
    unit: "gói",
    price: 10000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Hẹ lá WinEco 100g",
    sku: "WIN-008",
    category: "Rau lá",
    unit: "gói",
    price: 10000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Rau mầm cải ngọt WinEco 100g",
    sku: "WIN-007",
    category: "Rau mầm",
    unit: "gói",
    price: 15000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Rau mầm cải xanh WinEco 100g",
    sku: "WIN-006",
    category: "Rau mầm",
    unit: "gói",
    price: 15000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Tỏi tây WinEco 100g",
    sku: "WIN-002",
    category: "Rau lá",
    unit: "gói",
    price: 12000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Xà lách iceberg WinEco 300g",
    sku: "WIN-013",
    category: "Rau lá",
    unit: "gói",
    price: 18000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Xà lách lolo xanh WinEco 300g",
    sku: "WIN-010",
    category: "Rau lá",
    unit: "gói",
    price: 18000,
    supplierName: "Công ty TNHH WinEco",
  },
  {
    name: "Xà lách mỡ WinEco 300g",
    sku: "WIN-012",
    category: "Rau lá",
    unit: "gói",
    price: 18000,
    supplierName: "Công ty TNHH WinEco",
  },

  // ───────────────────────── Masan Consumer ─────────────────────────
  {
    name: "Dầu hào sò điệp Chin-su 500ml",
    sku: "CS-DH-001",
    category: "Gia vị",
    unit: "chai",
    price: 35000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Dầu mè Chin-su 1L",
    sku: "CS-DAU-001",
    category: "Dầu ăn",
    unit: "chai",
    price: 80000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Hạt nêm Chin-su ngọt thanh rau củ & nấm 400g",
    sku: "CS-HN-002",
    category: "Hạt nêm",
    unit: "gói",
    price: 40000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Hạt nêm Chin-su ngọt tôm thịt 400g",
    sku: "CS-HN-001",
    category: "Hạt nêm",
    unit: "gói",
    price: 40000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Hạt nêm xương hầm 5 lần Chin-su 400g",
    sku: "CS-HN-003",
    category: "Hạt nêm",
    unit: "gói",
    price: 42000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Muối ớt đỏ Chin-su 50g",
    sku: "CS-TO-003",
    category: "Gia vị",
    unit: "gói",
    price: 10000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước mắm cá cơm Chin-su 500ml",
    sku: "CS-NM-003",
    category: "Nước mắm",
    unit: "chai",
    price: 35000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước mắm Chin-su 40 độ đạm 500ml",
    sku: "CS-NM-002",
    category: "Nước mắm",
    unit: "chai",
    price: 45000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước mắm Chin-su thượng hạng 500ml",
    sku: "CS-NM-001",
    category: "Nước mắm",
    unit: "chai",
    price: 50000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước tương Chin-su tự nhiên 500ml",
    sku: "CS-NT-001",
    category: "Nước tương",
    unit: "chai",
    price: 30000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước tương Tam Thái Tử 500ml",
    sku: "CS-NT-002",
    category: "Nước tương",
    unit: "chai",
    price: 28000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Nước tương ớt Chin-su 500ml",
    sku: "CS-NT-003",
    category: "Nước tương",
    unit: "chai",
    price: 32000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Sa tế tôm Chin-su 200g",
    sku: "CS-SAT-001",
    category: "Gia vị",
    unit: "gói",
    price: 25000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Tiêu đen xay Chin-su 50g",
    sku: "CS-TIEU-001",
    category: "Gia vị",
    unit: "gói",
    price: 15000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Tương cà Chin-su 500g",
    sku: "CS-TC-001",
    category: "Tương ớt",
    unit: "gói",
    price: 20000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Tương ớt Chin-su 250g",
    sku: "CS-TO-001",
    category: "Tương ớt",
    unit: "gói",
    price: 18000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Tương ớt siêu cay Chin-su 250g",
    sku: "CS-TO-002",
    category: "Tương ớt",
    unit: "gói",
    price: 20000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Xốt gia vị gà chiên nước mắm Chin-su 200g",
    sku: "CS-XOT-002",
    category: "Xốt gia vị",
    unit: "gói",
    price: 22000,
    supplierName: "Công ty CP Masan Consumer",
  },
  {
    name: "Xốt gia vị hoàn chỉnh thịt kho Chin-su 200g",
    sku: "CS-XOT-001",
    category: "Xốt gia vị",
    unit: "gói",
    price: 22000,
    supplierName: "Công ty CP Masan Consumer",
  },
];

for (const p of products) {
  await prisma.product.upsert({
    where: { sku: p.sku },
    update: {},
    create: {
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit,
      price: p.price,
      supplierId: getSupplierId(p.supplierName),
    },
  });
}

console.log("Seeded products:", products.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

