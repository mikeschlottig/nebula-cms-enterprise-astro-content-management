import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
};
export function AppLayout({ children, container = true, className }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={`bg-background/50 relative ${className || ""}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <SidebarTrigger />
          <div className="flex-1" />
          <ThemeToggle className="static" />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium sm:inline-block">Admin Panel</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-500" />
          </div>
        </header>
        <main className={container ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10" : "flex-1"}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}