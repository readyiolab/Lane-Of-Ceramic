import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Ticket,
  Layers,
  Percent,
  Megaphone,
  Users,
  Star,
  FileText,
  LogOut,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "@/api/endpoints"
import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"

const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Categories", href: "/categories", icon: FolderTree },
  { title: "Brands", href: "/brands", icon: Tag },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Coupons", href: "/coupons", icon: Ticket },
  { title: "Bundles", href: "/bundles", icon: Layers },
  { title: "Discount Tiers", href: "/discount-tiers", icon: Percent },
  { title: "Announcements", href: "/announcements", icon: Megaphone },
  { title: "Users", href: "/users", icon: Users },
  { title: "Reviews", href: "/reviews", icon: Star },
  { title: "Site Content", href: "/site-content", icon: FileText },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // refresh every 30 seconds
  });

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
            <Link to="/" className="flex flex-col gap-0.5">
              <span className="font-heading text-lg font-semibold text-sidebar-primary">
                Ceramic Studio
              </span>
              <span className="text-xs tracking-widest text-sidebar-foreground/70 uppercase">
                Admin Panel
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link to={item.href} className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <item.icon />
                              <span>{item.title}</span>
                            </div>
                            {item.href === "/orders" && dashboard?.pendingOrdersCount > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {dashboard.pendingOrdersCount}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-3">
            <div className="mb-2 truncate px-2 text-xs text-sidebar-foreground/80">
              {user?.fullName}
              <br />
              <span className="text-sidebar-foreground/60">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium text-muted-foreground">
              {NAV_ITEMS.find((item) =>
                item.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.href),
              )?.title ?? "Admin"}
            </span>
          </header>
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
