
export type UserRole = 'super-admin' | 'admin' | 'user' | 'guest';


export interface IBranch {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'archived'; // Added a status for the branch
    country: string;
    city: string;
    address: string;
    is_main_branch: boolean;
    created_at: any; // Using Date object for better time handling
    updated_at: any; // Using Date object for better time handling
}

export interface IUser {
    id: number;
    username: string;
    password?: string;
    email: string;
    last_login?: Date | null;
    status: 'active' | 'suspended' | 'invited';
    role: UserRole;
    branch_id: number;
}


export type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  submenu?: { title: string; href: string; description?: string }[];
};

export interface IProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  company: string;
  quantity: number;
  user_id: string;
  branch_id: string;
  purchase_price_per_meter: number;
  sales_price_per_meter: number;
  status: 'active' | 'inactive' | 'out_of_stock'|'archived';
  created_at: string;
  updated_at: string;
  profit_margin?: number;
}