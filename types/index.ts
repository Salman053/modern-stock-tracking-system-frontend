
export type UserRole = 'super-admin' | 'admin' | 'user' | 'guest';


export interface IBranch {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'pending'; // Added a status for the branch
    country: string;
    city: string;
    address: string;
    is_main_branch: boolean;
    created_at: Date; // Using Date object for better time handling
    updated_at: Date; // Using Date object for better time handling
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