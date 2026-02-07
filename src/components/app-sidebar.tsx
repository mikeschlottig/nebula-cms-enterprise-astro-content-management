import React from "react";
import { 
  LayoutDashboard, 
  Database, 
  Sparkles, 
  Settings, 
  Terminal, 
  ChevronRight, 
  Image as ImageIcon,
  Rocket,
  Cpu,
  Layers,
  Search,
  BrainCircuit,
  Calendar,
  ShieldCheck
} from "lucide-react";
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
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
const groups = [
  {
    label: "CMS",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/" },
      { title: "Content Studio", icon: Database, url: "/content" },
      { title: "Media Library", icon: ImageIcon, url: "/media" },
      { title: "Calendar", icon: Calendar, url: "/calendar" },
    ]
  },
  {
    label: "Cloudflare Edge",
    items: [
      { title: "Deployed Apps", icon: Rocket, url: "/apps" },
      { title: "Workers", icon: Cpu, url: "/workers" },
      { title: "D1 Explorer", icon: Layers, url: "/d1" },
      { title: "R2 Browser", icon: Database, url: "/r2" },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { title: "Nebula AI", icon: Sparkles, url: "/ai" },
      { title: "Vector RAG", icon: BrainCircuit, url: "/rag" },
      { title: "Search Engine", icon: Search, url: "/search" },
    ]
  }
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
      <SidebarContent className="px-3">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="mt-4">
            <SidebarGroupLabel className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 mb-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={cn(
                      "h-10 px-4 transition-all hover:bg-white/5 rounded-lg",
                      location.pathname === item.url ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold" : "text-slate-400"
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                      {location.pathname === item.url && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 px-4 text-slate-400 hover:text-white transition-colors">
                <Link to="/settings" className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-transparent p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold text-white">Edge Security</span>
          </div>
          <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[100%] bg-green-500" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}