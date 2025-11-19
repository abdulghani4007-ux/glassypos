import { useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Pill, 
  Package, 
  Users, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut,
  History,
  RotateCcw
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/storage";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Billing", url: "/billing", icon: ShoppingCart },
  { title: "Medicines", url: "/medicines", icon: Pill },
  { title: "Stock", url: "/stock", icon: Package },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Udhar/Credit", url: "/udhar", icon: CreditCard },
  { title: "Sale History", url: "/sale-history", icon: History },
  { title: "Refunds", url: "/refunds", icon: RotateCcw },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  // Apply compact sidebar setting on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings.compactSidebar) {
      setOpen(false);
    }
  }, [setOpen]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <div className="p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">MediStore</h2>
              <p className="text-xs text-muted-foreground">Pharmacy Manager</p>
            </div>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <Button variant="ghost" className="w-full justify-start" size={isCollapsed ? "icon" : "default"}>
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
