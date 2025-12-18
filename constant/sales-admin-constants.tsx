import { NavItem } from "@/types";
import { format } from "date-fns";
import {
  CirclePercent,
  LayoutDashboard,
  Package,
  Shirt,
  Users,
} from "lucide-react";

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
    icon: <CirclePercent className="h-5 w-5" />,
    submenu: [
      { title: "Manage", href: "/sales-manager/sales/manage" },
      { title: "Create", href: "/sales-manager/sales/create" },
    ],
  },
];

export const salesColumns = [
  {
    label: "Sale ID",
    key: "id",
    sortable: true,
    render: (value: number) => (
      <span className="font-mono font-medium">#{value}</span>
    ),
  },
  {
    label: "Date",
    key: "sale_date",
    sortable: true,
    render: (value: string) => (
      <span>{format(new Date(value), "dd MMM yyyy")}</span>
    ),
  },
  {
    label: "Customer",
    key: "customer_name",
    sortable: true,
  },
  {
    label: "Amount",
    key: "total_amount",
    sortable: true,
    render: (value: number) => (
      <span className="font-bold">Rs. {value.toLocaleString()}</span>
    ),
  },
  {
    label: "Paid",
    key: "paid_amount",
    sortable: true,
  },
  {
    label: "Profit",
    key: "profit",
    sortable: true,
    render: (value: number) => {
      const color = value >= 0 ? "text-green-600" : "text-red-600";
      return (
        <span className={`font-medium ${color}`}>
          Rs. {value.toLocaleString()}
        </span>
      );
    },
  },
  {
    label: "Status",
    key: "status",
    sortable: true,
  },
  {
    label: "Created By",
    key: "created_by",
    sortable: true,
    render: (value: string) => <span className="text-sm">{value}</span>,
  },
  {
    label: "Created At",
    key: "created_at",
    sortable: true,
    render: (value: string) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(value), "dd MMM yyyy, HH:mm")}
      </span>
    ),
  },
];
