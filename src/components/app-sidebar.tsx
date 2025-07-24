"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { 
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Settings,
  LogOut,
  Rocket,
  GraduationCap,
  BarChart3,
  Grid3X3,
  Archive,
  ChevronDown,
  Sparkles,
  Crown,
  Shield,
  Bell,
  Search,
  Flame
} from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, exams } = useExam();
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

  // Get user stats
  const userStats = {
    completedExams: user ? exams.filter(exam => exam.isCompleted).length : 0,
    totalExams: exams.length,
    streak: 5, // This would come from user data
  };

  const mainNavItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
      description: "Welcome page",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Your progress overview",
      requireAuth: true,
      badge: userStats.completedExams > 0 ? userStats.completedExams.toString() : undefined,
    },
    {
      title: "Browse Exams",
      href: "/exams",
      icon: <BookOpen className="h-4 w-4" />,
      description: "Explore all available exams",
      badge: userStats.totalExams > 0 ? userStats.totalExams.toString() : undefined,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Grid3X3 className="h-4 w-4" />,
      description: "Browse by exam categories",
    },
    {
      title: "Previous Year Papers",
      href: "/previous-year-papers",
      icon: <Archive className="h-4 w-4" />,
      description: "Practice with past papers",
    },
    {
      title: "Rankings",
      href: "/rankings",
      icon: <Trophy className="h-4 w-4" />,
      description: "See leaderboards",
    },
    {
      title: "Results",
      href: "/results",
      icon: <GraduationCap className="h-4 w-4" />,
      description: "View your exam results",
      requireAuth: true,
    },
  ];



  return (
    /* <TooltipProvider> */
    <>
      <Sidebar className="border-r-0 bg-gradient-to-b from-white via-blue-50/30 to-pink-50/30 dark:from-slate-900 dark:via-purple-950/50 dark:to-slate-900 shadow-2xl">
        <SidebarHeader className="border-b border-white/20 dark:border-purple-800/30 bg-gradient-to-r from-white/80 via-blue-50/60 to-pink-50/60 dark:from-slate-800/80 dark:via-purple-900/60 dark:to-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-75"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl shadow-xl">
                  <Rocket className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  PrepForAll
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exam Platform</span>
              </div>
            </div>
            {user && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-sm opacity-60"></div>
                <Badge className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg text-xs px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-0 bg-gradient-to-b from-transparent via-white/40 to-white/60 dark:via-slate-900/40 dark:to-slate-900/60">
          {/* User Profile Section */}
          {user && (
            <div className="mx-4 my-4 p-4 rounded-2xl bg-gradient-to-br from-white/90 via-blue-50/80 to-pink-50/80 dark:from-slate-800/90 dark:via-purple-900/80 dark:to-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-purple-800/30 shadow-xl">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300">
                    <div className="flex items-center gap-3 w-full p-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-pink-500 rounded-full blur-sm opacity-60"></div>
                        <Avatar className="relative h-12 w-12 ring-2 ring-white/50 dark:ring-purple-500/30 ring-offset-2 ring-offset-transparent shadow-lg">
                          <AvatarImage src={user.photoURL || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-pink-500 text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                            {user.name || "User"}
                          </span>
                          {user.isAdmin && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-amber-400 rounded-full blur-sm opacity-60"></div>
                              <Crown className="relative h-4 w-4 text-amber-500 drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-white/30 dark:border-purple-800/30 shadow-2xl">
                  <DropdownMenuLabel className="text-slate-700 dark:text-slate-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-purple-800/30" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-purple-900/30">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-purple-900/30">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-purple-800/30" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Stats - Compact Streak Card */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="relative overflow-hidden p-3 h-[72px] bg-gradient-to-r from-orange-50/95 via-red-50/90 to-pink-50/95 dark:from-orange-900/60 dark:via-red-900/50 dark:to-pink-900/60 rounded-2xl backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/40 shadow-xl group cursor-pointer flex items-center gap-3"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px -12px rgba(251, 146, 60, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Animated Background Decorations */}
                  <motion.div
                    className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-300/30 to-red-300/30 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Fire Icon - Compact */}
                  <motion.div
                    className="relative flex-shrink-0"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                      delay: 0.4
                    }}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                  >
                    <motion.div
                      className="relative w-12 h-12 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.span
                        className="text-lg filter drop-shadow-sm"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🔥
                      </motion.span>
                    </motion.div>
                  </motion.div>

                  {/* Content - Horizontal Layout */}
                  <div className="relative flex-1 flex items-center justify-between">
                    {/* Left Side - Streak Info */}
                    <div className="flex flex-col">
                      <motion.div
                        className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 bg-clip-text text-transparent leading-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                          delay: 0.6
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.span
                          key={userStats.streak}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {userStats.streak}
                        </motion.span>
                      </motion.div>
                      <motion.div
                        className="text-xs text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wide leading-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                      >
                        Day Streak
                      </motion.div>
                    </div>

                    {/* Right Side - Motivational Text */}
                   
                  </div>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-red-400/0 to-pink-400/0 rounded-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"
                    initial={false}
                  />
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* Main Navigation */}
          <SidebarNav className="px-4">
            <div className="space-y-2">
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                  Navigation
                </h2>
              </div>
              {mainNavItems
                .filter(item => !item.requireAuth || user)
                .map((item) => (
                  // <Tooltip key={item.href} delayDuration={300}>
                  //   <TooltipTrigger asChild>
                  <SidebarNavItem
                    key={item.href}
                    asChild
                    isActive={isActive(item.href)}
                    onClick={handleNavClick}
                    className="group relative"
                  >
                    <Link href={item.href} className={`flex items-center justify-between gap-3 px-4 py-3 mx-2 rounded-2xl transition-all duration-300 ${isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-600/30 dark:via-purple-600/30 dark:to-pink-600/30 shadow-lg border border-blue-200/50 dark:border-purple-500/30 backdrop-blur-sm'
                        : 'hover:bg-gradient-to-r hover:from-white/60 hover:via-blue-50/40 hover:to-pink-50/40 dark:hover:from-slate-800/60 dark:hover:via-purple-900/40 dark:hover:to-slate-800/60 hover:shadow-md hover:backdrop-blur-sm'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive(item.href)
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-purple-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          }`}>
                          {isActive(item.href) && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-sm opacity-60"></div>
                          )}
                          <div className="relative">
                            {item.icon}
                          </div>
                        </div>
                        <span className={`font-semibold transition-colors duration-300 ${isActive(item.href)
                            ? 'bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent'
                            : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                          {item.title}
                        </span>
                      </div>
                      {item.badge && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 text-xs px-2 py-1 shadow-md">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarNavItem>
                  //   </TooltipTrigger>
                  //   <TooltipContent side="right" className="ml-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-white/30 dark:border-purple-800/30 shadow-2xl">
                  //     <p className="font-semibold text-slate-700 dark:text-slate-300">{item.title}</p>
                  //     <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  //   </TooltipContent>
                  // </Tooltip>
                ))}
            </div>

            <Separator className="my-6 mx-4 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-purple-700/30 to-transparent" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="px-3 py-2">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-sm"></div>
                  Quick Actions
                </h2>
              </div>
              <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 mx-2 h-auto rounded-2xl hover:bg-gradient-to-r hover:from-white/60 hover:via-blue-50/40 hover:to-pink-50/40 dark:hover:from-slate-800/60 dark:hover:via-purple-900/40 dark:hover:to-slate-800/60 hover:shadow-md transition-all duration-300" asChild>
                <Link href="/search">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-600 dark:text-blue-400 shadow-sm">
                    <Search className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Search Exams</span>
                </Link>
              </Button>
              {user && (
                <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 mx-2 h-auto rounded-2xl hover:bg-gradient-to-r hover:from-white/60 hover:via-blue-50/40 hover:to-pink-50/40 dark:hover:from-slate-800/60 dark:hover:via-purple-900/40 dark:hover:to-slate-800/60 hover:shadow-md transition-all duration-300" asChild>
                  <Link href="/notifications">
                    <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-600 dark:text-amber-400 shadow-sm">
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
                      <Bell className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Notifications</span>
                    <Badge className="ml-auto bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 text-xs px-2 py-1 shadow-md animate-pulse">
                      3
                    </Badge>
                  </Link>
                </Button>
              )}
            </div>

            {/* Admin Section */}
            {user?.isAdmin && (
              <>
                <Separator className="my-6 mx-4 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-purple-700/30 to-transparent" />
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></div>
                      Admin
                    </h2>
                  </div>
                  <SidebarNavItem
                    asChild
                    isActive={isActive("/admin")}
                    onClick={handleNavClick}
                    className="group"
                  >
                    <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-2xl transition-all duration-300 ${isActive("/admin")
                        ? 'bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 dark:from-red-600/30 dark:via-pink-600/30 dark:to-purple-600/30 shadow-lg border border-red-200/50 dark:border-pink-500/30 backdrop-blur-sm'
                        : 'hover:bg-gradient-to-r hover:from-white/60 hover:via-red-50/40 hover:to-pink-50/40 dark:hover:from-slate-800/60 dark:hover:via-red-900/40 dark:hover:to-slate-800/60 hover:shadow-md hover:backdrop-blur-sm'
                      }`}>
                      <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive("/admin")
                          ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 group-hover:from-red-100 group-hover:to-pink-100 dark:group-hover:from-red-900/50 dark:group-hover:to-pink-900/50 group-hover:text-red-600 dark:group-hover:text-red-400'
                        }`}>
                        {isActive("/admin") && (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl blur-sm opacity-60"></div>
                        )}
                        <div className="relative">
                          <Shield className="h-4 w-4" />
                        </div>
                      </div>
                      <span className={`font-semibold transition-colors duration-300 ${isActive("/admin")
                          ? 'bg-gradient-to-r from-red-700 to-pink-700 dark:from-red-300 dark:to-pink-300 bg-clip-text text-transparent'
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}>
                        Admin Panel
                      </span>
                    </Link>
                  </SidebarNavItem>
                </div>
              </>
            )}
          </SidebarNav>

          {/* Auth Actions */}
          <div className="mt-auto p-4 border-t border-white/20 dark:border-purple-800/30 bg-gradient-to-r from-white/60 via-blue-50/40 to-pink-50/40 dark:from-slate-800/60 dark:via-purple-900/40 dark:to-slate-800/60 backdrop-blur-xl">
            {!user && (
              <div className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 text-white shadow-xl rounded-2xl py-6 font-bold text-base transition-all duration-300 hover:scale-105" size="lg">
                  <Link href="/login" onClick={handleNavClick}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-2xl blur-sm opacity-60"></div>
                    <span className="relative">Sign In</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-2 border-slate-200 dark:border-purple-700/50 bg-white/80 dark:bg-slate-800/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl py-6 font-semibold transition-all duration-300 backdrop-blur-sm" size="lg">
                  <Link href="/register" onClick={handleNavClick}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 text-center p-4 bg-gradient-to-r from-white/40 to-white/60 dark:from-slate-800/40 dark:to-slate-800/60 rounded-2xl backdrop-blur-sm border border-white/30 dark:border-purple-800/30 shadow-lg">
              <p className="text-xs font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PrepForAll v2.0
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                © 2024 All rights reserved
              </p>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      {/* </TooltipProvider> */}
    </>
  );
}