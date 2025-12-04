import { formatCurrency } from "@/lib/currency-utils";
import { IEmployee, NavItem } from "@/types";
import {
  Box,
  Building,
  Calendar,
  DollarSign,
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
    title: "Branches",
    href: "/branch-admin/branches",
    icon: <Building className="h-5 w-5" />,
    submenu: [{ title: "Manage Branches", href: "/branch-admin/branches" }],
  },
  {
    title: "Customers",
    href: "/branch-admin/customers",
    icon: <Building className="h-5 w-5" />,
    // submenu: [
    // { title: "Manage Customers", href: "/branch-admin/customers" },
    // { title: "Add Customer", href: "/branch-admin/customers/add" },
    // ],
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
export const salary_payments_table_column_branch_admin = [
  {
    label: "ID",
    key: "id",
    sortable: true,
  },

  {
    label: "Amount",
    key: "amount",
    sortable: true,
    render: (value: number) => (
      <span className="font-semibold text-sm text-green-600">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    label: "Date",
    key: "date",
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    label: "Description",
    key: "description",
    render: (value: string) => (
      <div className="max-w-[200px]">
        <p className="text-sm truncate" title={value}>
          {value || "No description"}
        </p>
      </div>
    ),
  },
  {
    label: "Status",
    key: "status",
    render: () => (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Paid
      </span>
    ),
  },
  {
    label: "Created",
    key: "created_at",
    sortable: true,
    render: (value: string) => (
      <span className="text-sm text-gray-500">
        {new Date(value).toLocaleDateString()}
      </span>
    ),
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
      <span className="text-green-500 font-semibold">
        {formatCurrency(value)}
      </span>
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
export const branch_dues_columns = [
  {
    label: "ID",
    key: "id",
    sortable: true,
    render: (value: string) => <span className="font-mono">#{value}</span>,
  },
  {
    label: "Branch",
    key: "branch_name",
    sortable: true,
  },

  {
    label: "Total",
    key: "total_amount",
    sortable: true,
    render: (value: number) => (
      <span className="font-medium">{formatCurrency(value)}</span>
    ),
  },
  {
    label: "Paid",
    key: "paid_amount",
    sortable: true,
    render: (value: number) => {
      return <span>{formatCurrency(value)}</span>;
    },
  },
  {
    label: "Remaining",
    key: "remaining_amount",
    sortable: true,
    render: (value: number) => {
      return <span>{formatCurrency(value)}</span>;
    },
  },
  {
    label: "D.Date",
    key: "due_date",
    sortable: true,
    render: (value: string) => (
      <div className="text-sm text-gray-500">
        {value ? new Date(value).toLocaleDateString() : "N/A"}
      </div>
    ),
  },
  {
    label: "Status",
    key: "status",
    sortable: true,
    render: (value: string) => {
      const statusColors = {
        pending: "bg-blue-100 text-blue-800",
        partial: "bg-yellow-100 text-yellow-800",
        paid: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      };

      const colorClass =
        statusColors[value as keyof typeof statusColors] ||
        "bg-gray-100 text-gray-800";

      return (
        <div
          className={`inline-flex  items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          <span className="capitalize">{value}</span>
        </div>
      );
    },
  },
  {
    label: "Type",
    key: "due_type",
    sortable: true,
  },
  {
    label: "P.Name",
    key: "product_name",
    sortable: true,
  },
  {
    label: "Created",
    key: "created_at",
    sortable: true,
    render: (value: string) => (
      <div className="text-sm text-gray-500">
        {value ? new Date(value).toLocaleDateString() : "N/A"}
      </div>
    ),
  },
  {
    label: "Description",
    key: "description",
    sortable: false,
    render: (value: string) => (
      <div title={value} className="max-w-xs">
        {value ? (
          value.slice(0, 10) + "....."
        ) : (
          <span className="text-gray-400">No description</span>
        )}
      </div>
    ),
  },
];

// In your constants file
export const customers_table_column_branch_admin = [
  {
    label: "ID",
    key: "id",
    sortable: true,
  },
  {
    label: "Name",
    key: "name",
    sortable: true,
  },
  {
    label: "Phone",
    key: "phone",
    sortable: false,
  },
  {
    label: "Address",
    key: "address",
    sortable: false,
    render: (value: string) => (
      <span className="max-w-[200px] truncate inline-block" title={value}>
        {value}
      </span>
    ),
  },
  {
    label: "Created At",
    key: "created_at",
    sortable: true,
    render: (value: string) => {
      const date = new Date(value);
      return date.toLocaleDateString();
    },
  },
];
