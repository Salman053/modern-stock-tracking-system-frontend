"use client";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import {
  Trash2,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  FileText,
  Banknote,
  Smartphone,
  Wallet,
  RefreshCw,
  Edit,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import Overlay from "@/components/shared/Overlay";
import { PaymentForm } from "@/components/shared/payment-form";

interface IDuePayment {
  id: string;
  description: string;
  payment_date: string;
  user_id: string;
  branch_id: string;
  due_type: string;
  due_id: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

const PAYMENT_METHOD_CONFIG = {
  cash: {
    label: "Cash",
    icon: Banknote,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  bank_transfer: {
    label: "Bank Transfer",
    icon: CreditCard,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  digital_wallet: {
    label: "Digital Wallet",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  cheque: {
    label: "Cheque",
    icon: Wallet,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

const DuePaymentHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleModal, modalState } = useModalState({
    isDeletePaymentModalOpen: false,
    isEditPaymentModalOpen: false,
  });

  const [selectedPayment, setSelectedPayment] = useState<IDuePayment | null>(
    null
  );

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/due-payments/?due_id=${id}`,
    {
      credentials: "include",
      auto: true,
    }
  );
  const {
    data: supplier_due,
    error: supplier_due_error,
    loading: supplier_due_loading,
    refetch: supplier_due_refetch,
  } = useFetch(`${server_base_url}/supplier-dues/${id}`, {
    credentials: "include",
    auto: true,
  });

  //
  const { mutate: deletePayment, loading: deleteLoading } = useMutation(
    `${server_base_url}/due-payments/${selectedPayment?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message ||
            "Failed to delete payment record. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Payment Record Deleted Successfully", {
          description: `Payment record has been permanently deleted.`,
        });
        toggleModal("isDeletePaymentModalOpen");
        setSelectedPayment(null);
        refetch();
      },
    }
  );

  const payments: IDuePayment[] = data?.data || [];

  const getPaymentMethodBadge = (method: string) => {
    const config = PAYMENT_METHOD_CONFIG[
      method as keyof typeof PAYMENT_METHOD_CONFIG
    ] || {
      label: method,
      icon: CreditCard,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDueTypeBadge = (dueType: string) => {
    const typeConfig = {
      supplier: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Supplier",
      },
      customer: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Customer",
      },
      other: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Other",
      },
    };

    const config =
      typeConfig[dueType as keyof typeof typeConfig] || typeConfig.other;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const columns = [
    {
      label: "ID",
      key: "id",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          #{value}
        </span>
      ),
    },
    {
      label: "Description",
      key: "description",
      sortable: true,
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={value}>
            {value.slice(0, 30)}...
          </p>
        </div>
      ),
    },
    {
      label: "Amount",
      key: "amount",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-xs ">
          Rs. {Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      label: "Payment Method",
      key: "payment_method",
      sortable: true,
      render: (value: string) => getPaymentMethodBadge(value),
    },
    {
      label: "Due Type",
      key: "due_type",
      sortable: true,
      render: (value: string) => getDueTypeBadge(value),
    },
    {
      label: "Due ID",
      key: "due_id",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs text-gray-600">#{value}</span>
      ),
    },
    {
      label: "Payment Date",
      key: "payment_date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3 text-gray-500" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-500">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
  ];

  const options = [
    {
      label: "Edit",
      onClick: (item: IDuePayment) => {
        setSelectedPayment(item);
        toggleModal("isEditPaymentModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Edit size={16} />,
    },
    {
      label: "Delete",
      onClick: (item: IDuePayment) => {
        setSelectedPayment(item);
        toggleModal("isDeletePaymentModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedPayment || !password) return;

    try {
      await deletePayment({
        admin_password: password,
        payment_id: selectedPayment.id,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.message ||
          "Failed to delete payment record. Please try again.",
      });
    }
  };

  // Calculate summary statistics
  const totalPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const cashPayments = payments.filter(
    (p) => p.payment_method === "cash"
  ).length;
  const bankTransfers = payments.filter(
    (p) => p.payment_method === "bank_transfer"
  ).length;
  const digitalWallets = payments.filter(
    (p) => p.payment_method === "digital_wallet"
  ).length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">
          Failed to load payment history
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="page-heading">Due Payment History</h2>
          <p className="page-description">
            View all payment transactions made against supplier and customer
            dues
            {payments.length > 0 &&
              ` - ${payments.length} payment${
                payments.length !== 1 ? "s" : ""
              } recorded`}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-green-800">
                Rs. {totalPayments.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Cash Payments</p>
              <p className="text-2xl font-bold text-blue-800">{cashPayments}</p>
            </div>
            <Banknote className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">
                Bank Transfers
              </p>
              <p className="text-2xl font-bold text-purple-800">
                {bankTransfers}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">
                Digital Wallets
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {digitalWallets}
              </p>
            </div>
            <Smartphone className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div> */}

      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={columns as any}
        rows={payments as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
          </div>
        )}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeletePaymentModalOpen}
        onOpenChange={() => {
          toggleModal("isDeletePaymentModalOpen");
          setSelectedPayment(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Payment Record"
        description={
          selectedPayment ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to delete this payment record:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    <p className="font-semibold text-amber-800">
                      Payment ID: #{selectedPayment.id}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-amber-700 font-medium">
                        Amount:
                      </span>
                      <p className="text-amber-900 font-semibold">
                        Rs. {Number(selectedPayment.amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">
                        Method:
                      </span>
                      <p className="text-amber-900">
                        {getPaymentMethodBadge(selectedPayment.payment_method)}
                      </p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">
                        Due ID:
                      </span>
                      <p className="text-amber-900 font-mono">
                        #{selectedPayment.due_id}
                      </p>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Date:</span>
                      <p className="text-amber-900">
                        {new Date(
                          selectedPayment.payment_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-200">
                    <span className="text-amber-700 font-medium text-sm">
                      Description:
                    </span>
                    <p className="text-amber-900 text-sm mt-1">
                      {selectedPayment.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-700 font-medium">
                    This action cannot be undone
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>The payment record will be permanently deleted</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>The associated due's paid amount will be adjusted</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    This may affect your financial reporting and audit trail
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>Loading payment information...</div>
          )
        }
        confirmText={deleteLoading ? "Deleting..." : "Delete Payment"}
        cancelText="Cancel"
        passwordLabel="Enter your password to confirm deletion"
      />
      <Overlay
        isOpen={modalState.isEditPaymentModalOpen}
        onClose={() => toggleModal("isEditPaymentModalOpen")}
      >
        <PaymentForm
          dueData={supplier_due?.data as any}
          mode="edit"
          initialData={selectedPayment as any}
        />
      </Overlay>
    </div>
  );
};

export default DuePaymentHistory;
