"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/component/ui/sidebar";
import { AppSidebar } from "@/component/AppSidebar";
import { HeaderActions } from "@/component/HeaderActions";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Routes that should NOT have the sidebar/header shell */
const PUBLIC_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublic) {
    return <>{children}</>;
  }

  return <ProtectedShell>{children}</ProtectedShell>;
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // While loading session, render nothing (avoids flash)
  if (status === "loading" || !session?.user) {
    return null;
  }

  return (
    <SidebarProvider>
      {/* ─── Full-width sticky header ─── */}
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

      {/* ─── Sidebar ─── */}
      <AppSidebar user={session.user} />

      {/* ─── Main content offset by header ─── */}
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
