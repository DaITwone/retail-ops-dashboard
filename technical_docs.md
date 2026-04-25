app/
├─ (dashboard)/
│  ├─ layout.tsx              ← Sidenav shell
│  ├─ dashboard/
│  │  ├─ (overview)/
│  │  │  ├─ page.tsx
│  │  │  └─ loading.tsx       ← skeleton riêng
│  ├─ inventory/
│  │  └─ page.tsx
│  ├─ damage/
│  ├─ orders/
│  ├─ hr/
│  ├─ shifts/
│  └─ reports/
│
├─ ui/                        ← thay components/
│  ├─ shared/
│  │  ├─ Sidenav.tsx
│  │  ├─ Button.tsx
│  │  └─ skeletons.tsx
│  ├─ dashboard/
│  │  └─ StatsCard.tsx
│  ├─ inventory/
│  │  └─ InventoryTable.tsx
│  └─ ...
│
└─ lib/
   ├─ data.ts                 ← queries
   ├─ actions.ts              ← mutations
   ├─ definitions.ts          ← types
   └─ utils.ts

| Sidebar | Header          |
|         |-----------------|
|         | Page content    |


auth.config.ts     → Cấu hình edge-safe (pages, callbacks.authorized)
auth.ts            → Cấu hình đầy đủ (providers, authorize, zod validation)
proxy.ts      → Bảo vệ routes, chạy trên Edge Runtime

User submit form
  ↓
login-form.tsx       "use client" — useActionState(authenticate)
  ↓
actions.ts           "use server" — signIn() từ @/auth
  ↓
auth.ts              authorize() — zod validate → kiểm tra user
  ↓
  ├─ Sai  → return error string → hiện lỗi trên form
  └─ Đúng → redirectTo: "/dashboard"