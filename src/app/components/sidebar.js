"use client";

import {
  LayoutDashboard,
  Upload,
  Receipt,
  BarChart3,
  LogOut,
  FolderOpen,
  FolderClosed,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserClient } from "@/providers/UserProvider";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/theme-toggle";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Receipt",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "All Receipts",
    url: "/receipts",
    icon: Receipt,
  },
  {
    title: "Folders",
    url: "/folders",
    icon: FolderClosed,
  },
];

export default function SidebarComponent() {
  const { signOut } = useAuth();
  const { user } = useUserClient();
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar sidebar-bg backdrop-blur-xl">
      <SidebarHeader className="border-b border-sidebar p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-600 rounded-xl flex items-center justify-center shadow-lg dark:shadow-gray-500/10 shadow-blue-500/30">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              PaperTrail
            </h2>
            <p className="text-xs text-muted font-medium">
              Smart Receipt Manager
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted uppercase tracking-wider px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1",
                      pathname === item.url
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                        : ""
                    )}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      {pathname === "/folders" && item.title === "Folders" ? (
                        <FolderOpen className="w-5 h-5" />
                      ) : (
                        <item.icon className="w-5 h-5" />
                      )}
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar p-4">
        <div className="space-y-3">
          <ThemeToggle />

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg dark:shadow-gray-500/10">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-muted truncate">{user?.email || ""}</p>
            </div>
          </div>
          <div></div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
