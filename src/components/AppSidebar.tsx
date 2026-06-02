import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Moon, Sun, History, Trophy, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { CALCULATORS } from "@/lib/calculators";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  const isActive = (p: string) => path === p;

  const grouped = CALCULATORS.reduce<Record<string, typeof CALCULATORS>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary shadow-glow flex items-center justify-center text-primary-foreground font-bold">
            C
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-display font-semibold">Calcverse</div>
              <div className="text-[10px] text-muted-foreground">AI Multi-Calculator</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {!collapsed && <span>{t("dashboard")}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/history")}>
                  <Link to="/history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {!collapsed && <span>History</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/leaderboard")}>
                  <Link to="/leaderboard" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {!collapsed && <span>Leaderboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {Object.entries(grouped).map(([cat, items]) => (
          <SidebarGroup key={cat}>
            {!collapsed && <SidebarGroupLabel>{t(cat)}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((c) => {
                  const url = `/calc/${c.slug}`;
                  const Icon = c.icon;
                  return (
                    <SidebarMenuItem key={c.slug}>
                      <SidebarMenuButton asChild isActive={isActive(url)}>
                        <Link to={url} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {!collapsed && <span className="truncate">{c.name}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
