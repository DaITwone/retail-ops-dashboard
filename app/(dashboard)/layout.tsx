import Sidebar from "@/app/ui/sidebar";
import Header from "../ui/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen border-(--border-base)">
      {/* Sidebar */}
      <aside className="h-full">
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header>
          <Header />
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
