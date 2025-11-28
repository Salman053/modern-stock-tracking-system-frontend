"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { useMutation } from "@/hooks/use-mutation";
import { IEmployee } from "@/types";
import {
  Calendar,
  DollarSign,
  User,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/currency-utils";

interface SalaryConfirmationModalProps {
  employee: IEmployee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalaryConfirmationModal = ({
  employee,
  isOpen = false,
  onClose,
  onSuccess,
}: SalaryConfirmationModalProps) => {
  const [description, setDescription] = useState<string>(
    employee?.name +
      " salary payment for " +
      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
  );
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);
  const { user } = useAuth();

  const {
    mutate: createSalaryPayment,
    error,
    loading: createLoading,
  } = useMutation(`${server_base_url}/salary`, {
    credentials: "include",
    method: "POST",
    onError: (error: any) => {
      const errorData = error?.data || {};
      console.log(error);
      if (errorData.error_code === "DUPLICATE_PAYMENT") {
        toast.error("Payment Already Exists", {
          description:
            error?.message ||
            "This employee has already been paid for this month.",
        });
        setExistingPayment({ amount: employee?.salary });
      } else if (errorData.error_code === "AMOUNT_EXCEEDS_SALARY") {
        toast.error("Amount Exceeds Salary", {
          description:
            error?.message || "Payment amount cannot exceed employee's salary.",
        });
      } else {
        toast.error("Payment Failed", {
          description:
            error?.message ||
            "Failed to process salary payment. Please try again.",
        });
      }
    },
    onSuccess: () => {
      toast.success("Salary Paid Successfully", {
        description: `${employee?.name}'s salary has been processed successfully.`,
      });
      onSuccess();
      onClose();
      setDescription("");
    },
  });

  useEffect(() => {
    if (isOpen && employee?.id) {
      checkExistingPayment();
    }
  }, [isOpen, employee?.id]);

  const checkExistingPayment = async () => {
    if (!employee?.id) return;

    setCheckingPayment(true);
    try {
      const currentDate = new Date();
      const response = await fetch(
        `${server_base_url}/salary?employee_id=${employee?.id}&month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setExistingPayment(result.data[0]);
      } else {
        setExistingPayment(null);
      }
    } catch (error) {
      console.error("Error checking existing payment:", error);
      setExistingPayment(null);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleConfirmPayment = async (password?: string) => {
    if (!employee || !user) return;

    if (existingPayment) {
      toast.error("Payment Already Exists", {
        description: "This employee has already been paid for this month.",
      });
      return;
    }

    const defaultDescription = `Monthly salary payment for ${new Date().toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    )}`;

    const payload = {
      employee_id: employee?.id,
      amount: employee?.salary,
      user_id: user?.id,
      branch_id: user?.branch_id,
      description: description.trim() || defaultDescription,
      date: new Date().toISOString().split("T")[0],
    };

    await createSalaryPayment(payload);
  };

  const getMonthYear = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getDefaultDescription = () => {
    return `Monthly salary payment for ${getMonthYear()}`;
  };

  const renderExistingPaymentWarning = () => {
    if (!existingPayment) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Payment Already Exists</p>
            <p className="text-sm text-red-700">
              This employee has already received a salary payment of{" "}
              {formatCurrency(existingPayment.amount)} for {getMonthYear()}.
            </p>
            <p className="text-sm text-red-600 mt-1">
              You cannot process duplicate payments for the same month.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ConfirmationDialog
      confirmationText="Confirm Payment"
      variant="default"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setDescription("");
        }
      }}
      onConfirm={handleConfirmPayment}
      title="Confirm Salary Payment"
      description={
        <div className="space-y-3">
          {renderExistingPaymentWarning()}

          <p className="font-medium text-gray-900">
            You are about to process salary payment for:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{employee?.name}</p>
                  <p className="text-sm text-green-700">
                    {employee?.designation}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Payment Amount
                  </p>
                  <p className="text-lg font-bold text-amber-900">
                    {formatCurrency(employee?.salary)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>This will create a permanent salary payment record</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Payment cannot be modified once processed</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Financial records will be updated accordingly</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder={getDefaultDescription()}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={!!existingPayment || createLoading}
            />
            {!existingPayment && (
              <p className="text-xs text-gray-500">
                Leave empty to use default description
              </p>
            )}
          </div>
        </div>
      }
      requiresConfirmation={!existingPayment}
      disabled={createLoading || !!existingPayment}
      confirmText={
        createLoading
          ? "Processing..."
          : existingPayment
          ? "Payment Already Exists"
          : "Confirm Payment"
      }
      cancelText="Close"
      passwordLabel="Enter your password to confirm payment"
    />
  );
};
