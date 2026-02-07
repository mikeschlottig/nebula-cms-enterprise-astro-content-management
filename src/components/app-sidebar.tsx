import React from "react";
import { LayoutDashboard, Database, Sparkles, Settings, Terminal, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
const items = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Content Studio", icon: Database, url: "/content" },
  { title: "Media Library", icon: ImageIcon, url: "/media" },
  { title: "Nebula AI", icon: Sparkles, url: "/ai" },
  { title: "Settings", icon: Settings, url: "/settings" },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar className="border-r border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl">
      <SidebarHeader className="h-16 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Nebula<span className="text-primary">.</span></span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className={cn(
                    "h-11 px-4 transition-all hover:bg-white/5",
                    location.pathname === item.url ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold" : "text-slate-400"
                  )}
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                    {location.pathname === item.url && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cloudflare Tier</p>
          <div className="flex items-center justify-between text-sm text-white">
            <span>Enterprise</span>
            <span className="text-primary font-bold">92%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[92%] bg-primary shadow-[0_0_8px_rgba(243,128,32,0.5)]" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}