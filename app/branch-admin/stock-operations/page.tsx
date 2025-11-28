"use client";
import { StockMovementForm } from "@/components/branch/add-stock-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { stock_movements_columns } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { IStockMovement } from "@/types";
import { FilePenLine, Trash2, Package, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const StockOperation = () => {
  const { user } = useAuth();
  const { toggleModal, modalState } = useModalState({
    isAddEditStockModalOpen: false,
    isDeleteStockModalOpen: false,
  });

  const [selectedMovement, setSelectedMovement] =
    useState<IStockMovement | null>(null);
  const [editingMovement, setEditingMovement] = useState<IStockMovement | null>(
    null
  );

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/stocks?branch_id=${user?.branch_id}`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const { mutate: deleteStockMovement, loading: deleteLoading } = useMutation(
    `${server_base_url}/stocks/${selectedMovement?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message ||
            "Failed to delete stock movement. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Stock Movement Cancelled Successfully", {
          description: `Stock movement has been cancelled successfully.`,
        });
        toggleModal("isDeleteStockModalOpen");
        setSelectedMovement(null);
        refetch();
      },
    }
  );

  const stockMovements: IStockMovement[] = data?.data || [];

  const options = [
    {
      label: "Edit",
      icon: <FilePenLine size={16} />,
      onClick: (item: IStockMovement) => {
        setEditingMovement(item);
        toggleModal("isAddEditStockModalOpen");
      },
    },
    {
      label: "Cancel",
      onClick: (item: IStockMovement) => {
        setSelectedMovement(item);
        toggleModal("isDeleteStockModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleAddStockMovement = () => {
    setEditingMovement(null);
    toggleModal("isAddEditStockModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditStockModalOpen");
    setEditingMovement(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedMovement || !password) return;

    try {
      await deleteStockMovement({
        admin_password: password,
      });
    } catch (error: any) {
      toast.error("Cancellation Failed", {
        description:
          error?.message ||
          "Failed to cancel stock movement. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditStockModalOpen");
    setEditingMovement(null);
  };

  const getMovementTypeBadge = (type: string) => {
    const config = {
      arrival: { label: "Arrival", color: "bg-green-100 text-green-800" },
      dispatch: { label: "Dispatch", color: "bg-blue-100 text-blue-800" },
      transfer_in: {
        label: "Transfer In",
        color: "bg-purple-100 text-purple-800",
      },
      transfer_out: {
        label: "Transfer Out",
        color: "bg-orange-100 text-orange-800",
      },
      adjustment: {
        label: "Adjustment",
        color: "bg-yellow-100 text-yellow-800",
      },
    }[type];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          config?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {config?.label || type}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    }[status];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          config?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {config?.label || status}
      </span>
    );
  };

  const enhancedColumns = [
    ...stock_movements_columns,
    {
      label: "Movement Type",
      key: "movement_type",
      sortable: true,
      render: (value: string) => getMovementTypeBadge(value),
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      label: "Total Amount",
      key: "total_amount",
      sortable: true,
      render: (value: number) => `Rs. ${value?.toLocaleString()}`,
    },
    {
      label: "Paid Amount",
      key: "paid_amount",
      sortable: true,
      render: (value: number) => `Rs. ${value?.toLocaleString()}`,
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">
          Failed to load Stock Movement History
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Stock Movements of your branch</h2>
          <p className="page-description">
            Monitor and manage all stock movements in your branch
            {stockMovements.length > 0 &&
              ` - ${stockMovements.length} movement${
                stockMovements.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
        <Button onClick={handleAddStockMovement} className="gap-2">
          <Truck className="h-4 w-4" />
          Add Stock Movement
        </Button>
      </div>

      {stockMovements.length === 0 && !loading ? (
        <div className="text-center py-12 border rounded-lg">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Stock Movements Found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by recording your first stock movement.
          </p>
          <Button onClick={handleAddStockMovement}>
            Record First Movement
          </Button>
        </div>
      ) : (
        <DataTable
          selectable={false}
          defaultItemsPerPage={10}
          pagination={true}
          columns={enhancedColumns}
          rows={stockMovements as any}
          loading={loading}
          actions={(row: any) => (
            <div className="flex gap-2 justify-center">
              <ReusablePopover actions={options as any} rowData={row} />
            </div>
          )}
        />
      )}

      {/* Add/Edit Stock Movement Modal */}
      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditStockModalOpen}
        onClose={handleCloseEditModal}
      >
        <StockMovementForm
          mode={editingMovement ? "edit" : "create"}
          initialData={
            editingMovement
              ? {
                  ...editingMovement,
                  product_id: Number(editingMovement.product_id),
                  supplier_id: editingMovement.supplier_id
                    ? Number(editingMovement.supplier_id)
                    : undefined,
                  reference_branch_id: editingMovement.reference_branch_id
                    ? Number(editingMovement.reference_branch_id)
                    : undefined,
                  quantity: Number(editingMovement.quantity),
                  paid_amount: Number(editingMovement.paid_amount),
                  total_amount: Number(editingMovement.total_amount),
                  unit_price_per_meter: Number(
                    editingMovement.unit_price_per_meter
                  ),
                  auto_update_product: editingMovement.auto_update_product
                    ? true
                    : false,
                }
              : ({
                  auto_update_product: true,
                  date: new Date().toISOString().split("T")[0],
                  movement_type: "arrival",
                  product_id: 0,
                  quantity: 0,
                  total_amount: 0,
                  unit_price_per_meter: 0,
                  id: "",
                  notes: "",
                  paid_amount: 0,
                  reference_branch_id: undefined,
                  supplier_id: undefined,
                } as any)
          }
          onSuccess={handleFormSuccess}
        />
      </Overlay>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteStockModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteStockModalOpen");
          setSelectedMovement(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Cancel Stock Movement"
        description={
          selectedMovement ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to cancel the stock movement:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      {selectedMovement.movement_type?.toUpperCase()} -{" "}
                      {selectedMovement.product_name}
                    </p>
                    <p className="text-sm text-amber-700">
                      Quantity: {selectedMovement.quantity} units
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      Amount: Rs.{" "}
                      {selectedMovement.total_amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-amber-600">
                      Date:{" "}
                      {new Date(selectedMovement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Stock movement will be marked as cancelled</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Product stock quantities will be reverted if auto-update was
                    enabled
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Related due records will be cancelled</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Financial records will be updated accordingly</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium">Note:</p>
                <p className="text-sm text-blue-700">
                  This action will reverse all automatic updates made by this
                  stock movement. Cancelled movements are preserved in records
                  for audit purposes.
                </p>
              </div>
            </div>
          ) : (
            <div>Loading stock movement information...</div>
          )
        }
        confirmText={deleteLoading ? "Cancelling..." : "Cancel Movement"}
        cancelText="Keep Movement"
        passwordLabel="Enter your admin password to confirm cancellation"
      />
    </div>
  );
};

export default StockOperation;
