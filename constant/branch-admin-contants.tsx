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
      <span className="capitalize">{value.replace('_', ' ')}</span>
    )
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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value > 50 ? 'bg-green-100 text-green-800' :
        value > 10 ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value} units
      </span>
    )
  },
  {
    label: "Purchase Price",
    key: "purchase_price_per_meter",
    sortable: true,
    render: (value: number) => `Rs.${value.toFixed(2)}/m`
  },
  {
    label: "Sales Price",
    key: "sales_price_per_meter",
    sortable: true,
    render: (value: number) => `Rs.${value.toFixed(2)}/m`
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
        out_of_stock: { color: "bg-red-100 text-red-800", label: "Out of Stock" }
      };
      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.inactive;
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
          {config.label}
        </span>
      );
    }
  },
  {
    label: "Last Updated",
    key: "updated_at",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString()
  }
];