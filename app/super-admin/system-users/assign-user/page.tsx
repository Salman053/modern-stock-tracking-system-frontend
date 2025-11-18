// app/assign-user/page.tsx
import { AssignUserForm } from "@/components/admin/assign-user-form";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useMutation } from "@/hooks/use-mutation";
import React from "react";

const Assign_user = () => {

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assign New User</h1>
        <p className="text-muted-foreground mt-2">
          Create new user accounts and assign system duties with specific roles
          and permissions
        </p>
      </div>

      <AssignUserForm />
    </div>
  );
};

export default Assign_user;
