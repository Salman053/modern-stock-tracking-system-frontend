
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
  created_at: string;
  updated_at: string;
  branch_name?:string
}

export interface IStockMovement {
  id: string | number;
  product_id: string | number;
  product_name?: string;
  movement_type: 'arrival' | 'dispatch' | 'transfer_in' | 'transfer_out' | 'adjustment';
  supplier_id?: string | number;
  reference_branch_id?: string | number;
  reference_branch_name?: string;
  quantity: number;
  unit_price_per_meter: number;
  paid_amount?: number;
  total_amount: number;
  remaining_amount?: number;
  date: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  auto_update_product: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  branch_id?: string | number;
  user_id?: string | number;
}

export interface ISupplier {
  id: string | number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  cnic?: string | null;
  user_id: string | number;
  branch_id: string | number;
  is_permanent: boolean;
  status: 'active' | 'inactive' | 'archived';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
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
  status: 'active' | 'inactive' | 'out_of_stock' | 'archived';
  created_at: string;
  updated_at: string;
  profit_margin?: number;
}