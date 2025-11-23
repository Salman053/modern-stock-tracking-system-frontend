"use client";
import { BranchForm } from "@/components/admin/add-new-branch-form";
import { BranchCard } from "@/components/shared/branch-card";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import Overlay from "@/components/shared/Overlay";
import { Button } from "@/components/ui/button";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { IBranch } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Branches = () => {
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const { mutate } = useMutation(
    `${server_base_url}/branches/${selectedBranch?.id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const { modalState, toggleModal } = useModalState({
    isAddEditBranchModelOpen: false,
    isDeleteBranchModelOpen: false,
  });
  const [branches, setBranches] = useState<IBranch[]>([]);
  const { data, error, loading, refetch } = useFetch<{ data: IBranch[] }>(
    `${server_base_url}/branches/?include_archived=true`
  );

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      setBranches(data.data);
    } else {
      setBranches([]);
    }
  }, [data]);

  async function handleDeleteBranch(password: string) {
    try {
      // Execute request
      await mutate({ password })
        .then(() => {
          toast.success("Branch archived successfully", {
            description: `The branch "${selectedBranch?.name}" has been archived. You can reactivate it later.`,
          });
          setSelectedBranch(null);
          toggleModal("isDeleteBranchModelOpen");
        })
        .catch((error: any) => {
          toast.error("Failed to archive branch", {
            description: error?.message || "Something went wrong.",
          });
        });

      return;
    } catch (err: any) {
      toast.error("Unexpected error", {
        description: err?.message || "Please try again.",
      });
    }
  }

  return (
    <div className="">
      <div className="flex items-start justify-between">
        <div className="mb-8">
          <h1 className="page-heading">Branch Management</h1>
          <p className="page-description max-w-2xl">
            Manage your business locations efficiently - monitor activity,
            update details, activate/deactivate branches, and add new locations
            to your network.
          </p>
        </div>
        <Button onClick={() => toggleModal("isAddEditBranchModelOpen")}>
          Add New Branch
        </Button>
      </div>
      {branches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No branches found</p>
        </div>
      ) : (
        <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          {branches.map((branch, index) => (
            <BranchCard
              className="cursor-default"
              onEdit={(branch) => {
                setSelectedBranch(branch);
                toggleModal("isAddEditBranchModelOpen");
                toast.info("You can update the branch");
              }}
              onDelete={(branch) => {
                setSelectedBranch(branch);
                toggleModal("isDeleteBranchModelOpen");
              }}
              key={branch.id || index}
              branch={branch as any}
            />
          ))}
        </div>
      )}
      <ConfirmationDialog
        onOpenChange={() => toggleModal("isDeleteBranchModelOpen")}
        title="Delete Confirmation"
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteBranchModelOpen}
        onConfirm={(password) => handleDeleteBranch(password as string)}
        description="This branch will not be permanently deleted. Instead, it will be archived and hidden from active operations. You can restore it anytime by changing its status back to 'Active'."
      />

      <Overlay
        isOpen={modalState.isAddEditBranchModelOpen}
        onClose={() => {
          toggleModal("isAddEditBranchModelOpen");
          setSelectedBranch(null);
        }}
      >
        <BranchForm
          initialData={selectedBranch as any}
          mode={selectedBranch ? "edit" : "create"}
          onSuccess={() => {
            toggleModal("isAddEditBranchModelOpen");
            refetch();
          }}
        />
      </Overlay>
    </div>
  );
};

export default Branches;
