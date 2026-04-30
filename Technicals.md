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
    inventory/page.tsx          Quan ly ton kho mock
    orders/page.tsx             Lap lich PO va lich su PO mock
    waste/page.tsx              Hang hong/huy mock
    staff/page.tsx              Nhan su mock + modal tao local
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
- `OrderStatus`: `PENDING`, `APPROVED`, `DELIVERING`, `DELIVERED`, `REJECTED`
- `WasteStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `ShiftStatus`: `ASSIGNED`, `CHECKED_IN`, `ABSENT`
- `InventoryLogType`: `IMPORT`, `EXPORT`, `WASTE`, `ADJUSTMENT`

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

- Client Component.
- `MOCK_PRODUCTS` local, filter/search/sort/select bang state.
- Chua ghi DB.
- Status local: `het-hang`, `sap-het`, `ok`, `sap-het-han`.

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

- Client Component.
- `MOCK_STAFF` local, tao nhan vien moi vao state.
- Chua tao `User` trong DB, chua hash password cho staff moi.

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
