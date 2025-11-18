"use client";

import * as React from "react";
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IUser } from "@/types";
import { ThemeToggleButton } from "./theme-toggle-button";

interface HeaderProps {
  user?: IUser;
  onLogout?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
  className?: string;
}

export default function Header({
  user = {
    username: "John Doe",
    email: "john@acme.com",
    role: "super-admin",
    status: "active",
    branch_id: 1,
    id: 1,
  },
  onLogout,
  onSettings,
  onProfile,
  onNotifications,
  notificationCount = 3,
  className,
}: HeaderProps) {

  return (
    <header
      className={cn(
        "flex items-center justify-between p-4  bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200/60 dark:border-gray-800/60 backdrop-blur-sm",
        className
      )}
    >
      {/* Left side - Welcome message */}
      <div className="flex-1 max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.username?.split("-")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-xs dark:text-gray-400 mt-1">
          Here's what's happening in your business.
        </p>
      </div>

      {/* Right side - Search, Notifications, and User dropdown */}
      <div className="flex items-center gap-4">
        {/* Notifications
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onNotifications}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-0"
            >
              {notificationCount}
            </Badge>
          )}
        </Button> */}
        <ThemeToggleButton/>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {user?.username
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-gray-200 dark:border-gray-700"
          >
            {/* Welcome Message */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Welcome back!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Good to see you, {user?.username?.split(" ")[0]}
              </p>
            </div>

            {/* Profile */}
            <DropdownMenuItem
              onClick={onProfile}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
            >
              <User className="h-4 w-4 text-gray-500" />
              <span>Your Profile</span>
            </DropdownMenuItem>

            {/* Settings */}
            <DropdownMenuItem
              onClick={onSettings}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
