"use client";
import { ProductForm } from "@/components/branch/add-product-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { products_table_column_branch_admin } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { IProduct } from "@/types";
import { FilePenLine, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ProductsPage = () => {
  const { toggleModal, modalState } = useModalState({
    isAddEditProductModalOpen: false,
    isDeleteProductModalOpen: false,
  });

  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/products?branch_id=${user?.branch_id}`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const { mutate: deleteProduct, loading: deleteLoading } = useMutation(
    `${server_base_url}/products/${selectedProduct?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message || "Failed to delete product. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Product Deleted Successfully", {
          description: `${selectedProduct?.name} has been permanently deleted.`,
        });
        toggleModal("isDeleteProductModalOpen");
        setSelectedProduct(null);
        refetch();
      },
    }
  );

  const products: IProduct[] = data?.data || [];

  const options = [
    {
      label: "Edit",
      icon: <FilePenLine size={12} />,
      onClick: (item: IProduct) => {
        setEditingProduct(item);
        toggleModal("isAddEditProductModalOpen");
      },
    },
    {
      label: "Delete",
      onClick: (item: IProduct) => {
        setSelectedProduct(item);
        toggleModal("isDeleteProductModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleAddProduct = () => {
    setEditingProduct(null);
    toggleModal("isAddEditProductModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditProductModalOpen");
    setEditingProduct(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedProduct || !password) return;

    try {
      await deleteProduct({
        admin_password: password,
        product_id: selectedProduct.id,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.message || "Failed to delete product. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditProductModalOpen");
    setEditingProduct(null);
  };

  const enhancedColumns = [
    ...products_table_column_branch_admin,
    {
      label: "Profit Margin",
      key: "profit_margin",
      sortable: true,
      render: (value: number) => {
        const margin = value || 0;
        const color =
          margin >= 30
            ? "text-green-600"
            : margin >= 15
              ? "text-yellow-600"
              : "text-red-600";
        const bgColor =
          margin >= 30
            ? "bg-green-100"
            : margin >= 15
              ? "bg-yellow-100"
              : "bg-red-100";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${color} ${bgColor}`}
          >
            Rs. {margin}
          </span>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load products</div>
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
          <h2 className="page-heading">Products in Your Branch</h2>
          <p className="page-description">
            Monitor and manage all the products in your branch
            {products.length > 0 &&
              ` - ${products.length} product${products.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Package className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={enhancedColumns}
        rows={products as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
          </div>
        )}
      />

      {/* Add/Edit Product Modal */}
      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditProductModalOpen}
        onClose={handleCloseEditModal}
      >
        <ProductForm
          mode={editingProduct ? "edit" : "create"}
          initialData={
            editingProduct ||
            ({
              company: "",
              description: "",
              name: "",
              purchase_price_per_meter: "",
              quantity: "",
              sales_price_per_meter: "",
              status: "active",
              type: "cotton",
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
        open={modalState.isDeleteProductModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteProductModalOpen");
          setSelectedProduct(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Product"
        description={
          selectedProduct ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to archive the product:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      {selectedProduct.name}
                    </p>
                    <p className="text-sm text-amber-700">
                      {selectedProduct.company} • {selectedProduct.type}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      Stock: {selectedProduct.quantity} units
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Product will be moved to archived status</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Archived products are hidden from active inventory
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>All product data and history will be preserved</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>No longer available for new sales or transactions</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium">Note:</p>
                <p className="text-sm text-blue-700">
                  You can restore this product anytime by updating its status
                  back to "Active" in the product management section.
                </p>
              </div>
            </div>
          ) : (
            <div>Loading product information...</div>
          )
        }
        confirmText={deleteLoading ? "Deleting..." : "Delete Product"}
        cancelText="Cancel"
        passwordLabel="Enter your password to confirm deletion"
      />
    </div>
  );
};

export default ProductsPage;
