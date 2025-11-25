import { IEmployee, NavItem } from "@/types";
import {
  Box,
  Folders,
  LayoutDashboard,
  Package,
  Shirt,
  Truck,
  User,
  User2,
} from "lucide-react";

export const branchAdminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/branch-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/branch-admin/products",
    icon: <Shirt className="h-5 w-5" />,
  },
  {
    title: "System Users",
    href: "/branch-admin/manage-users",
    icon: <Folders className="h-5 w-5" />,
    submenu: [
      { title: "Manage Users", href: "/branch-admin/manage-users" },
      { title: "Assign User", href: "/branch-admin/assign-user" },
    ],
  },
  {
    title: "Suppliers",
    href: "/branch-admin/suppliers/manage",
    icon: <Package className="h-5 w-5" />,
    submenu: [
      { title: "Manage Suppliers", href: "/branch-admin/suppliers/manage" },
      { title: "Suppliers Dues", href: "/branch-admin/suppliers/dues" },
    ],
  },
  {
    title: "Stock Operations",
    href: "/branch-admin/stock-operations",
    icon: <Truck className="h-5 w-5" />,
  },
  {
    title: "Employees",
    href: "/branch-admin/employees",
    icon: <User2 className="h-5 w-5" />,
  },
];

// constant/branch-admin-contants.ts
export const employees_table_column_branch_admin = [
  {
    label: "ID",
    key: "id",
    sortable: true,
  },
  {
    label: "Name",
    key: "name",
    sortable: true,
    render: (value: string) => <h3 className="font-medium ">{value}</h3>,
  },
  {
    label: "Contact",
    key: "phone",
    render: (value: string) => (
      <div className="space-y-1">
        <p className="text-sm font-medium">{value}</p>
      </div>
    ),
  },
  {
    label: "CNIC",
    key: "cnic",
    render: (value: string) => (
      <span className="font-mono text-sm">{value}</span>
    ),
  },
  {
    label: "Address",
    key: "address",
    render: (value: string) => (
      <div className="max-w-[200px]">
        <p className="text-sm truncate" title={value}>
          {value}
        </p>
      </div>
    ),
  },
  {
    label: "Type",
    key: "is_permanent",
    sortable: true,
    render: (value: boolean) => {
      const isPermanent = value;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isPermanent
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {isPermanent ? "Permanent" : "Contract"}
        </span>
      );
    },
  },
  {
    label: "Salary",
    key: "salary",
    sortable: true,
    render: (value: number) => (
      <span className="font-semibold">Rs. {value?.toLocaleString()}</span>
    ),
  },
  {
    label: "Status",
    key: "status",
    sortable: true,
    render: (value: "active" | "inactive") => {
      const isActive = value === "active";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    label: "Join Date",
    key: "created_at",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
    ),
  },
];
export const supplier_dues_table_column_branch_admin = [
  {
    label: "Stock Id",
    key: "stock_movement_id",
    sortable: true,
  },
  {
    label: "Supplier",
    key: "supplier_name",
    sortable: true,
    render: (value: string) => value || `${value}`,
  },
  {
    label: "Due Date",
    key: "due_date",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    label: "Total Amount",
    key: "total_amount",
    sortable: true,
    render: (value: number) => `Rs. ${value}`,
  },
  {
    label: "Paid Amount",
    key: "paid_amount",
    sortable: true,
    render: (value: number) => `Rs. ${value}`,
  },

  {
    label: "Created At",
    key: "created_at",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];
// constant/branch-admin-contants.ts
export const suppliers_columns = [
  {
    label: "Supplier",
    key: "name",
    sortable: true,
  },
  {
    label: "CNIC",
    key: "cnic",
    sortable: true,
  },
  {
    label: "Address",
    key: "address",
    sortable: false,
    render: (value: string) =>
      value?.length > 50 ? `${value.substring(0, 50)}...` : value,
  },
  {
    label: "Created Date",
    key: "created_at",
    sortable: true,
    render: (value: string) =>
      value ? new Date(value).toLocaleDateString() : "N/A",
  },
];
export const stock_movements_columns = [
  {
    label: "Product",
    key: "product_name",
    sortable: true,
  },
  {
    label: "Quantity",
    key: "quantity",
    sortable: true,
    render: (value: number) => value?.toLocaleString(),
  },
  {
    label: "Unit Price",
    key: "unit_price_per_meter",
    sortable: true,
    render: (value: number) => `Rs. ${value?.toLocaleString()}`,
  },
  {
    label: "Date",
    key: "date",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    label: "Created By",
    key: "created_by",
    sortable: true,
  },
];
export const products_table_column_branch_admin = [
  {
    label: "Name",
    key: "name",
    sortable: true,
  },
  {
    label: "Type",
    key: "type",
    sortable: true,
    render: (value: string) => (
      <span className="capitalize">{value.replace("_", " ")}</span>
    ),
  },
  {
    label: "Company",
    key: "company",
    sortable: true,
  },
  {
    label: "Quantity",
    key: "quantity",
    sortable: true,
    render: (value: number) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value > 50
            ? "bg-green-100 text-green-800"
            : value > 10
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {value} units
      </span>
    ),
  },
  {
    label: "Purchase Price",
    key: "purchase_price_per_meter",
    sortable: true,
    render: (value: number) => `Rs.${value.toFixed(2)}/m`,
  },
  {
    label: "Sales Price",
    key: "sales_price_per_meter",
    sortable: true,
    render: (value: number) => `Rs.${value.toFixed(2)}/m`,
  },
  {
    label: "Status",
    key: "status",
    sortable: true,
    render: (value: string) => {
      const statusConfig = {
        active: { color: "bg-green-100 text-green-800", label: "Active" },
        inactive: { color: "bg-yellow-100 text-yellow-800", label: "Inactive" },
        archived: { color: "bg-red-100 text-red-800", label: "Archived" },
        out_of_stock: {
          color: "bg-red-100 text-red-800",
          label: "Out of Stock",
        },
      };
      const config =
        statusConfig[value as keyof typeof statusConfig] ||
        statusConfig.inactive;

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    label: "Last Updated",
    key: "updated_at",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];
