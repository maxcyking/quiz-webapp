"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children, className, ...props }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      <div className={cn("flex min-h-screen bg-canva-gradient", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setIsOpen, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "md:hidden rounded-canva hover:bg-canva-blue-100 transition-all duration-200",
        "text-canva-gray-600 hover:text-canva-blue-600",
        className
      )}
      onClick={() => setIsOpen(true)}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { isOpen, setIsOpen, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className={cn(
            "w-72 p-0 border-r rounded-canva-lg",
            "bg-glass border-canva-blue-200/40",
            "shadow-canva backdrop-blur-lg"
          )}
        >
          <div className="flex h-full flex-col">
            <div className={cn(
              "flex items-center justify-between p-4 border-b border-canva-blue-200/30",
              "bg-gradient-to-r from-white/80 to-canva-blue-25/50"
            )}>
              <h2 className="text-lg font-semibold text-canva-gray-800">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "hover:bg-canva-pink-100 rounded-canva transition-all duration-200",
                  "text-canva-gray-600 hover:text-canva-pink-600"
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 bg-gradient-to-b from-white/90 to-canva-purple-25/30">
              {children}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
        "bg-glass border-r border-canva-blue-200/40",
        "transition-all duration-300 ease-in-out",
        "shadow-canva backdrop-blur-lg",
        className
      )}
      {...props}
    >
      <div className="flex h-full flex-col bg-gradient-to-b from-white/90 to-canva-purple-25/30">
        {children}
      </div>
    </div>
  );
}

export function SidebarContent({ children, className, ...props }: SidebarProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto scrollbar-canva", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className, ...props }: SidebarProps) {
  return (
    <div className={cn(
      "p-4 border-b border-canva-blue-200/30 rounded-t-canva",
      "bg-gradient-to-r from-white/80 to-canva-blue-25/50",
      className
    )} {...props}>
      {children}
    </div>
  );
}

export function SidebarNav({ children, className, ...props }: SidebarProps) {
  return (
    <nav className={cn("p-4 space-y-1", className)} {...props}>
      {children}
    </nav>
  );
}

interface SidebarNavItemProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode;
  isActive?: boolean;
}

export function SidebarNavItem({
  children,
  icon,
  isActive,
  className,
  asChild,
  ...props
}: SidebarNavItemProps) {
  if (asChild) {
    return (
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-11 px-3 rounded-canva transition-all duration-200",
          "hover:bg-canva-blue-100/80 hover:text-canva-blue-700",
          "focus-visible:ring-2 focus-visible:ring-canva-blue-500 focus-visible:ring-offset-2",
          "hover-lift-canva group",
          isActive && [
            "bg-gradient-to-r from-canva-blue-100/90 to-canva-purple-50/80",
            "text-canva-blue-700 font-medium border-l-3 border-l-canva-blue-500",
            "shadow-canva hover:shadow-canva-hover",
            "hover:from-canva-blue-200/80 hover:to-canva-purple-100/70"
          ],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-11 px-3 rounded-canva transition-all duration-200",
        "hover:bg-canva-blue-100/80 hover:text-canva-blue-700",
        "focus-visible:ring-2 focus-visible:ring-canva-blue-500 focus-visible:ring-offset-2",
        "hover-lift-canva group canva-button-shimmer",
        isActive && [
          "bg-gradient-to-r from-canva-blue-100/90 to-canva-purple-50/80",
          "text-canva-blue-700 font-medium border-l-3 border-l-canva-blue-500",
          "shadow-canva hover:shadow-canva-hover",
          "hover:from-canva-blue-200/80 hover:to-canva-purple-100/70"
        ],
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn(
          "transition-transform duration-200",
          isActive ? "text-canva-blue-600" : "text-canva-gray-500",
          "group-hover:text-canva-blue-600 group-hover:scale-110"
        )}>
          {icon}
        </span>
      )}
      <span className="transition-colors duration-200">
        {children}
      </span>
    </Button>
  );
} 