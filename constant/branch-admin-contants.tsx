import { NavItem } from "@/types";
import { Box, Building, Folders, LayoutDashboard } from "lucide-react";

export const branchAdminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/branch-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/branch-admin/products",
    icon: <Box className="h-5 w-5" />,
  },
  {
    title: "System Users",
    href: "/branch-admin/system-users",
    icon: <Folders className="h-5 w-5" />,
    submenu: [
      { title: "Manage Users", href: "/branch-admin/manage-users" },
      { title: "Assign User", href: "/branch-admin/assign-user" },
     
    ],
  }]