"use client";

import { usePathname, useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarNav, 
  SidebarNavItem,
  useSidebar 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  BookOpen, 
  FileText, 
  Trophy, 
  User, 
  Settings, 
  LogOut,
  Rocket,
  GraduationCap,
  Clock,
  BarChart3,
  Grid3X3,
  Archive
} from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useExam();
  const { setIsOpen } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavClick = () => {
    setIsOpen(false); // Close sidebar on mobile after navigation
  };

  const isActive = (path: string) => pathname === path;

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      requireAuth: true,
    },
    {
      title: "Browse Exams",
      href: "/exams",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Grid3X3 className="h-4 w-4" />,
    },
    {
      title: "Previous Year Papers",
      href: "/pyp",
      icon: <Archive className="h-4 w-4" />,
    },
    {
      title: "Rankings",
      href: "/rankings",
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: "Results",
      href: "/results",
      icon: <GraduationCap className="h-4 w-4" />,
      requireAuth: true,
    },
  ];

  const userNavItems = [
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl shadow-lg">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              PrepForAll
            </span>
            <span className="text-xs text-muted-foreground font-medium">Quiz Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile Section */}
        {user && (
          <div className="px-4 py-4 border-b bg-gradient-to-r from-accent/30 to-background dark:from-accent/10 dark:to-background/80">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 dark:ring-primary/30 ring-offset-2 ring-offset-background">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30 text-primary font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-sm truncate text-foreground">
                  {user.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarNav>
          <div className="space-y-1">
            <div className="px-3 py-2">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                Main
              </h2>
            </div>
            {mainNavItems
              .filter(item => !item.requireAuth || user)
              .map((item) => (
                <SidebarNavItem
                  key={item.href}
                  asChild
                  isActive={isActive(item.href)}
                  onClick={handleNavClick}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    {item.icon}
                    {item.title}
                  </Link>
                </SidebarNavItem>
              ))}
          </div>

          {/* User Section */}
          {user && (
            <div className="space-y-1 mt-6">
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  Account
                </h2>
              </div>
              {userNavItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  asChild
                  isActive={isActive(item.href)}
                  onClick={handleNavClick}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    {item.icon}
                    {item.title}
                  </Link>
                </SidebarNavItem>
              ))}
            </div>
          )}

          {/* Admin Section */}
          {user?.isAdmin && (
            <div className="space-y-1 mt-6">
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                  Admin
                </h2>
              </div>
              <SidebarNavItem
                asChild
                isActive={isActive("/admin")}
                onClick={handleNavClick}
              >
                <Link href="/admin" className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              </SidebarNavItem>
            </div>
          )}
        </SidebarNav>

        {/* Auth Actions */}
        <div className="mt-auto p-4 border-t border-border/10 dark:border-border/20">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full" size="sm">
                <Link href="/login" onClick={handleNavClick}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/register" onClick={handleNavClick}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}