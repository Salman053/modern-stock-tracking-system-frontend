"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Plus,
  Edit,
  Info,
  CloudCog,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useAuth } from "@/hooks/use-auth";
import { IBranchDue, ISupplierDue } from "@/types";
import { paymentSchema, PaymentSchemaType } from "@/schema/payment-schema";

interface PaymentFormProps {
  mode?: "create" | "edit";
  initialData?: PaymentSchemaType & { id?: string };
  dueData?: ISupplierDue | IBranchDue;
  onSuccess?: () => void;
}

const PAYMENT_METHOD_CONFIG = {
  cash: {
    label: "Cash",
    description: "Physical cash payment",
    icon: Banknote,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  bank_transfer: {
    label: "Bank Transfer",
    description: "Electronic bank transfer",
    icon: CreditCard,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  digital_wallet: {
    label: "Digital Wallet",
    description: "Mobile payment or e-wallet",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  cheque: {
    label: "Cheque",
    description: "Physical cheque payment",
    icon: Wallet,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

export function PaymentForm({
  mode = "create",
  initialData,
  dueData,
  onSuccess,
}: PaymentFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<PaymentSchemaType | null>(
    null
  );

  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { data, error, loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/due-payments/${initialData?.id}`
      : `${server_base_url}/due-payments`,
    {
      credentials: "include",
      method: isEdit ? "PATCH" : "POST",
      onError: (error) => {
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${
              isEdit ? "update" : "create"
            } payment. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Payment Updated Successfully"
            : "Payment Created Successfully",
          {
            description: `Payment has been ${
              isEdit ? "updated" : "recorded"
            } successfully.`,
          }
        );

        form.reset();
        onSuccess?.();
      },
    }
  );

  //

  const remainingAmount = dueData
    ? Number(dueData.remaining_amount) ||
      Number(dueData.total_amount) - Number(dueData.paid_amount || "0")
    : 0;

  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(paymentSchema as any),
    defaultValues: (initialData && {
      amount: initialData.amount,
      payment_date: initialData.payment_date,
      description: initialData.description,
      payment_method: initialData.payment_method,
    }) || {
      description: dueData
        ? `Payment for ${dueData.supplier_name} - Due #${dueData.id}`
        : "Payment transaction",
      payment_date: new Date().toISOString().split("T")[0],
      amount: "" as any,
      payment_method: "cash",
    },
  });

  const paymentAmount = form.watch("amount") || 0;
  const description = form.watch("description");

  React.useEffect(() => {
    if (dueData && paymentAmount > 0) {
      const baseDescription = `Payment of Rs. ${paymentAmount} for ${dueData.supplier_name} - Due #${dueData.id}`;

      if (
        !description ||
        description.startsWith("Payment of Rs.") ||
        description ===
          `Payment for ${dueData.supplier_name} - Due #${dueData.id}`
      ) {
        form.setValue("description", baseDescription);
      }
    }
  }, [paymentAmount, dueData, description, form]);

  const onSubmit = (data: PaymentSchemaType) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (confirmationText?: string) => {
    if (!formData || !dueData) return;

    try {
      const payload = {
        ...formData,
        user_id: user?.id,
        branch_id: user?.branch_id,
        due_id: dueData.id,
        due_type: dueData.due_type || "",
      };

      await mutate(payload);
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${
            isEdit ? "update" : "create"
          } payment. Please try again.`,
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  const getPaymentMethodDescription = (
    method: keyof typeof PAYMENT_METHOD_CONFIG
  ) => {
    return PAYMENT_METHOD_CONFIG[method]?.description || "";
  };

  const handleFullPaymentClick = () => {
    if (dueData) {
      form.setValue("amount", remainingAmount);
    }
  };

  const handleHalfPaymentClick = () => {
    if (dueData) {
      form.setValue("amount", Math.floor(remainingAmount / 2));
    }
  };

  React.useEffect(() => {
    // Only auto-generate in create mode
    if (!isEdit && dueData && paymentAmount > 0) {
      const baseDescription = `Payment of Rs. ${paymentAmount} for ${
        dueData.supplier_id ? dueData.supplier_name : "branch"
      }  - Due #${dueData.id}`;

      if (
        !description ||
        description.startsWith("Payment of Rs.") ||
        description ===
          `Payment for ${
            dueData.supplier_id ? dueData.supplier_name : "branch"
          } - Due #${dueData.id}`
      ) {
        form.setValue("description", baseDescription);
      }
    }
  }, [paymentAmount, dueData, description, form, isEdit]);

  return (
    <>
      <Card className="w-full   mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Payment" : "Record Payment"}
                <Badge variant="outline" className="ml-2 text-sm">
                  Due #{dueData?.id}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {dueData?.supplier_name} - Record payment against supplier due
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Due Information & Guide */}
            <div className="space-y-6">
              {/* Due Information Card */}
              {dueData && (
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Due Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">
                          Total Amount:
                        </span>
                        <span className="font-bold text-lg">
                          Rs. {Number(dueData.total_amount) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700 font-medium">
                          Already Paid:
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          Rs. {Number(dueData.paid_amount || "0")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-red-700 font-medium">
                          Remaining Amount:
                        </span>
                        <span className="font-bold text-lg text-red-600">
                          Rs. {Number(remainingAmount) || 0}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className={`space-y-3 ${mode === "edit" && "hidden"}`}>
                      <p className="text-sm font-medium text-gray-600">
                        Quick Amount:
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleHalfPaymentClick}
                          className="flex-1"
                        >
                          Half Amount
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleFullPaymentClick}
                          className="flex-1"
                        >
                          Full Amount
                        </Button>
                      </div>
                    </div>

                    {/* Payment Summary Preview */}
                    {paymentAmount > 0 && (
                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Payment Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-700">
                                Payment Amount:
                              </span>
                              <span className="font-bold text-green-800">
                                Rs. {paymentAmount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">
                                New Remaining:
                              </span>
                              <span
                                className={`font-bold ${
                                  Math.abs(
                                    Number(remainingAmount - paymentAmount)
                                  ) > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                Rs.{" "}
                                {(remainingAmount - paymentAmount).toFixed(2)}
                              </span>
                            </div>
                            {paymentAmount >= remainingAmount && (
                              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-center">
                                <p className="text-green-800 font-semibold text-sm">
                                  ✅ This payment will clear the entire due!
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Information Notice */}
                    {isEdit ? (
                      <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-orange-900">
                            <p className="font-semibold mb-2 text-base">
                              ⚠️ Edit Mode - Important Information:
                            </p>
                            <ul className="space-y-1.5">
                              <li>
                                <strong>Amount Changes:</strong> If you modify
                                the payment amount, the system will
                                automatically recalculate the due's paid and
                                remaining amounts
                              </li>
                              <li>
                                <strong>Validation:</strong> New amount cannot
                                cause negative paid amount or exceed the total
                                due amount
                              </li>
                              <li>
                                <strong>Status Update:</strong> Due status
                                (Pending/Partial/Paid) will be automatically
                                updated based on the new payment amount
                              </li>
                              <li>
                                <strong>Editable Fields:</strong> Description,
                                payment date, amount, and payment method can be
                                updated
                              </li>
                              <li>
                                <strong>Transaction Safety:</strong> All changes
                                are processed in a database transaction to
                                ensure data consistency
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-2">
                              Automatic Due Update:
                            </p>
                            <ul className="space-y-1">
                              <li>
                                • Paid amount will be updated automatically
                              </li>
                              <li>• Remaining amount will be recalculated</li>
                              <li>• Due status will change based on payment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Payment Form */}
            <div className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Amount Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Payment Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (Rs.)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value)
                                  )
                                }
                                value={field.value || ""}
                                className="text-lg font-semibold h-12"
                              />
                            </FormControl>
                            {dueData && (
                              <FormDescription>
                                Enter payment amount. Remaining due: Rs.{" "}
                                {remainingAmount.toFixed(2)}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Payment Details */}
                  <Card>
                    <CardHeader className="">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="payment_method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(PAYMENT_METHOD_CONFIG).map(
                                    ([value, config]) => {
                                      const IconComponent = config.icon;
                                      return (
                                        <SelectItem key={value} value={value}>
                                          <div className="flex items-center gap-2">
                                            <IconComponent className="h-4 w-4" />
                                            <div className="flex flex-col">
                                              <span className="font-medium capitalize">
                                                {config.label}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {config.description}
                                              </span>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      );
                                    }
                                  )}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {getPaymentMethodDescription(
                                  field.value as keyof typeof PAYMENT_METHOD_CONFIG
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="payment_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormDescription>
                                Date when payment was made
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <textarea
                                placeholder="Enter payment description or purpose"
                                {...field}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Payment description will be auto-generated based
                              on amount
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={loading}
                      className="min-w-24"
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !paymentAmount}
                      className="min-w-32 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isEdit ? "Updating..." : "Processing..."}
                        </>
                      ) : (
                        <>
                          {isEdit ? (
                            <Edit className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {isEdit ? "Update Payment" : "Record Payment"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={(password: any) => handleConfirm(password)}
        title={isEdit ? "Confirm Payment Update" : "Confirm Payment Recording"}
        description={
          formData && dueData ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are about to {isEdit ? "update" : "record"} a payment for{" "}
                <strong>{dueData.supplier_name}</strong>. Please review the
                details below:
              </p>

              {isEdit && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Edit Mode Notice:
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Updating this payment will recalculate the due's paid
                    amount, remaining amount, and status. The system will
                    validate that the new amount doesn't exceed the total due.
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Amount:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    Rs. {formData.amount?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <Badge
                    variant="outline"
                    className={
                      PAYMENT_METHOD_CONFIG[
                        formData.payment_method as keyof typeof PAYMENT_METHOD_CONFIG
                      ]?.color
                    }
                  >
                    {
                      PAYMENT_METHOD_CONFIG[
                        formData.payment_method as keyof typeof PAYMENT_METHOD_CONFIG
                      ]?.label
                    }
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-medium">
                    {new Date(formData.payment_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="border-t pt-3 mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      New Due Status:
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        formData.amount >= remainingAmount
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {formData.amount >= remainingAmount ? "Paid" : "Partial"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      New Remaining:
                    </span>
                    <span
                      className={`font-semibold ${
                        remainingAmount - formData.amount > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Rs. {(remainingAmount - formData.amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {formData.amount >= remainingAmount && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                    <p className="text-green-800 text-sm font-medium text-center">
                      ✅ This payment will clear the entire due amount!
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  Automatic Due Updates:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Paid amount: +Rs. {formData.amount?.toFixed(2)}</li>
                  <li>
                    • Remaining amount: -Rs. {formData.amount?.toFixed(2)}
                  </li>
                  <li>• Due status will be updated automatically</li>
                </ul>
              </div>
            </div>
          ) : (
            "Loading payment details..."
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating..."
              : "Recording..."
            : "Confirm Payment"
        }
        confirmationText="Add Payment"
        confirmationPlaceholder="Please Type Add Payment for confirmation"
        requiresConfirmation
      />
    </>
  );
}
