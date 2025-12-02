"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IBranchDue } from "@/types";
import { useFetch } from "@/hooks/use-fetch";
import { server_base_url } from "@/constant/server-constants";
import Overlay from "@/components/shared/Overlay";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import ReusablePopover from "@/components/shared/ReusablePopover";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  DollarSign,
  FilePenLine,
  History,
  Trash2,
  TrendingUp,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Percent,
} from "lucide-react";
import { PaymentForm } from "@/components/shared/payment-form";
import { branch_dues_columns } from "@/constant/branch-admin-contants";

const BranchDues = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const { user } = useAuth();

  const { toggleModal, modalState } = useModalState({
    isAddBranchDueModalOpen: false,
    isDeleteBranchDueModalOpen: false,
    isMakePaymentModalOpen: false,
    isViewHistoryModalOpen: false,
    isSummaryViewOpen: false,
  });

  const [selectedBranchDue, setSelectedBranchDue] = useState<IBranchDue | null>(
    null
  );
  const [dues, setDues] = useState<IBranchDue[] | []>([]);

  // Fetch branch dues
  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/branch-dues/${id}}`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const options = [
    {
      label: "Make Payment",
      icon: <CreditCard size={12} />,
      onClick: (item: IBranchDue) => {
        setSelectedBranchDue(item);
        toggleModal("isMakePaymentModalOpen");
      },
    },
    {
      label: "Payment History",
      icon: <History size={12} />,
      onClick: (item: IBranchDue) => {
        router.push(`/branch-admin/branches/dues/history/${item.id}`);
      },
    },
  ];

  const handlePaymentSuccess = () => {
    toggleModal("isMakePaymentModalOpen");
    setSelectedBranchDue(null);
    refetch();
    // if (viewType === "summary") refetchSummary();
    // if (filters.overdue_only) refetchOverdue();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load branch dues</div>
        <button
          onClick={() => {
            refetch();
          }}
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
        <div>
          <h2 className="page-heading">Branch Dues Management</h2>
          <p className="page-description">
            Manage all dues and payments for your branch
          </p>
        </div>
      </div>

      {data?.data && (
        <DataTable
          columns={branch_dues_columns as any}
          rows={data.data}
          loading={loading}
          selectable={false}
          pagination={false}
          actions={(row) => <ReusablePopover actions={options} rowData={row} />}
        />
      )}
      <Overlay
        isOpen={modalState.isMakePaymentModalOpen}
        onClose={() => {
          toggleModal("isMakePaymentModalOpen");
          setSelectedBranchDue(null);
        }}
      >
        {selectedBranchDue && (
          <PaymentForm
            dueData={{ ...selectedBranchDue, due_type: "branch" }}
            initialData={{
              amount: Number(selectedBranchDue.remaining_amount) || 0,
              payment_date: new Date().toISOString().split("T")[0],
              payment_method: "cash",
              description: "",
            }}
            mode="create"
            onSuccess={handlePaymentSuccess}
            key={selectedBranchDue.id}
          />
        )}
      </Overlay>
    </div>
  );
};

export default BranchDues;
