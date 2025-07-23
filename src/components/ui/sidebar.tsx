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
      <div className={cn("flex min-h-screen", className)} {...props}>
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
      className={cn("md:hidden", className)}
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
            "w-72 p-0 border-r",
            "bg-background/95 backdrop-blur-md",
            "dark:bg-background/90 dark:border-border/30",
            "shadow-lg"
          )}
        >
          <div className="flex h-full flex-col">
            <div className={cn(
              "flex items-center justify-between p-4 border-b",
              "bg-gradient-to-r from-background to-muted/30",
              "dark:from-background/80 dark:to-muted/10"
            )}>
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-accent/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
        "bg-background/95 backdrop-blur-md border-r",
        "dark:bg-background/90 dark:border-border/30",
        "transition-all duration-300 ease-in-out",
        "shadow-sm dark:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({ children, className, ...props }: SidebarProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarHeader({ children, className, ...props }: SidebarProps) {
  return (
    <div className={cn(
      "p-4 border-b",
      "bg-gradient-to-r from-background to-muted/30",
      "dark:from-background/80 dark:to-muted/10",
      className
    )} {...props}>
      {children}
    </div>
  );
}

export function SidebarNav({ children, className, ...props }: SidebarProps) {
  return (
    <nav className={cn("p-4 space-y-2", className)} {...props}>
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
          "w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive && [
            "bg-gradient-to-r from-primary/10 to-background",
            "dark:from-primary/20 dark:to-background/80",
            "text-primary font-medium",
            "hover:from-primary/15 hover:to-background/90",
            "dark:hover:from-primary/25 dark:hover:to-background/70",
            "border-l-4 border-l-primary border-y-0 border-r-0",
            "shadow-sm"
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
        "w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive && [
          "bg-gradient-to-r from-primary/10 to-background",
          "dark:from-primary/20 dark:to-background/80",
          "text-primary font-medium",
          "hover:from-primary/15 hover:to-background/90",
          "dark:hover:from-primary/25 dark:hover:to-background/70",
          "border-l-4 border-l-primary border-y-0 border-r-0",
          "shadow-sm"
        ],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
} 