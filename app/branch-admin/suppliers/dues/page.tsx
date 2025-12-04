"use client";
import { SupplierDueForm } from "@/components/branch/add-supplier-dues-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import { PaymentForm } from "@/components/shared/payment-form";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { supplier_dues_table_column_branch_admin } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { ISupplierDue } from "@/types";
import { FilePenLine, Trash2, CreditCard, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SupplierDues = () => {
  const router = useRouter();
  const { toggleModal, modalState } = useModalState({
    isAddEditSupplierDueModalOpen: false,
    isDeleteSupplierDueModalOpen: false,
    isPaymentModalOpen: false,
  });

  const [selectedSupplierDue, setSelectedSupplierDue] =
    useState<ISupplierDue | null>(null);
  const [editingSupplierDue, setEditingSupplierDue] =
    useState<ISupplierDue | null>(null);

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/supplier-dues`,
    {
      credentials: "include",
      auto: true,
    }
  );

  // console.log(data);
  const { mutate: deleteSupplierDue, loading: deleteLoading } = useMutation(
    `${server_base_url}/supplier-dues/${selectedSupplierDue?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message ||
            "Failed to delete supplier due. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Supplier Due Deleted Successfully", {
          description: `Supplier due has been permanently deleted.`,
        });
        toggleModal("isDeleteSupplierDueModalOpen");
        setSelectedSupplierDue(null);
        refetch();
      },
    }
  );

  const supplierDues: ISupplierDue[] = data?.data || [];

  const options = [
    {
      label: "Make Payment",
      icon: <CreditCard size={12} />,
      onClick: (item: ISupplierDue) => {
        setEditingSupplierDue(item);
        setSelectedSupplierDue(item);

        toggleModal("isPaymentModalOpen");
      },
    },
    {
      label: "Payment History",
      icon: <History size={12} />,
      onClick: (item: ISupplierDue) => {
        router.push(`/branch-admin/suppliers/dues/history/${item.id}`);
      },
    },
    // {
    //   label: "Edit",
    //   icon: <FilePenLine size={12} />,
    //   onClick: (item: ISupplierDue) => {
    //     setEditingSupplierDue(item);
    //     toggleModal("isAddEditSupplierDueModalOpen");
    //   },
    // },
    // {
    //   label: "Delete",
    //   onClick: (item: ISupplierDue) => {
    //     setSelectedSupplierDue(item);
    //     toggleModal("isDeleteSupplierDueModalOpen");
    //     toast.warning(
    //       "Please carefully read the instructions before doing action"
    //     );
    //   },
    //   icon: <Trash2 size={16} />,
    // },
  ];

  const handleAddSupplierDue = () => {
    setEditingSupplierDue(null);
    toggleModal("isAddEditSupplierDueModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditSupplierDueModalOpen");
    setEditingSupplierDue(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedSupplierDue || !password) return;

    try {
      await deleteSupplierDue({
        admin_password: password,
        supplier_due_id: selectedSupplierDue.id,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.message || "Failed to delete supplier due. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditSupplierDueModalOpen");
    setEditingSupplierDue(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      partial: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Partial",
      },
      paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Paid",
      },
      overdue: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Overdue",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Cancelled",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getDueTypeBadge = (dueType: string) => {
    const typeConfig = {
      purchase: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Purchase",
      },
      credit: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Credit",
      },
      other: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Other",
      },
    };

    const config =
      typeConfig[dueType as keyof typeof typeConfig] || typeConfig.other;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const enhancedColumns = [
    ...supplier_dues_table_column_branch_admin,
    {
      label: "Remaining Amount",
      key: "remaining_amount",
      sortable: true,
      render: (value: number, row: ISupplierDue) => {
        const remaining = value || row.total_amount - (row.paid_amount || 0);
        const color = remaining > 0 ? "text-red-600" : "text-green-600";
        const bgColor = remaining > 0 ? "bg-red-50" : "bg-green-50";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${color} ${bgColor} border`}
          >
            Rs. {remaining}
          </span>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      label: "Due Type",
      key: "due_type",
      sortable: true,
      render: (value: string) => getDueTypeBadge(value),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load supplier dues</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate summary statistics
  // const totalDues = supplierDues.reduce((sum, due) => sum + due.total_amount, 0);
  // const totalPaid = supplierDues.reduce((sum, due) => sum + (due.paid_amount || 0), 0);
  // const totalRemaining = totalDues - totalPaid;
  // const overdueDues = supplierDues.filter(due =>
  //   due.status === 'overdue' ||
  //   (new Date(due.due_date) < new Date() && due.status !== 'paid')
  // ).length;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Supplier Dues Management</h2>
          <p className="page-description">
            Monitor and manage all supplier dues in your branch
            {supplierDues.length > 0 &&
              ` - ${supplierDues.length} due${
                supplierDues.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
        <Button onClick={handleAddSupplierDue} className="gap-2">
          <CreditCard className="h-4 w-4" />
          Add Due
        </Button>
      </div>

      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={enhancedColumns as any}
        rows={supplierDues as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
          </div>
        )}
      />

      {/* Add/Edit Supplier Due Modal */}
      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditSupplierDueModalOpen}
        onClose={handleCloseEditModal}
      >
        <SupplierDueForm
          mode={editingSupplierDue ? "edit" : "create"}
          initialData={
            editingSupplierDue ||
            ({
              supplier_id: "" as any,
              branch_id: "" as any,
              stock_movement_id: "" as any,
              due_date: new Date().toISOString().split("T")[0],
              total_amount: "" as any,
              paid_amount: "" as any,
              status: "pending",
              due_type: "purchase",
              description: "",
              id: "",
            } as any)
          }
          onSuccess={handleFormSuccess}
        />
      </Overlay>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteSupplierDueModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteSupplierDueModalOpen");
          setSelectedSupplierDue(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Supplier Due"
        description={
          selectedSupplierDue ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to delete the supplier due record:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      Due ID: #{selectedSupplierDue.id}
                    </p>
                    <p className="text-sm text-amber-700">
                      Amount: Rs. {selectedSupplierDue?.total_amount}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      Due Date:{" "}
                      {new Date(
                        selectedSupplierDue.due_date
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-amber-600">
                      Status: {getStatusBadge(selectedSupplierDue.status)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This action cannot be undone</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    All payment history related to this due will be permanently
                    deleted
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This may affect your financial reporting</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consider marking as cancelled instead of deleting</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium">Note:</p>
                <p className="text-sm text-blue-700">
                  If you want to keep the record for audit purposes but mark it
                  as inactive, consider updating the status to "Cancelled"
                  instead of deleting.
                </p>
              </div>
            </div>
          ) : (
            <div>Loading supplier due information...</div>
          )
        }
        confirmText={deleteLoading ? "Deleting..." : "Delete Due"}
        cancelText="Cancel"
        passwordLabel="Enter your password to confirm deletion"
      />
      <Overlay
        contentClassName="min-w-[60vw]"
        isOpen={modalState.isPaymentModalOpen}
        onClose={() => toggleModal("isPaymentModalOpen")}
      >
        <PaymentForm
          onSuccess={() => {
            refetch();
            setSelectedSupplierDue(null);
            toggleModal("isPaymentModalOpen");
          }}
          dueData={selectedSupplierDue as any}
        />
      </Overlay>
    </div>
  );
};

export default SupplierDues;
