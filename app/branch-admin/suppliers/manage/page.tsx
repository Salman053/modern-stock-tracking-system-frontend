"use client";
import { SupplierForm } from "@/components/branch/add-supplier-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { suppliers_columns } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { ISupplier } from "@/types";
import { FilePenLine, Trash2, Building, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Suppliers = () => {
  const { toggleModal, modalState } = useModalState({
    isAddEditSupplierModalOpen: false,
    isDeleteSupplierModalOpen: false,
  });

  const {user} = useAuth()
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/suppliers/?branch_id=${user?.branch_id}&include_archived=true`,
    {
      credentials: "include",
      auto: true,
    }
  );
  console.log(data)

  const { mutate: deleteSupplier, loading: deleteLoading } = useMutation(
    `${server_base_url}/suppliers/${selectedSupplier?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message || "Failed to delete supplier. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Supplier Deleted Successfully", {
          description: `${selectedSupplier?.name} has been deleted successfully.`,
        });
        toggleModal("isDeleteSupplierModalOpen");
        setSelectedSupplier(null);
        refetch();
      },
    }
  );

  const suppliers: ISupplier[] = data?.data || [];

  const options = [
    {
      label: "Edit",
      icon: <FilePenLine size={16} />,
      onClick: (item: ISupplier) => {
        setEditingSupplier(item);
        toggleModal("isAddEditSupplierModalOpen");
      },
    },
    {
      label: "Delete",
      onClick: (item: ISupplier) => {
        setSelectedSupplier(item);
        toggleModal("isDeleteSupplierModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    toggleModal("isAddEditSupplierModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditSupplierModalOpen");
    setEditingSupplier(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedSupplier || !password) return;

    try {
      await deleteSupplier({
        admin_password: password,
      });
    } catch (error: any) {
      toast.error("Deletion Failed", {
        description:
          error?.message || "Failed to delete supplier. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditSupplierModalOpen");
    setEditingSupplier(null);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", color: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", color: "bg-yellow-100 text-yellow-800" },
      archived: { label: "Archived", color: "bg-red-100 text-red-800" },
    }[status];

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || status}
      </span>
    );
  };

  const getPermanentBadge = (isPermanent: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isPermanent 
          ? "bg-blue-100 text-blue-800" 
          : "bg-gray-100 text-gray-800"
      }`}>
        {isPermanent ? "Permanent" : "Temporary"}
      </span>
    );
  };

  const enhancedColumns = [
    ...suppliers_columns,
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      label: "Type",
      key: "is_permanent",
      sortable: true,
      render: (value: boolean) => getPermanentBadge(value),
    },
    {
      label: "Phone",
      key: "phone",
      sortable: true,
      render: (value: string) => value || "N/A",
    },
    {
      label: "Email",
      key: "email",
      sortable: true,
      render: (value: string) => value || "N/A",
    },
  ];



  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Suppliers Management</h2>
          <p className="page-description">
            Manage all your suppliers and vendor information
            {suppliers.length > 0 &&
              ` - ${suppliers.length} supplier${
                suppliers.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
        <Button onClick={handleAddSupplier} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

     
        <DataTable
          selectable={false}
          defaultItemsPerPage={10}
          pagination={true}
          columns={enhancedColumns}
          rows={suppliers as any}
          loading={loading}
          actions={(row: any) => (
            <div className="flex gap-2 justify-center">
              <ReusablePopover actions={options as any} rowData={row} />
            </div>
          )}
        />


      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditSupplierModalOpen}
        onClose={handleCloseEditModal}
      >
        <SupplierForm
          mode={editingSupplier ? "edit" : "create"}
          initialData={editingSupplier as any && {...editingSupplier,is_permanent:editingSupplier?.is_permanent ? true:false}}
          onSuccess={handleFormSuccess}
        />
      </Overlay>

      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteSupplierModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteSupplierModalOpen");
          setSelectedSupplier(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Supplier"
        description={
          selectedSupplier ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to delete the supplier:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      {selectedSupplier.name}
                    </p>
                    <p className="text-sm text-amber-700">
                      CNIC: {selectedSupplier.cnic}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      Phone: {selectedSupplier.phone}
                    </p>
                    {selectedSupplier.email && (
                      <p className="text-sm text-amber-600">
                        Email: {selectedSupplier.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Supplier information will be permanently removed</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    All associated records will be updated to reflect this deletion
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This action cannot be undone</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium">Note:</p>
                <p className="text-sm text-blue-700">
                  If this supplier has active stock movements or pending transactions, 
                  consider marking them as inactive instead of deleting.
                </p>
              </div>
            </div>
          ) : (
            <div>Loading supplier information...</div>
          )
        }
        confirmText={deleteLoading ? "Deleting..." : "Delete Supplier"}
        cancelText="Keep Supplier"
        passwordLabel="Enter your admin password to confirm deletion"
      />
    </div>
  );
};

export default Suppliers;