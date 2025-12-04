import { NavItem } from "@/types";
import { LayoutDashboard, Package, Shirt, Users } from "lucide-react";

export const SalesAdminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/sales-manager/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/sales-manager/products",
    icon: <Shirt className="h-5 w-5" />,
  },
  {
    title: "Customers",
    href: "/sales-manager/customers",
    icon: <Users className="h-5 w-5" />,
    // submenu: [
    //   { title: "Manage Suppliers", href: "/sales-manager/suppliers/manage" },
    //   { title: "Suppliers Dues", href: "/sales-manager/suppliers/dues" },
    // ],
  },
  {
    title: "Sales",
    href: "/sales-manager/sales/manage",
    icon: <Users className="h-5 w-5" />,
    submenu: [
      { title: "Manage", href: "/sales-manager/sales/manage" },
      { title: "Create", href: "/sales-manager/sales/create" },
    ],
  },
];
