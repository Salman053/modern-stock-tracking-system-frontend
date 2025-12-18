"use client";
import { CustomerForm } from "@/components/branch/add-customer-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { customers_table_column_branch_admin } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { ICustomer } from "@/types";
import { FilePenLine, Trash2, UserPlus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CustomersPage = () => {
  const { user } = useAuth();
  const { toggleModal, modalState } = useModalState({
    isAddEditCustomerModalOpen: false,
    isDeleteCustomerModalOpen: false,
  });

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<ICustomer | null>(
    null
  );

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/customers?branch_id=${user?.branch_id}&include_archived=true`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const { mutate: deleteCustomer, loading: deleteLoading } = useMutation(
    `${server_base_url}/customers/${selectedCustomer?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message || "Failed to delete customer. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Customer Deleted Successfully", {
          description: `${selectedCustomer?.name} has been permanently deleted.`,
        });
        toggleModal("isDeleteCustomerModalOpen");
        setSelectedCustomer(null);
        refetch();
      },
    }
  );

  const { mutate: archiveCustomer, loading: archiveLoading } = useMutation(
    `${server_base_url}/customers/${selectedCustomer?.id}`,
    {
      credentials: "include",
      method: "PATCH",
      onError: (error: any) => {
        toast.error("Archive Failed", {
          description:
            error?.message || "Failed to archive customer. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Customer Archived Successfully", {
          description: `${selectedCustomer?.name} has been moved to archived status.`,
        });
        toggleModal("isDeleteCustomerModalOpen");
        setSelectedCustomer(null);
        refetch();
      },
    }
  );

  const customers: ICustomer[] = data?.data || [];

  const options = [
    {
      label: "Edit",
      icon: <FilePenLine size={12} />,
      onClick: (item: ICustomer) => {
        setEditingCustomer(item);
        toggleModal("isAddEditCustomerModalOpen");
      },
    },
    {
      label: "Archive",
      onClick: (item: ICustomer) => {
        setSelectedCustomer(item);
        toggleModal("isDeleteCustomerModalOpen");
        toast.warning(
          "Please carefully read the instructions before taking action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    toggleModal("isAddEditCustomerModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditCustomerModalOpen");
    setEditingCustomer(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedCustomer || !password) return;

    try {
      if (selectedCustomer.status === "archived") {
        // Permanently delete
        await deleteCustomer({
          admin_password: password,
          customer_id: selectedCustomer.id,
        });
      } else {
        // Archive the customer (soft delete)
        await archiveCustomer({
          admin_password: password,
          status: "archived",
        });
      }
    } catch (error: any) {
      toast.error("Operation Failed", {
        description:
          error?.message || "Failed to process customer. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditCustomerModalOpen");
    setEditingCustomer(null);
  };

  const formatCNIC = (cnic: string) => {
    if (!cnic || cnic.length !== 13) return cnic;
    return `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", color: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", color: "bg-yellow-100 text-yellow-800" },
      archived: { label: "Archived", color: "bg-red-100 text-red-800" },
    }[status] || { label: status, color: "bg-gray-100 text-gray-800" };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRegularBadge = (isRegular: boolean) => {
    return isRegular ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Regular
      </span>
    ) : null;
  };

  const enhancedColumns = [
    ...customers_table_column_branch_admin,
    {
      label: "CNIC",
      key: "cnic",
      sortable: true,
      render: (value: string) => formatCNIC(value),
    },
    {
      label: "Regular",
      key: "is_regular",
      sortable: true,
      render: (value: boolean) => getRegularBadge(value),
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load customers</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeCustomers = customers.filter((c) => c.status !== "archived");
  const archivedCustomers = customers.filter((c) => c.status === "archived");

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Customer Management</h2>
          <p className="page-description">
            Manage your customer database and relationships
            {activeCustomers.length > 0 &&
              ` - ${activeCustomers.length} active customer${
                activeCustomers.length !== 1 ? "s" : ""
              }`}
            {archivedCustomers.length > 0 &&
              `, ${archivedCustomers.length} archived`}
          </p>
        </div>
        <Button onClick={handleAddCustomer} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={enhancedColumns}
        rows={customers as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
          </div>
        )}
      />

      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditCustomerModalOpen}
        onClose={handleCloseEditModal}
      >
        <CustomerForm
          mode={editingCustomer ? "edit" : "create"}
          initialData={
            editingCustomer
              ? {
                  ...editingCustomer,
                  is_regular: editingCustomer?.is_regular
                    ? true
                    : (false as any),
                }
              : ({
                  name: "",
                  address: "",
                  phone: "",
                  email: "",
                  cnic: "",
                  user_id: "",
                  branch_id: "",
                  is_regular: false,
                  status: "active",
                  id: "",
                } as any)
          }
          onSuccess={handleFormSuccess}
        />
      </Overlay>

      {/* Delete/Archive Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant={
          selectedCustomer?.status === "archived" ? "destructive" : "default"
        }
        open={modalState.isDeleteCustomerModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteCustomerModalOpen");
          setSelectedCustomer(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title={
          selectedCustomer?.status === "archived"
            ? "Permanently Delete Customer"
            : "Archive Customer"
        }
        description={
          selectedCustomer ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {selectedCustomer.status === "archived"
                  ? "You are about to PERMANENTLY DELETE the customer:"
                  : "You are about to ARCHIVE the customer:"}
              </p>
              <div
                className={`border rounded-lg p-3 ${
                  selectedCustomer.status === "archived"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User
                    className={`h-8 w-8 ${
                      selectedCustomer.status === "archived"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`font-semibold ${
                        selectedCustomer.status === "archived"
                          ? "text-red-800"
                          : "text-amber-800"
                      }`}
                    >
                      {selectedCustomer.name}
                    </p>
                    <p
                      className={`text-sm ${
                        selectedCustomer.status === "archived"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      {formatCNIC(selectedCustomer.cnic)} •{" "}
                      {selectedCustomer.phone}
                    </p>
                    {selectedCustomer.email && (
                      <p
                        className={`text-sm ${
                          selectedCustomer.status === "archived"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {selectedCustomer.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {selectedCustomer.status === "archived" ? (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="font-medium">
                        This action is irreversible
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>All customer data will be permanently deleted</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Purchase history and records will be lost</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Cannot be recovered under any circumstances</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Customer will be moved to archived status</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        Archived customers are hidden from active lists
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        All customer data and history will be preserved
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        Can be restored anytime by changing status back to
                        "Active"
                      </span>
                    </div>
                  </>
                )}
              </div>

              {selectedCustomer.status !== "archived" && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium">Note:</p>
                  <p className="text-sm text-blue-700">
                    Archiving is recommended over deletion as it preserves
                    customer history while removing them from active operations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>Loading customer information...</div>
          )
        }
        confirmText={
          deleteLoading || archiveLoading
            ? "Processing..."
            : selectedCustomer?.status === "archived"
            ? "Permanently Delete"
            : "Archive Customer"
        }
        cancelText="Cancel"
        passwordLabel="Enter your password to confirm this action"
      />
    </div>
  );
};

export default CustomersPage;
