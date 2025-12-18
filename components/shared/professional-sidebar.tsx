"use client";

import * as React from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LogOut,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types";

// Utility to safely extract initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

interface ProfessionalSidebarProps {
  nav: NavItem[];
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  user?: {
    username: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
}

export default function ProfessionalSidebar({
  nav,
  logo,
  title = "Stock Master",
  subtitle = "Enterprise",
  user,
  onLogout,
  onSettings,
}: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  // Sync expanded state based on current path
  React.useEffect(() => {
    const newExpanded = new Set<string>();
    nav.forEach((item) => {
      if (
        item.submenu?.some((sub) =>
          pathname.startsWith(sub.href.endsWith("/") ? sub.href : `${sub.href}/`)
        )
      ) {
        newExpanded.add(item.title);
      }
    });
    setExpandedItems(newExpanded);
  }, [pathname, nav]);

  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  // Avoid re-creating on every render
  const SidebarContent = React.useMemo(
    () => () => (
      <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200/60 dark:border-gray-800/60">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-800/60 transition-all duration-300">
          <div className="flex items-center gap-3">
            {logo || (
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25",
                  collapsed ? "hidden" : "bg-gradient-to-br from-blue-600 to-purple-600"
                )}
                aria-label={`${title} logo`}
              >
                {getInitials(title)}
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

          <Button
            size="icon"
            variant="ghost"
            className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {nav.map((item) => {
            const hasSubmenu = Boolean(item.submenu?.length);
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasActiveChild = item.submenu?.some(
              (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
            );
            const isExpanded = expandedItems.has(item.title);

            const isItemActive = isActive || Boolean(hasActiveChild);

            return (
              <div key={item.title} className="group">
                <div
                  role={hasSubmenu ? "button" : undefined}
                  aria-expanded={hasSubmenu ? isExpanded : undefined}
                  aria-current={isItemActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
                    isItemActive
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm border-blue-200 dark:border-blue-800/50"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700/50"
                  )}
                  onClick={(e) => {
                    if (hasSubmenu) {
                      e.preventDefault();
                      toggleSubmenu(item.title);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (hasSubmenu) {
                        toggleSubmenu(item.title);
                      } else {
                        setMobileOpen(false);
                      }
                    }
                  }}
                  tabIndex={0}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 flex-1 w-full",
                      collapsed && "justify-center"
                    )}
                    onClick={(e) => hasSubmenu && e.preventDefault()}
                    aria-label={item.title}
                  >
                    <span
                      className={cn(
                        "transition-all duration-200",
                        isItemActive
                          ? "text-blue-600 dark:text-blue-400 scale-110"
                          : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:scale-105"
                      )}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="font-medium text-sm truncate">{item.title}</span>
                    )}
                  </Link>

                  {hasSubmenu && !collapsed && (
                    <button
                      className="ml-2 p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubmenu(item.title);
                      }}
                      aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>

                {hasSubmenu && isExpanded && !collapsed && (
                  <div className="ml-8 mt-1.5 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                    {item.submenu!.map((sub) => {
                      const isSubActive =
                        pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block"
                          aria-current={isSubActive ? "page" : undefined}
                        >
                          <div
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm transition-all duration-150 border border-transparent",
                              isSubActive
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium shadow-xs border-blue-200 dark:border-blue-800/50"
                                : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-xs hover:border-gray-200 dark:hover:border-gray-700/50"
                            )}
                          >
                            <div className="font-medium truncate">{sub.title}</div>
                            {sub.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-1">
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

        {/* User Footer (Optional but professional) */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200/40 dark:border-gray-800/40">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar?.trim()} />
                <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettings();
                    setMobileOpen(false);
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Button>
              )}
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    ),
    [nav, collapsed, expandedItems, pathname, user, onSettings, onLogout, logo, title, subtitle]
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col max-h-screen overflow-y-auto transition-all duration-300 z-40",
          collapsed ? "w-20" : "w-60"
        )}
        aria-label="Main navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg backdrop-blur-md border-gray-300/50 dark:border-gray-700/50 hover:bg-white hover:shadow-xl transition-all duration-200"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50"
          aria-label="Mobile navigation"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}