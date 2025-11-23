"use client";
import { AssignUserForm } from "@/components/branch/assign-user-form";
import { UserRole } from "@/types";
import { useSearchParams } from "next/navigation";

const Assign_user = () => {
  const searchParams = useSearchParams();

  const userData: any = {
    id: Number(searchParams.get("id")),
    username: searchParams.get("username") as string,
    email: searchParams.get("email") as any,
    branch_id: searchParams.get("branch_id") as any,
    role: searchParams.get("role") as UserRole,
    status: searchParams.get("status") as "active",
    branch_name: searchParams.get("branch_name") as string,
  };
  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assign New User</h1>
        <p className="text-muted-foreground mt-2">
          Create new user accounts and assign system duties with specific roles
          and permissions
        </p>
      </div>

      <AssignUserForm
        initialData={userData.id ? userData : null}
        mode={userData.id ? "edit" : "create"}
      />
    </div>
  );
};

export default Assign_user;
