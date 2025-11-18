import { NavItem } from "@/types";
import { Folders, LayoutDashboard } from "lucide-react";



export const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "System Users",
    href: "/super-admin/system-users",
    icon: <Folders className="h-5 w-5" />,
    submenu: [
      { title: "Manage Users", href: "/super-admin/system-users/manage-users" },
      { title: "Assign User", href: "/super-admin/system-users/assign-user" },
      { title: "Archived Users", href: "/super-admin/system-users/archived-users" },
    ],
  },
 
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: <Settings className="h-5 w-5" />,
  //   submenu: [
  //     { title: "General", href: "/settings" },
  //     { title: "Security", href: "/settings/security" },
  //     { title: "Billing", href: "/settings/billing" },
  //   ],
  // },
];