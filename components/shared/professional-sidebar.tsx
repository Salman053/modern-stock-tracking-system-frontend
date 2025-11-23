"use client";

import * as React from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight as ExpandIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types";

interface ProfessionalSidebarProps {
  nav: NavItem[];
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
}

export default function ProfessionalSidebar({
  nav,
  logo,
  title = "Acme Pro",
  subtitle = "Enterprise",
  user = {
    name: "John Doe",
    email: "john@acme.com",
    avatar: "https://github.com/shadcn.png",
  },
  onLogout,
  onSettings,
}: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false); // NEW: collapsed state
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    nav.forEach((item) => {
      if (item.submenu?.some((sub) => pathname.startsWith(sub.href))) {
        setExpandedItems((prev) =>
          prev.includes(item.title) ? prev : [...prev, item.title]
        );
      }
    });
  }, [pathname, nav]);

  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200/60 dark:border-gray-800/60">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-800/60 transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-3">
          {logo || (
            <div className={` ${collapsed && "hidden"} w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25`}>
              {title.charAt(0)}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Collapse/Expand button */}
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ExpandIcon className="w-4 h-4 rotate-180" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {nav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedItems.includes(item.title);
          const hasActiveChild = item.submenu?.some(
            (sub) =>
              pathname === sub.href || pathname.startsWith(sub.href + "/")
          );

          return (
            <div key={item.title} className="group">
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
                  isActive || hasActiveChild
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm border-blue-200 dark:border-blue-800/50"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700/50"
                )}
                onClick={(e) => {
                  if (hasSubmenu) {
                    e.preventDefault();
                    toggleSubmenu(item.title);
                  } else {
                    setOpen(false);
                  }
                }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 flex-1",
                    collapsed && "justify-center"
                  )}
                  onClick={(e) => hasSubmenu && e.preventDefault()}
                >
                  <span
                    className={cn(
                      "transition-all duration-200",
                      isActive || hasActiveChild
                        ? "text-blue-600 dark:text-blue-400 scale-110"
                        : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:scale-105"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.title}</span>
                  )}
                </Link>

                {hasSubmenu && !collapsed && (
                  <button
                    className="ml-2 p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubmenu(item.title);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    )}
                  </button>
                )}
              </div>

              {hasSubmenu && isExpanded && !collapsed && (
                <div className="ml-8 mt-1.5 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                  {item.submenu!.map((sub) => {
                    const isSubActive =
                      pathname === sub.href ||
                      pathname.startsWith(sub.href + "/");
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setOpen(false)}
                      >
                        <div
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm transition-all duration-150 border border-transparent",
                            isSubActive
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium shadow-xs border-blue-200 dark:border-blue-800/50"
                              : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-xs hover:border-gray-200 dark:hover:border-gray-700/50"
                          )}
                        >
                          <div className="font-medium">{sub.title}</div>
                          {sub.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col max-h-screen overflow-y-auto transition-all duration-300 z-40",
          collapsed ? "w-20" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg backdrop-blur-md border-gray-300/50 dark:border-gray-700/50 hover:bg-white hover:shadow-xl transition-all duration-200"
          >
            {open ? (
              <X className="h-4.5 w-4.5" />
            ) : (
              <Menu className="h-4.5 w-4.5" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
