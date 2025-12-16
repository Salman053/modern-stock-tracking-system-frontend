
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

// types/index.ts
export interface IEmployee {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  designation: string;
  cnic: string;
  user_id: string;
  branch_id: string;
  is_permanent: boolean;
  salary: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}
export interface ISalaryPayment {
  id: string;
  description: string;
  date: string;
  user_id: string;
  branch_id: string;
  employee_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  employee?: IEmployee;
}

export interface ICustomer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  cnic: string;
  user_id: string;
  branch_id: string;
  is_regular: boolean;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  branch_name?: string;
}



export enum SaleStatus {
  PENDING = 'pending',
  ACTIVE = "active",
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}


export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  user_id: number;
  branch_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
  product_name: string;
  available_stock: number;
}


export interface Sale {
  id: number;
  user_id: number;
  branch_id: number;
  customer_id: number;
  sale_date: string;
  total_amount: number;
  paid_amount: number;
  discount: number;
  profit: number;
  note: string;
  is_fully_paid: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  branch_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
}


export interface IDuePayments {
  id: number;
  description: string | null;
  payment_date: string;
  user_id: number;
  branch_id: number;
  due_type: "payable" | "receivable";
  due_id: number;
  amount: number; payment_method: "cash" | "card" | "bank" | "mobile" | string;
  created_at: string;
  updated_at: string;
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
  branch_name?: string
}
export interface ISupplierDue {
  id: string;
  supplier_id: number;
  branch_id: number;
  stock_movement_id?: number;
  due_date: string;
  total_amount: number;
  supplier_name?: string;
  branch_name?: string;
  paid_amount?: number;
  remaining_amount?: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_type: string;
  description?: string;
  created_at: string;
  updated_at: string;


}

export interface IBranchDue {
  id: string;
  supplier_id: number;
  branch_id: number;
  stock_movement_id?: number;
  due_date: string;
  total_amount: number;
  supplier_name?: string;
  branch_name?: string;
  paid_amount?: number;
  remaining_amount?: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  due_type: 'purchase' | 'credit' | 'other';
  description?: string;
  created_at: string;
  updated_at: string;


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
export interface CustomerDue {
    id: number;
    branch_id: number;
    sales_id: number;
    due_date: string;
    total_amount: string;
    paid_amount: string;
    remaining_amount: string;
    status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    due_type: string;
    description: string;
    created_at: string;
    updated_at: string;
}