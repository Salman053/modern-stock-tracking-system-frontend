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
  Calendar,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Edit,
  Plus,
  Hash,
  CreditCard,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/hooks/use-auth";
import {
  supplierDueSchema,
  SupplierDueSchemaType,
} from "@/schema/supplier-dues-schema";
import { IStockMovement, ISupplier } from "@/types";

interface SupplierDueFormProps {
  mode?: "create" | "edit";
  initialData?: SupplierDueSchemaType & { id?: string };
  onSuccess?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    description: "Payment is due and not yet paid",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  partial: {
    label: "Partial",
    description: "Partial payment has been made",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  paid: {
    label: "Paid",
    description: "Payment has been fully completed",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  overdue: {
    label: "Overdue",
    description: "Payment is past the due date",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    description: "Due has been cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

const DUE_TYPE_CONFIG = {
  purchase: {
    label: "Purchase",
    description: "Due from product purchases",
  },
  credit: {
    label: "Credit",
    description: "Credit-based due",
  },
  other: {
    label: "Other",
    description: "Other types of dues",
  },
};

export function SupplierDueForm({
  mode = "create",
  initialData,
  onSuccess,
}: SupplierDueFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<SupplierDueSchemaType | null>(
    null
  );

  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/supplier-dues/${initialData?.id}`
      : `${server_base_url}/supplier-dues`,
    {
      credentials: "include",
      method: isEdit ? "PATCH" : "POST",
      onError: (error) => {
        console.log(error);
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${
              isEdit ? "update" : "create"
            } supplier due. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Supplier Due Updated Successfully"
            : "Supplier Due Created Successfully",
          {
            description: `Supplier due has been ${
              isEdit ? "updated" : "created"
            } successfully.`,
          }
        );

        form.reset();
        onSuccess?.();
      },
    }
  );

  // Clear supplier when stock movement is cleared

  // Fetch suppliers for the select dropdown
  const { data: suppliers, loading: suppliersLoading } = useFetch(
    `${server_base_url}/suppliers`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  // Fetch stock movements for the select dropdown
  const { data: stockMovements, loading: stockMovementsLoading } = useFetch(
    `${server_base_url}/stocks`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  const form = useForm<SupplierDueSchemaType>({
    resolver: zodResolver(supplierDueSchema as any),
    defaultValues: initialData || {
      supplier_id: "" as any,
      stock_movement_id: "" as any,
      due_date: "",
      total_amount: "" as any,
      paid_amount: "" as any,
      status: "pending",
      due_type: "purchase",
      description: "",
    },
  });

  const onSubmit = (data: SupplierDueSchemaType) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (password: string) => {
    if (!formData || !password) return;

    try {
      await mutate({
        ...formData,
        user_id: user?.id,
        admin_password: password,
        branch_id: user?.branch_id,
      });
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${
            isEdit ? "update" : "create"
          } supplier due. Please try again.`,
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  const getStatusDescription = (status: keyof typeof STATUS_CONFIG) => {
    return STATUS_CONFIG[status]?.description || "";
  };

  const getDueTypeDescription = (dueType: keyof typeof DUE_TYPE_CONFIG) => {
    return DUE_TYPE_CONFIG[dueType]?.description || "";
  };

  // Calculate remaining amount
  const totalAmount = form.watch("total_amount");
  const paidAmount = form.watch("paid_amount") || 0;
  const remainingAmount = totalAmount - paidAmount;

  // Auto-update status based on amounts
  React.useEffect(() => {
    if (totalAmount > 0) {
      if (paidAmount === 0) {
        form.setValue("status", "pending");
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        form.setValue("status", "partial");
      } else if (paidAmount >= totalAmount) {
        form.setValue("status", "paid");
      }
    }
  }, [totalAmount, paidAmount, form]);

  React.useEffect(() => {
    const stockMovementId = form.watch("stock_movement_id");
    if (!stockMovementId && form.getValues("supplier_id")) {
      form.setValue("supplier_id", "" as any);
    }
  }, [form.watch("stock_movement_id"), form]);
  return (
    <>
      <Card className="w-full gap-0 2xl:max-w-4xl mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Supplier Due" : "Add New Supplier Due"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "Financial Action"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update supplier due details and payment status"
                  : "Record new supplier due in your financial management system"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <Building2 className="h-4 w-4" />
                  SUPPLIER INFORMATION
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock_movement_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Stock Movement
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            if (value === "none") {
                              field.onChange(null);
                            } else {
                              const movementId = parseInt(value);
                              field.onChange(movementId);

                              // Auto-select the supplier from the selected stock movement
                              const selectedMovement =
                                stockMovements?.data?.find(
                                  (movement: IStockMovement) =>
                                    movement.id === movementId
                                );
                              if (selectedMovement?.supplier_id) {
                                form.setValue(
                                  "supplier_id",
                                  selectedMovement.supplier_id
                                );
                              }
                            }
                          }}
                          value={field.value ? field.value.toString() : "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select stock movement (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {stockMovements?.data?.map(
                              (movement: IStockMovement) => {
                                // Find supplier name for display
                                const supplierName =
                                  suppliers?.data?.find(
                                    (s: ISupplier) =>
                                      s.id === movement.supplier_id
                                  )?.name ||
                                  `Supplier #${movement.supplier_id}`;

                                return (
                                  <SelectItem
                                    key={movement.id}
                                    value={movement.id.toString()}
                                  >
                                    {`Movement #${movement.id} - ${movement.movement_type} - ${supplierName}`}
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link to related stock movement (optional) - Supplier
                          will be auto-selected
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => {
                      const selectedSupplier = suppliers?.data?.find(
                        (supplier: ISupplier) => supplier.id === field.value
                      );
                      const isAutoSelected =
                        form.watch("stock_movement_id") && selectedSupplier;

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Supplier
                            {isAutoSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-selected
                              </Badge>
                            )}
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString() || ""}
                            disabled={!!form.watch("stock_movement_id")}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={isAutoSelected ? "bg-muted" : ""}
                              >
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers?.data?.map((supplier: ISupplier) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id.toString()}
                                >
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {isAutoSelected
                              ? "Supplier auto-selected from stock movement"
                              : "Select the supplier for this due"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="due_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select due type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DUE_TYPE_CONFIG).map(
                            ([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex flex-col">
                                  <span className="font-medium capitalize">
                                    {config.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {config.description}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {getDueTypeDescription(
                          field.value as keyof typeof DUE_TYPE_CONFIG
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Enter due description, purpose, or additional notes"
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description for this supplier due
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Financial Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <DollarSign className="h-4 w-4" />
                  FINANCIAL DETAILS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Total Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>Total due amount</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paid_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Paid Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>Amount already paid</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Remaining Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={remainingAmount.toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>Amount still due</FormDescription>
                  </FormItem>
                </div>

                {/* Payment Status Display */}
                {totalAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        Payment Status:
                      </span>
                      <Badge
                        className={
                          STATUS_CONFIG[
                            form.watch("status") as keyof typeof STATUS_CONFIG
                          ]?.color
                        }
                      >
                        {
                          STATUS_CONFIG[
                            form.watch("status") as keyof typeof STATUS_CONFIG
                          ]?.label
                        }
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {paidAmount === 0
                        ? "No payment made yet"
                        : paidAmount >= totalAmount
                        ? "Fully paid"
                        : `Remaining: Rs. ${remainingAmount.toFixed(2)}`}
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Due Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Date when payment is due
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Section */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(
                          ([value, config]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      value === "paid"
                                        ? "bg-green-500"
                                        : value === "pending"
                                        ? "bg-yellow-500"
                                        : value === "overdue"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                  />
                                  <span>{config.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getStatusDescription(
                        field.value as keyof typeof STATUS_CONFIG
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
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
                  disabled={loading}
                  className="min-w-32 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {isEdit ? (
                        <Edit className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isEdit ? "Update Due" : "Create Due"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={(password: any) => handleConfirm(password)}
        title={isEdit ? "Confirm Due Update" : "Confirm Due Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} a supplier due
                with the following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-medium">
                    {suppliers?.data?.find(
                      (s: any) => s.id === formData.supplier_id
                    )?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Type:</span>
                  <span className="font-medium capitalize">
                    {formData.due_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">
                    Rs. {formData.total_amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  <span className="font-medium">
                    Rs. {(formData.paid_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">
                    Rs.{" "}
                    {(
                      formData.total_amount - (formData.paid_amount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">
                    {new Date(formData.due_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      STATUS_CONFIG[
                        formData.status as keyof typeof STATUS_CONFIG
                      ]?.color
                    }
                  >
                    {
                      STATUS_CONFIG[
                        formData.status as keyof typeof STATUS_CONFIG
                      ]?.label
                    }
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "This will update the supplier due information across the system."
                  : "This action will create a new supplier due record."}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          loading ? (isEdit ? "Updating Due..." : "Creating Due...") : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your password to confirm this action"
      />
    </>
  );
}
