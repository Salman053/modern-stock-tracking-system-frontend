"use client";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import { PasswordUpdateForm } from "@/components/shared/password-update";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { manage_branches_table_columns } from "@/constant/admin-constants";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { IUser } from "@/types";
import { FilePenLine, Shield, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

function SingleBranchUsers() {
  const { id } = useParams();
  
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("branch_name");
  const branchId = Array.isArray(id) ? id[0] : id;
  const { modalState, toggleModal } = useModalState({
    isDeleteModalOpen: false,
    isPasswordDialogOpen: false,
  });
  const { data, refetch, error, loading } = useFetch(
    branchId
      ? `${server_base_url}/users/branch-users/?branch_id=${branchId}&&include_archived=true`
      : null,
    {
      auto: true,
      method: "GET",
      onError: (error) => {
        console.error("Error fetching branch users:", error);
      },
    }
  );
  const { mutate } = useMutation(`${server_base_url}/users/deactivate`, {
    credentials: "include",
    method: "POST",
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("The user is deactivated successfully");
      toggleModal("isDeleteModalOpen");
      setSelectedUser(null);
      refetch();
    },
  });
  const options = [
    {
      label: "edit",
      icon: <FilePenLine size={16} />,
      onClick: (item: IUser) => {
        const params = new URLSearchParams({
          id: String(item.id),
          username: item.username,
          email: item.email,
          status: item.status,
          role: item.role,
          branch_id: String(item.branch_id),
          branch_name: String(name),
        });
        router.push(`/super-admin/assign-user/?${params.toString()}`);
      },
    },
    {
      label: "delete",
      onClick: (item: IUser) => {
        toggleModal("isDeleteModalOpen");
        setSelectedUser(item);
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
    {
      label: "Change Password",
      onClick: (item: IUser) => {
        toggleModal("isPasswordDialogOpen");
        setSelectedUser(item);
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Shield size={16} />,
    },
  ];
  const users: IUser[] =
    data?.data && Array.isArray(data.data)
      ? data.data.map((user) => ({
          ...user,
          name: name,
        }))
      : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load users</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleDeactivateUser = async (password: string) => {
    try {
      await mutate({ admin_password: password, user_id: selectedUser?.id });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="page-heading">{name} Users </h2>
        <h3 className="page-description">
          Manage users for branch {branchId}
          {users.length > 0 &&
            ` - ${users.length} user${users.length !== 1 ? "s" : ""} found`}
        </h3>
      </div>

      {users.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No users found for this branch
          </p>
        </div>
      ) : (
        <DataTable
          selectable={false}
          defaultItemsPerPage={10}
          pagination
          loading={loading}
          columns={manage_branches_table_columns}
          rows={users}
          actions={(row: any) => (
            <div className="flex gap-2 justify-center">
              <ReusablePopover actions={options as any} rowData={row} />
            </div>
          )}
        />
      )}

      <ConfirmationDialog
        requiresPassword
        onConfirm={(password) => handleDeactivateUser(password as string)}
        onOpenChange={() => toggleModal("isDeleteModalOpen")}
        open={modalState.isDeleteModalOpen}
        title="Deactivate User Account"
        variant="destructive"
        passwordLabel="Enter your admin password to confirm deactivation"
        description={
          <div className="space-y-3">
            <p className="font-medium text-gray-900">
              This will immediately revoke system access for{" "}
              <span className="text-red-600">{selectedUser?.username}</span>
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>User will be logged out from all active sessions</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>All future login attempts will be blocked</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Dashboard and portal access will be suspended</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800 font-medium">Note:</p>
              <p className="text-sm text-blue-700">
                User data is preserved. Access can be restored anytime by
                updating status to "Active".
              </p>
            </div>
          </div>
        }
        confirmText="Deactivate User"
        cancelText="Cancel"
      />
      <Overlay
        isOpen={modalState.isPasswordDialogOpen}
        onClose={() => toggleModal("isPasswordDialogOpen")}
      >
        <PasswordUpdateForm userId={String(selectedUser?.id)} userName={selectedUser?.username } onSuccess={()=>{
          toggleModal("isPasswordDialogOpen");
          setSelectedUser(null)
        }} 
        onCancel={()=>{
          toggleModal("isPasswordDialogOpen");
          setSelectedUser(null)
        }} />
      </Overlay>
    </div>
  );
}

export default SingleBranchUsers;
