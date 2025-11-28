"use client";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { SalaryConfirmationModal } from "@/components/shared/salary-confirmation";
import { Button } from "@/components/ui/button";
import { salary_payments_table_column_branch_admin } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { formatCurrency } from "@/lib/currency-utils";
import { IEmployee, ISalaryPayment } from "@/types";
import {
  DollarSign,
  Calendar,
  User,
  CreditCard,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SalaryPayments = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleModal, modalState, closeModal } = useModalState({
    isPaySalaryModalOpen: false,
    isDeleteSalaryPaymentModalOpen: false,
  });

  const [selectedSalaryPayment, setSelectedSalaryPayment] =
    useState<ISalaryPayment | null>(null);

  // Fetch specific employee data
  const {
    data: employeeData,
    loading: employeeLoading,
    refetch: refetchEmployee,
  } = useFetch(`${server_base_url}/employees/${id}`, {
    credentials: "include",
    auto: true,
  });

  const {
    data: paymentsData,

    error: paymentsError,
    loading: paymentsLoading,
    refetch: refetchPayments,
  } = useFetch(`${server_base_url}/salary`, {
    credentials: "include",
    auto: true,
  });

  const { mutate: deleteSalaryPayment, loading: deleteLoading } = useMutation(
    `${server_base_url}/salary/${selectedSalaryPayment?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message ||
            "Failed to delete salary payment. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Salary Payment Deleted Successfully", {
          description: `Salary payment record has been permanently deleted.`,
        });
        toggleModal("isDeleteSalaryPaymentModalOpen");
        setSelectedSalaryPayment(null);
        refetchPayments();
      },
    }
  );

  const employee: IEmployee = employeeData?.data;
  const salaryPayments: ISalaryPayment[] = paymentsData?.data || [];

  const handlePaySalary = () => {
    toggleModal("isPaySalaryModalOpen");
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedSalaryPayment || !password) return;

    try {
      await deleteSalaryPayment({
        admin_password: password,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.message ||
          "Failed to delete salary payment. Please try again.",
      });
    }
  };

  const handleClosePayModal = () => {
    toggleModal("isPaySalaryModalOpen");
    setSelectedSalaryPayment(null);
  };

  const handleBackToEmployees = () => {
    router.back();
  };

  if (employeeLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading employee information...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Employee not found</div>
        <Button onClick={handleBackToEmployees}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col  ">
          <h1 className="page-heading">{employee.name}</h1>
          <p className="page-description capitalize">
            {employee.designation} • Salary Payments history
          </p>
        </div>

        <Button
          onClick={handlePaySalary}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Pay Salary
        </Button>
      </div>

      {/* Employee Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.designation}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee ID:</span>
              <span className="font-medium">{employee.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium">{employee.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{employee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  employee.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {employee.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Salary Information
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Monthly Salary:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(employee.salary || 0, {
                  notation: "standard",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employment Type:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  employee.is_permanent
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {employee.is_permanent ? "Permanent" : "Contract"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Payments:</span>
              <span className="font-medium">{salaryPayments.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Payment Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  salaryPayments.reduce(
                    (sum, payment) => sum + (Number(payment.amount) || 0),
                    0
                  ),
                  {
                    notation: "compact",
                  }
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Payment:</span>
              <span className="font-medium">
                {salaryPayments.length > 0 && salaryPayments[0].date
                  ? new Date(salaryPayments[0].date).toLocaleDateString()
                  : "No payments"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Count:</span>
              <span className="font-medium">{salaryPayments.length}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Salary Payment History
          </h2>
          <p className="text-sm text-gray-600">
            All salary payments made to {employee.name}
            {salaryPayments.length > 0 &&
              ` - ${salaryPayments.length} payment${
                salaryPayments.length !== 1 ? "s" : ""
              } recorded`}
          </p>
        </div>

        <DataTable
          selectable={false}
          defaultItemsPerPage={10}
          // pagination={false}
          columns={salary_payments_table_column_branch_admin as any}
          rows={salaryPayments as any}
          loading={paymentsLoading}
          actions={(row) => (
            <>
              <Button
                size={"sm"}
                onClick={() => {
                  setSelectedSalaryPayment(row as ISalaryPayment);
                  toggleModal("isDeleteSalaryPaymentModalOpen");
                }}
                variant="destructive"
              >
                Delete
              </Button>
            </>
          )}
        />
      </div>
      <SalaryConfirmationModal
        isOpen={modalState.isPaySalaryModalOpen}
        onClose={handleClosePayModal}
        employee={employee}
        onSuccess={() => {
          closeModal("isPaySalaryModalOpen");
          setSelectedSalaryPayment(null);
          refetchPayments();
        }}
      />
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteSalaryPaymentModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteSalaryPaymentModalOpen");
          setSelectedSalaryPayment(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Salary Payment"
        description={
          selectedSalaryPayment ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to delete the salary payment record:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      Amount: Rs.{" "}
                      {selectedSalaryPayment.amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-amber-700">
                      Date:{" "}
                      {new Date(
                        selectedSalaryPayment.date
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-amber-600">
                      Description: {selectedSalaryPayment.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Salary payment record will be permanently deleted</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This action cannot be undone</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Financial records will be updated</span>
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
    </div>
  );
};

export default SalaryPayments;
