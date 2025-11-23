import { TableColumn } from "@/components/shared/DataTable";
import renderStatus from "@/components/shared/status";
import { NavItem } from "@/types";
import { Building, Folders, LayoutDashboard } from "lucide-react";

export const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Branches",
    href: "/super-admin/branches",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "System Users",
    href: "/super-admin/system-users",
    icon: <Folders className="h-5 w-5" />,
    submenu: [
      { title: "Manage Users", href: "/super-admin/manage-users" },
      { title: "Assign User", href: "/super-admin/assign-user" },
     
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

export const manage_branches_table_columns: TableColumn[] = [
  {
    label: "user ID",
    key: "id",
    sortable: true,
  },
  {
    label: "username",
    key: "username",
    sortable: true,
  },
  {
    label: "Email",
    key: "email",
    sortable: true,
  },
  {
    label: "Role",
    key: "role",
    sortable: true,
  },
  {
    label: "Status",
    key: "status",
    sortable: true,
    render: (value) => renderStatus(value),
  },
  
  // {
  //   label: "Branch Name",
  //   key: "name",
  //   sortable: true,
  // },
 
  {
    label: "Last Login",
    key: "last_login",
    sortable: true,
  },
  // {
  //   label: "Created At",
  //   key: "created_at",
  //   sortable: true,
  // },
];
