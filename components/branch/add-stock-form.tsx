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
  Package,
  Truck,
  Building2,
  Hash,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Plus,
  ArrowRightLeft,
  Warehouse,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useFetch } from "@/hooks/use-fetch";
import { IBranch, IProduct, ISupplier } from "@/types";
import { Option, SmartSelect } from "../shared/smart-select";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { stockMovementSchema, StockMovementSchemaType } from "@/schema/stock-movement-schema";

interface StockMovementFormProps {
  mode?: "create" | "edit";
  initialData?: StockMovementSchemaType & { id?: string };
  onSuccess?: () => void;
}

const MOVEMENT_TYPE_CONFIG = {
  arrival: {
    label: "Stock Arrival",
    description: "New stock received from supplier",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Truck,
  },
  dispatch: {
    label: "Stock Dispatch",
    description: "Stock dispatched to customer or sold",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  transfer_in: {
    label: "Transfer In",
    description: "Stock received from another branch",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ArrowRightLeft,
  },
  transfer_out: {
    label: "Transfer Out",
    description: "Stock transferred to another branch",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: ArrowRightLeft,
  },
  adjustment: {
    label: "Stock Adjustment",
    description: "Manual stock quantity adjustment",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Warehouse,
  },
};

export function StockMovementForm({
  mode = "create",
  initialData,
  onSuccess,
}: StockMovementFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<StockMovementSchemaType | null>(null);
  const [selectedMovementType, setSelectedMovementType] = React.useState<string>("");

  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/stock/${initialData?.id}`
      : `${server_base_url}/stock`,
    {
      credentials: "include",
      method: isEdit ? "PATCH" : "POST",
      onError: (error) => {
        console.log(error);
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${isEdit ? "update" : "create"} stock movement. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Stock Movement Updated Successfully"
            : "Stock Movement Created Successfully",
          {
            description: `Stock movement has been ${isEdit ? "updated" : "created"} successfully.`,
          }
        );
        
        form.reset();
        onSuccess?.();
      },
    }
  );

  // Fetch products for the current branch
  const { data: productsData, loading: productsLoading } = useFetch(
    `${server_base_url}/products?branch_id=${user?.branch_id}`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  // Fetch suppliers
  const { data: suppliersData, loading: suppliersLoading } = useFetch(
    `${server_base_url}/suppliers`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  // Fetch branches for transfers
  const { data: branchesData, loading: branchesLoading } = useFetch(
    `${server_base_url}/branches`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  const form = useForm<StockMovementSchemaType>({
    resolver: zodResolver(stockMovementSchema as any),
    defaultValues: initialData || {
      product_id: "",
      movement_type: "arrival",
      supplier_id: "",
      reference_branch_id: "",
      quantity: "" as any,
      unit_price_per_meter: "" as any,
      paid_amount: "" as any,
      total_amount: "" as any,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      auto_update_product: true,
    },
  });

  const onSubmit = (data: StockMovementSchemaType) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (password: string) => {
    if (!formData || !password) return;

    try {
      const payload = {
        ...formData,
        user_id: user?.id,
        branch_id: user?.branch_id,
        admin_password: password,
      };

      await mutate(payload);
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${isEdit ? "update" : "create"} stock movement. Please try again.`,
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  // Watch form values for dynamic calculations
  const movementType = form.watch("movement_type");
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unit_price_per_meter");
  const paidAmount = form.watch("paid_amount");

  // Calculate total amount automatically
  React.useEffect(() => {
    if (quantity && unitPrice) {
      const total = quantity * unitPrice;
      form.setValue("total_amount", total);
      
      // Calculate remaining amount
      const remaining = total - (paidAmount || 0);
      // You can set this to a hidden field or state if needed
    }
  }, [quantity, unitPrice, paidAmount, form]);

  // Prepare options for selects
  const productOptions: Option[] = (productsData?.data || []).map((product: IProduct) => ({
    label: `${product.name} (${product.company}) - Stock: ${product.quantity}`,
    value: product.id.toString(),
  }));

  const supplierOptions: Option[] = (suppliersData?.data || []).map((supplier: ISupplier) => ({
    label: `${supplier.name} - ${supplier.phone}`,
    value: supplier.id.toString(),
  }));

  const branchOptions: Option[] = (branchesData?.data || [])
    .filter((branch: IBranch) => Number(branch.id) !== user?.branch_id) // Exclude current branch
    .map((branch: IBranch) => ({
      label: `${branch.name} - ${branch.city}`,
      value: branch.id.toString(),
    }));

  const getMovementDescription = (type: keyof typeof MOVEMENT_TYPE_CONFIG) => {
    return MOVEMENT_TYPE_CONFIG[type]?.description || "";
  };

  const getActionDescription = () => {
    const type = movementType as keyof typeof MOVEMENT_TYPE_CONFIG;
    const config = MOVEMENT_TYPE_CONFIG[type];
    
    if (!config) return "";

    switch (type) {
      case 'arrival':
        return "This will: • Increase product stock • Create supplier due if payment not completed • Update inventory records";
      case 'dispatch':
        return "This will: • Decrease product stock • Update sales records • Affect available inventory";
      case 'transfer_in':
        return "This will: • Increase product stock in your branch • Create inter-branch due record • Sync with sending branch";
      case 'transfer_out':
        return "This will: • Decrease product stock in your branch • Create inter-branch receivable • Sync with receiving branch";
      case 'adjustment':
        return "This will: • Set specific stock quantity • Used for corrections and counts • Update inventory accuracy";
      default:
        return "";
    }
  };

  return (
    <>
      <Card className="w-full gap-0 2xl:max-w-4xl mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Stock Movement" : "Create Stock Movement"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "Inventory Action"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update stock movement details and records"
                  : "Record new stock movement and update inventory"}
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
                  <Package className="h-4 w-4" />
                  STOCK MOVEMENT INFORMATION
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Product
                        </FormLabel>
                        <SmartSelect
                          options={productOptions}
                          selected={field.value ? [field.value] : []}
                          onChange={(value) => form.setValue("product_id", value[0])}
                          placeholder="Select product"
                          isMulti={false}
                        //   loading={productsLoading}
                        />
                        <FormDescription>
                          Choose the product for this movement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="movement_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Movement Type
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedMovementType(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select movement type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(MOVEMENT_TYPE_CONFIG).map(
                              ([value, config]) => {
                                const IconComponent = config.icon;
                                return (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        <span>{config.label}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {config.description}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {getMovementDescription(field.value as keyof typeof MOVEMENT_TYPE_CONFIG)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dynamic Fields Based on Movement Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supplier Field - Show for arrival */}
                  {(movementType === 'arrival') && (
                    <FormField
                      control={form.control}
                      name="supplier_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Supplier
                          </FormLabel>
                          <SmartSelect
                            options={supplierOptions}
                            selected={field.value ? [field.value] : []}
                            onChange={(value) => form.setValue("supplier_id", value[0])}
                            placeholder="Select supplier"
                            isMulti={false}
                            // loading={suppliersLoading}
                          />
                          <FormDescription>
                            Required for stock arrivals
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Reference Branch Field - Show for transfers */}
                  {(movementType === 'transfer_in' || movementType === 'transfer_out') && (
                    <FormField
                      control={form.control}
                      name="reference_branch_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {movementType === 'transfer_in' ? 'From Branch' : 'To Branch'}
                          </FormLabel>
                          <SmartSelect
                            options={branchOptions}
                            selected={field.value ? [field.value] : []}
                            onChange={(value) => form.setValue("reference_branch_id", value[0])}
                            placeholder={`Select ${movementType === 'transfer_in' ? 'source' : 'destination'} branch`}
                            isMulti={false}
                            // loading={branchesLoading}    
                          />
                          <FormDescription>
                            {movementType === 'transfer_in' 
                              ? 'Branch sending the stock' 
                              : 'Branch receiving the stock'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Movement Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Date when this movement occurred
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity & Pricing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <DollarSign className="h-4 w-4" />
                  QUANTITY & PRICING
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Number of units/meters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit_price_per_meter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Unit Price
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
                        <FormDescription>
                          Price per unit/meter
                        </FormDescription>
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
                          <DollarSign className="h-4 w-4" />
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
                        <FormDescription>
                          Amount paid immediately
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Auto-calculated Total Amount */}
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Calculated as Quantity × Unit Price
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remaining Amount Display */}
                {form.watch("total_amount") > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        Remaining Amount:
                      </span>
                      <Badge
                        variant={
                          (form.watch("total_amount") - (form.watch("paid_amount") || 0)) > 0
                            ? "outline"
                            : "default"
                        }
                        className={
                          (form.watch("total_amount") - (form.watch("paid_amount") || 0)) > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        Rs. {(form.watch("total_amount") - (form.watch("paid_amount") || 0)).toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {(form.watch("total_amount") - (form.watch("paid_amount") || 0)) > 0
                        ? "This amount will be recorded as due"
                        : "Full payment completed"}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this stock movement..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes for reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="auto_update_product"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Auto Update Product Stock</FormLabel>
                        <FormDescription>
                          When checked, the product stock quantity will be automatically updated based on this movement
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Description */}
              {movementType && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-amber-100 rounded">
                      <Truck className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-1">
                        This action will:
                      </h4>
                      <p className="text-sm text-amber-700 whitespace-pre-line">
                        {getActionDescription()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                      {isEdit ? "Update Movement" : "Create Movement"}
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
        title={isEdit ? "Confirm Stock Movement Update" : "Confirm Stock Movement Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} a stock movement with the following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movement Type:</span>
                  <Badge
                    variant="outline"
                    className={
                      MOVEMENT_TYPE_CONFIG[formData.movement_type as keyof typeof MOVEMENT_TYPE_CONFIG]?.color
                    }
                  >
                    {MOVEMENT_TYPE_CONFIG[formData.movement_type as keyof typeof MOVEMENT_TYPE_CONFIG]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{formData.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span className="font-medium">Rs. {formData.unit_price_per_meter}/m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">Rs. {formData.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  <span className="font-medium">Rs. {formData.paid_amount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">
                    Rs. {(formData.total_amount - (formData.paid_amount || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto Update:</span>
                  <Badge variant="outline" className={formData.auto_update_product ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {formData.auto_update_product ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              
              {/* Database Action Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Database Actions:</h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  {formData.auto_update_product && (
                    <li>Update product stock quantity in inventory</li>
                  )}
                  {formData.movement_type === 'arrival' && formData.supplier_id && (
                    <li>Create supplier due record for remaining amount</li>
                  )}
                  {(formData.movement_type === 'transfer_in' || formData.movement_type === 'transfer_out') && (
                    <li>Create inter-branch due record</li>
                  )}
                  <li>Record complete transaction history</li>
                  <li>Update financial records and balances</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "This will update the stock movement record and related financial entries."
                  : "This action will permanently record the stock movement and update related records."}
              </p>
            </div>
          ) : (
            "Loading movement details..."
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating Movement..."
              : "Creating Movement..."
            : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your admin password to confirm this action"
      />
    </>
  );
}