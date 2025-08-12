import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <header className="h-14 flex items-center border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex items-center gap-3">
          <SidebarTrigger className="mr-1" />
          <div className="text-sm md:text-base font-semibold bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">AI GPU Dashboard</div>
        </div>
      </header>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
