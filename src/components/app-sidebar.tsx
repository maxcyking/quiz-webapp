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
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">PrepForAll</span>
            <span className="text-xs text-muted-foreground">Quiz Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile Section */}
        {user && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-sm truncate">
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
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
        <div className="mt-auto p-4 border-t">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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