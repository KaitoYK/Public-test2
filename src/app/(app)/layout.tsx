import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/component/ui/sidebar";
import { AppSidebar } from "@/component/AppSidebar";
import { HeaderActions } from "@/component/HeaderActions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      {/* ─── Full-width sticky header (z-30, above sidebar z-10) ─── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="h-5 w-px bg-border hidden sm:block" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            Prompt Management System
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {session.user.email}
          </span>
          <HeaderActions />
        </div>
      </header>

      {/* ─── Sidebar starts at top-14 (see sidebar.tsx fix) ─── */}
      <AppSidebar user={session.user} />

      {/* ─── Main content: offset by header height + sidebar spacer ─── */}
      <div className="flex flex-1 flex-col min-w-0 pt-14 min-h-screen">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
