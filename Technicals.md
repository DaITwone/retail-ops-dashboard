# Retail Ops Dashboard - Technicals

Tai lieu nay la ban do ky thuat cho nguoi va AI tiep tuc phat trien du an. Khi can sua Next.js, luon doc lai docs noi bo tai `node_modules/next/dist/docs/` vi project dang dung Next.js 16, trong do mot so convention khac cac ban Next cu.

## 1. Tong Quan Du An

- Ten package: `retail-ops-dashboard`
- Muc tieu san pham: dashboard van hanh cua hang WinMart+, bao gom tong quan, ton kho, dat hang, hang hong/huy, nhan su, phan ca va bao cao.
- Stack chinh: Next.js `16.2.4`, React `19.2.4`, TypeScript strict, Tailwind CSS v4, shadcn UI, lucide-react, Recharts, NextAuth v5 beta, Prisma v7, PostgreSQL.
- Routing: App Router trong thu muc `app/`.
- Database client: Prisma generate ra `generated/prisma`, khong phai import mac dinh tu `@prisma/client`.
- Trang hien tai phan lon la UI mock-data client-side; auth da noi voi DB qua Prisma.

## 2. Lenh Thuong Dung

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Prisma:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Du an co ca `package-lock.json` va `pnpm-lock.yaml`. Nen thong nhat mot package manager truoc khi cai them package de tranh lockfile lech nhau.

## 3. Bien Moi Truong

File `.env` dang ton tai local va khong nen dua noi dung vao tai lieu/commit. Cac bien quan trong:

- `DATABASE_URL`: connection string PostgreSQL, duoc Prisma CLI va `lib/prisma.ts` su dung.
- NextAuth thuong can `AUTH_SECRET`/bien tuong duong khi deploy production.

Khi deploy, dam bao bien moi truong duoc cau hinh tren hosting, khong doc truc tiep tu `.env` trong runtime production neu platform khong ho tro.

## 4. Next.js 16 Notes

Nhung diem da doi chieu voi `node_modules/next/dist/docs/`:

- `app/layout.tsx` la root layout bat buoc va phai chua `<html>` + `<body>`.
- Folder route group nhu `app/(dashboard)` khong xuat hien trong URL. Vi vay `app/(dashboard)/staff/page.tsx` map thanh `/staff`.
- `page.tsx` moi lam route public; cac file khac colocate trong segment khong tu tao route.
- Page/layout mac dinh la Server Component. File nao dung state, effect, event handler, browser API hoac Recharts can `"use client"`.
- `"use client"` tao boundary: moi import con cua file do di vao client bundle. Neu sau nay noi DB, hay tach query vao Server Component/helper server de tranh keo Prisma vao client.
- Server Actions dung `"use server"` va phai la async exports trong file server. Login hien dung pattern nay.
- Next.js 16 goi Middleware la `proxy.ts`. Project dung `proxy.ts` o root, dung matcher de chay auth guard truoc request. Proxy nen chi lam optimistic/session check, khong lam DB query nang.

## 5. Cau Truc Thu Muc

```text
app/
  layout.tsx                    Root layout, font, ThemeProvider
  page.tsx                      Redirect "/" -> "/dashboard"
  globals.css                   Tailwind v4, shadcn, CSS variables theme
  theme-provider.tsx            Client provider sync dark mode tu localStorage
  login/
    page.tsx                    Login screen
    action.ts                   Server Action authenticate()
    _components/login-form.tsx  Client form dung useActionState
  ui/
    sidebar.tsx                 Sidebar client, menu dashboard
    header.tsx                  Header client
    theme-toggle.tsx            Toggle dark/light
  (dashboard)/
    layout.tsx                  Shell sidebar + header
    dashboard/page.tsx          Tong quan, charts, KPI
    inventory/page.tsx          Server Component fetch ton kho
    inventory/action.ts         Server Functions query inventory
    inventory/InventoryClient.tsx Client UI filter/sort/select ton kho
    orders/page.tsx             Lap lich PO va lich su PO mock
    waste/page.tsx              Hang hong/huy mock
    staff/page.tsx              Server Component fetch nhan su
    staff/action.ts             Server Functions query/mutate staff
    staff/StaffClient.tsx       Client UI staff + drawer tao user
    shifts/page.tsx             Lich lam viec mock
    reports/page.tsx            Bao cao mock + charts

components/ui/
  card.tsx, table.tsx, badge.tsx  shadcn-style primitives
  kpi-card.tsx                    KPI card rieng cua dashboard

lib/
  prisma.ts                     Prisma client voi @prisma/adapter-pg
  utils.ts                      cn() = clsx + tailwind-merge

prisma/
  schema.prisma                 Schema chinh
  seed.ts                       Seed manager user
  migrations/                   SQL migrations

generated/prisma/               Prisma generated client, khong sua tay
```

## 6. Route Map

- `/`: redirect sang `/dashboard`.
- `/login`: man hinh dang nhap.
- `/dashboard`: dashboard tong quan.
- `/inventory`: ton kho.
- `/orders`: dat hang/PO.
- `/waste`: xu ly hang hong/huy.
- `/staff`: quan ly nhan su.
- `/shifts`: lich/phien ca.
- `/reports`: bao cao.

`app/(dashboard)/layout.tsx` boc cac route dashboard bang sidebar va header. Vi `(dashboard)` la route group, URL khong co prefix `/dashboard` cho tat ca route, chi co segment con nhu `/staff`, `/orders`.

## 7. Authentication & Authorization

File lien quan:

- `auth.config.ts`: config edge/proxy-safe, gom `pages.signIn` va callback `authorized`.
- `auth.ts`: config day du, them Credentials provider, zod validate, Prisma lookup user, bcrypt compare password.
- `proxy.ts`: export `NextAuth(authConfig).auth` va matcher.
- `app/login/action.ts`: Server Action goi `signIn("credentials")`.
- `app/login/_components/login-form.tsx`: Client form goi `useActionState(authenticate, undefined)`.

Flow dang nhap:

1. User submit form o `/login`.
2. `login-form.tsx` goi Server Action `authenticate`.
3. `authenticate` goi `signIn("credentials", { email, password, redirectTo: "/dashboard" })`.
4. `auth.ts` validate credentials bang zod.
5. Prisma tim `User` theo email.
6. bcrypt so sanh password.
7. Neu dung, NextAuth tao session va redirect `/dashboard`; neu sai, tra message loi.

Protected routes hien nam trong `auth.config.ts`:

```ts
[
  "/dashboard",
  "/inventory",
  "/orders",
  "/staff",
  "/cancellations",
  "/waste",
  "/staff",
  "/shift",
  "/reports",
  "/orders",
]
```

Can luu y:

- Co duplicate `"/staff"` va `"/orders"`.
- Route thuc te la `/shifts`, nhung config dang co `"/shift"`. `startsWith("/shift")` van match `/shifts`, nhung nen doi thanh `"/shifts"` cho ro.
- Neu user da login ma vao route khong protected, callback redirect ve `/dashboard`. Dieu nay co the khien `/login` redirect khi da dang nhap.
- Session user tra ve co `role`, nhung type NextAuth mac dinh chua duoc augment trong repo. Khi can dung `session.user.role`, nen them type augmentation.

## 8. Prisma & Database

`prisma/schema.prisma`:

- Generator:
  - `provider = "prisma-client"`
  - `output = "../generated/prisma"`
- Datasource: PostgreSQL.
- `lib/prisma.ts` import `PrismaClient` tu `@/generated/prisma/client`, tao adapter bang `PrismaPg`.

Model chinh:

- `User`: nhan su/tai khoan, co `role`, `password`, lien ket orders, wastes, shifts, inventory logs.
- `Product`: san pham, sku unique, category, unit, price, supplier optional, inventory, order/waste/sale items.
- `Inventory`: ton kho 1-1 voi product, quantity, minStock, expiry.
- `InventoryLog`: lich su import/export/waste/adjustment, bat buoc co user tao.
- `Supplier`: nha cung cap, products va orders.
- `Order` + `OrderItem`: PO/dat hang, supplier, creator, approver, status, total, dates, items.
- `Waste` + `WasteItem`: phieu huy, creator, approver, reason, total, items.
- `Shift` + `ShiftAssignment`: dinh nghia ca va gan nhan vien theo ngay.
- `SaleRecord` + `SaleItem`: doanh thu/ban hang tong hop.

Enums:

- `Role`: `MANAGER`, `STAFF`
- `Position`: `SALES_STAFF`, `INTERN`, `ASSISTANT_MANAGER`, `STORE_MANAGER`
- `OrderStatus`: `PENDING`, `APPROVED`, `DELIVERING`, `DELIVERED`, `REJECTED`
- `WasteStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `WasteReason`: `EXPIRED`, `DAMAGED`, `QUALITY_LOSS`, `CUSTOMER_RETURN`, `IMPORT_ERROR`, `OTHER`
- `ShiftStatus`: `ASSIGNED`, `CHECKED_IN`, `ABSENT`
- `InventoryLogType`: `IMPORT`, `EXPORT`, `WASTE`, `ADJUSTMENT`
- `InventoryStatus`: `OK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRING_SOON`

Seed:

- `prisma/seed.ts` tao/upsert user `manager@winmart.com`.
- Password seed hien la `123456`, duoc hash bang bcrypt.

Quy uoc an toan:

- Khong import `@/lib/prisma` vao file `"use client"`.
- Mutations anh huong ton kho nen dung transaction: tao Order/Waste/InventoryLog va cap nhat Inventory cung luc.
- Decimal Prisma nen convert can than khi dua ra Client Component. Tranh pass object Decimal truc tiep neu khong serializable; nen format hoac convert number/string o server.

## 9. UI & Styling

- Theme nam trong `app/globals.css` bang CSS variables: `--bg-base`, `--text-primary`, `--border-button`, `--color-active`, ...
- Dark mode: them class `.dark` vao `<html>`, luu preference trong `localStorage`.
- Font: `Be_Vietnam_Pro` tu `next/font/google`, subsets `latin`, `vietnamese`.
- Icon: `lucide-react`.
- Chart: `recharts`; vi Recharts dung browser APIs nen cac trang chart la Client Component.
- Component primitive:
  - `Card`, `Table`, `Badge` theo style shadcn.
  - `KpiCard` la component rieng, nhan `title`, `value`, `change`, `deltaType`, `icon`, `sub`.

Can luu y encoding:

- Nhieu file hien thi tieng Viet bi mojibake, vi du chu co dau bi hien thi thanh cac chuoi kieu `T...`/`A...` sai nghia. Day la van de encoding/text source, khong phai logic runtime. Khi sua text, hay luu file UTF-8 va sua tron ven chuoi lien quan.

## 10. Trang Hien Tai Va Trang Thai Du Lieu

`/dashboard`

- Client Component.
- Dung mock arrays: `revenueData`, `topProducts`, `cancelReasons`, `inventoryByCategory`, `recentOrders`, `staffOnShift`, `lowStockItems`.
- Hien KPI, area/bar/pie charts, bang PO gan day, staff on shift, low stock.

`/inventory`

- Da tach theo pattern Server + Client:
  - `page.tsx` la Server Component, goi `getInventoryProducts()` roi render `<InventoryClient initialProducts={products} />`.
  - `action.ts` co `"use server"`, import Prisma va export type `InventoryProduct`, `StockStatus`, function query.
  - `InventoryClient.tsx` co `"use client"`, chi giu state UI: search, category/supplier filter, tab, sort, selected rows.
- Hien chi doc DB, chua co mutation nhap/xuat hang. Hai button "Nhap hang" va "Xuat hang" moi la UI.
- UI status key: `het-hang`, `sap-het`, `ok`, `sap-het-han`. Day la key client, khac enum DB `InventoryStatus`.
- Luu y code hien tai dang doc `(p as any).stock`, `(p as any).expiresAt`, `(p as any).imageUrl`. Theo schema moi, ton kho nam o `Product.inventory.quantity/minStock/expiry/status`, con `imageUrl` nam tren `Product`. Khi sua tiep, nen query `include: { supplier: true, inventory: true }` va map tu `p.inventory`, khong doc `stock/expiresAt` truc tiep tren Product.

`/orders`

- Client Component.
- Quan ly suppliers/products mock, len lich so luong theo 7 ngay, tao PO local vao state.
- Co modal chi tiet PO va success modal.
- Chua tao `Order`/`OrderItem` trong DB.

`/waste`

- Client Component.
- `MOCK_WASTE` local, tao phieu huy local voi status `cho-duyet`.
- Chua tao `Waste`/`WasteItem`, chua tru Inventory.
- KPI "today" hien co logic date phuc tap, nen kiem tra lai khi noi data that.

`/staff`

- Da tach theo pattern Server + Client:
  - `page.tsx` la Server Component, goi `getStaffList()` roi render `<StaffClient initialData={staffList} />`.
  - `action.ts` co `"use server"`, query `User`, include `ShiftAssignment` hom nay va groupBy so ca `CHECKED_IN` trong thang.
  - `StaffClient.tsx` co `"use client"`, giu state UI: search, role/shift filter, tabs, selected rows, drawer tao nhan vien.
- `createStaff(input)` da tao `User` that trong DB, hash password bang `bcrypt.hash(password ?? "123456", 10)`, check email unique, `revalidatePath("/staff")`.
- Sau khi tao thanh cong, client them mot row tam bang `crypto.randomUUID()` de optimistic UI; server revalidate se sync lai khi route refresh. Neu can id that ngay lap tuc, action nen tra row vua tao.
- `deactivateStaff(userId)` da update `User.isActive = false` va revalidate `/staff`, nhung UI hien chua noi nut goi action nay.
- `StaffRow.createdAt` hien la `Date`. Neu gap loi serialization/hydration, convert sang string ISO trong action truoc khi truyen sang Client Component.

`/shifts`

- Client Component.
- Quan ly `assignments` local theo dateKey + shiftKey.
- View ngay/tuan/thang, modal gan ten nhan vien.
- Chua doc `Shift`/`ShiftAssignment` tu DB.

`/reports`

- Client Component.
- Mock data cho revenue, inventory, staff, waste, supplier.
- Charts bang Recharts, tab local state.

## 11. Huong Dan Noi DB Cho Feature Moi

Khi bien mot page mock thanh data that:

1. Giu page shell/layout hien co, tach data-fetching ra Server Component hoac helper server.
2. Tao file server/action rieng neu can mutation, vi Client Component khong duoc dinh nghia Server Function inline.
3. Validate input bang zod truoc khi goi Prisma.
4. Kiem tra session/role gan noi data source, khong chi dua vao `proxy.ts`.
5. Dung transaction cho nghiep vu co nhieu bang.
6. Sau mutation, refresh/revalidate route lien quan.
7. Convert Date/Decimal thanh string/number truoc khi dua vao Client Component.

Pattern dang dung o `/staff` va `/inventory`:

```text
app/(dashboard)/feature/
  page.tsx        Server Component: await getFeatureRows(), render Client
  action.ts      "use server": Prisma query/mutation, export type DTO cho client
  FeatureClient.tsx
                 "use client": UI state, filter/sort/modal, goi action bang startTransition/useActionState
```

`page.tsx` nen rat mong:

```tsx
import { getRows } from "./action";
import { FeatureClient } from "./FeatureClient";

export default async function FeaturePage() {
  const rows = await getRows();
  return <FeatureClient initialRows={rows} />;
}
```

`action.ts` la boundary server:

- Dat `"use server"` tren dau file neu Client Component can import function tu file nay.
- Duoc import `@/lib/prisma`, `next/cache`, `bcryptjs`, `auth`, enums tu `@/generated/prisma/enums`.
- Export DTO/type client can dung, nhung DTO phai serializable: string/number/boolean/null/plain object/array. Convert `Decimal`, `Date`, enum label neu can.
- Query nen map data ve shape UI can, khong pass Prisma model nguyen ban neu co field nhay cam nhu `password`.
- Mutation nen return object on dinh dang `{ success: boolean, error?: string, data?: ... }` de Client Component hien loi/loading de hon.
- Sau mutation goi `revalidatePath("/route")`. Neu client can UI cap nhat ngay, co the optimistic append/update state nhu `StaffClient`, nhung dung coi optimistic row la source of truth.

`FeatureClient.tsx`:

- Bat buoc co `"use client"` neu dung state/event handler/modal/table interactive.
- Chi import type/Server Function tu `./action`; khong import `@/lib/prisma`.
- Goi mutation trong event handler qua `useTransition` hoac form qua `useActionState`.
- Giu filter/search/sort/select o client neu dataset vua phai; neu dataset lon, day pagination/filter len server.
- Internal status key nen la ASCII/enum-safe (`sap-het`, `dang-lam`, `PENDING`), label tieng Viet map rieng trong UI.

Quy trinh noi mot page moi:

1. Xac dinh model/schema va DTO UI can.
2. Tao `action.ts` voi query `getXList()` map Prisma -> DTO serializable.
3. Sua `page.tsx` thanh Server Component goi query va truyen `initialData`.
4. Tach UI dang co sang `XClient.tsx`, them `"use client"` va nhan props initial.
5. Neu co tao/sua/xoa, them Server Function mutation, validate input, auth/role, transaction neu can, `revalidatePath`.
6. Trong client, hien pending/error bang `useTransition`/`useActionState`, optimistic update chi khi khong lam sai nghiep vu.
7. Chay lint/build va test route protected.

Vi du nghiep vu:

- Tao phieu huy:
  - Validate productId, quantity, reason.
  - Tao `Waste` status `PENDING`.
  - Tao `WasteItem`.
  - Neu manager approve: transaction update `Waste`, tru `Inventory.quantity`, tao `InventoryLog` type `WASTE`.
- Nhan PO:
  - Update `Order.status` thanh `DELIVERED`, set `receivedAt`.
  - Cong `Inventory.quantity` theo `OrderItem`.
  - Tao `InventoryLog` type `IMPORT`.
- Tao nhan vien:
  - Validate email unique.
  - Hash password bang bcrypt.
  - Tao `User`.
  - Khong tra password/hash ve client.

## 12. Cac Diem De Gay Bug

- `lib/prisma.ts` tao PrismaClient moi moi lan import. Trong dev hot reload co the mo nhieu connection. Neu gap loi connection, can them singleton cache tren `globalThis`.
- `auth.config.ts` route list dang lap va co `/shift` thay vi `/shifts`.
- Role co trong object user authorize, nhung chua co NextAuth type augmentation.
- Nhieu trang `"use client"` lon gom ca data mock va UI; neu import server code vao se fail build/runtime.
- Date dang hard-code nhieu noi: header ngay `23/4/2026`, order week `28/4` den `4/5`, shifts start `20/04/2026`.
- Text tieng Viet bi mojibake co the lam filter/status map sai neu sua nua chuoi. Khi mapping status/reason, nen dung enum/internal key ASCII va label rieng.
- `generated/prisma` la generated code, khong sua tay.
- Dang co ca npm lock va pnpm lock; cai dependency bang hai tool khac nhau de gay drift.
- UI mock dang dung status key tieng Viet label bi mojibake; khi noi DB nen map tu enum DB sang label UI ro rang.

## 13. Quy Uoc Phat Trien De It Bug

- Doc file lien quan truoc khi sua, dac biet voi Next.js 16 doc trong `node_modules/next/dist/docs/`.
- Neu file co `"use client"`, chi dat logic UI/state/event handler trong do. Query DB va secret nam o server.
- Moi mutation co input validation zod va authorization gan DB.
- Dung enums/schema Prisma lam source of truth cho status, role, log type.
- Dung `@/*` alias theo `tsconfig.json`.
- Dung `cn()` khi ghep class co dieu kien o shared components.
- Them feature theo chieu doc: schema -> migration -> query/action -> UI -> validation/test.
- Khi sua text tieng Viet, sua ca label, placeholder, map key neu can va luu UTF-8.
- Khong dua secrets, `.env`, password raw vao docs/commit.

## 14. Checklist Truoc Khi Merge/Deploy

- `npm run lint`
- `npm run build`
- `npx prisma generate` sau moi thay doi schema.
- Tao migration cho schema change, khong sua generated client.
- Seed/test login voi `manager@winmart.com`.
- Kiem tra protected routes: chua login vao `/dashboard`, `/inventory`, `/orders`, `/staff`, `/shifts`, `/waste`, `/reports` phai redirect login.
- Kiem tra dark/light mode khong hydration warning bat thuong.
- Kiem tra cac page client khong import `@/lib/prisma`.

## 15. Tai Lieu Nen Doc Khi Sua

Local Next.js docs:

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`

Project docs hien co:

- `README.md`: template create-next-app, chua phan anh business logic.
- `technical_docs.md`: ghi chu cu ve structure/auth flow, co mojibake va mot so path khong con khop 100%.
- `AGENTS.md`: bat buoc AI doc docs Next local truoc khi code.
