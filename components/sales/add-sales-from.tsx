"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Package,
  Tag,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/use-fetch";
import { useMutation } from "@/hooks/use-mutation";
import { toast } from "sonner";
import { IProduct, Sale, SaleStatus } from "@/types";
import { SaleFormData, saleSchema } from "@/schema/sales-schema";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SalesFormProps {
  sale?: Sale;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  {
    id: "customer",
    label: "Customer",
    icon: User,
    description: "Select customer details",
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingCart,
    description: "Add products to sale",
  },
  {
    id: "payment",
    label: "Payment",
    icon: DollarSign,
    description: "Payment information",
  },
  {
    id: "review",
    label: "Confirm",
    icon: CheckCircle,
    description: "Review and confirm",
  },
];

export function SalesForm({ sale, onSuccess, onCancel }: SalesFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockAlert, setStockAlert] = useState<Record<number, boolean>>({});

  // Fetch products
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useFetch<IProduct[]>(
    `${server_base_url}/products?branch_id=${user?.branch_id}`,
    { auto: true }
  );

  // Fetch customers
  const {
    data: customersData,
    loading: customersLoading,
    error: customersError,
  } = useFetch<any[]>(
    `${server_base_url}/customers?branch_id=${user?.branch_id}`,
    { auto: true }
  );

  // Mutation for creating/updating sale
  const {
    mutate,
    loading: submitting,
    error: submitError,
    data,
  } = useMutation<Sale>(
    sale ? `${server_base_url}/sales/${sale.id}` : `${server_base_url}/sales`,
    {
      method: sale ? "PUT" : "POST",
      onSuccess: (data) => {
        toast.success(
          sale ? "Sale updated successfully" : "Sale created successfully",
          {
            description: `Sale #${data.data?.id} has been ${
              sale ? "updated" : "created"
            }`,
          }
        );
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error("Failed to save sale", {
          description: error.message || "Please check your input and try again",
        });
      },
    }
  );

  const methods = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema as any),
    defaultValues: {
      sale_date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      paid_amount: 0,
      discount: 0,
      is_fully_paid: false,
      status: "active",
      sale_items: [],
      note: "",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: methods.control,
    name: "sale_items",
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
    getValues,
    trigger,
  } = methods;

  const watchItems = watch("sale_items");
  const watchPaidAmount = watch("paid_amount");
  const watchTotalAmount = watch("total_amount");
  const watchDiscount = watch("discount");
  const watchStatus = watch("status");
  const watchCustomerId = watch("customer_id");

  // Calculate totals
  useEffect(() => {
    const items = watchItems || [];
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const totalAfterDiscount = subtotal - (watchDiscount || 0);
    const total = Math.max(0, totalAfterDiscount);

    setValue("total_amount", total, { shouldValidate: true });

    if (watchPaidAmount >= total) {
      setValue("is_fully_paid", true);
    } else {
      setValue("is_fully_paid", false);
    }
  }, [watchItems, watchDiscount, watchPaidAmount, setValue]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];

    return productsData.data.filter((product) => {
      if (!product.quantity || product.quantity <= 0) return false;

      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
        // product.?.toLowerCase().includes(searchLower)
      );
    });
  }, [productsData?.data, searchQuery]);

  // Handle product selection
  const handleAddProduct = (product: IProduct) => {
    const existingIndex = fields.findIndex(
      (item) => item.product_id === parseInt(product.id)
    );

    if (existingIndex >= 0) {
      const currentItem = watchItems[existingIndex];
      const newQuantity = currentItem.quantity + 1;

      // Check stock availability
      if (newQuantity > product.quantity) {
        toast.warning("Insufficient stock", {
          description: `Only ${product.quantity} units available for ${product.name}`,
        });
        return;
      }

      update(existingIndex, {
        ...currentItem,
        quantity: newQuantity,
      });
    } else {
      append({
        product_id: parseInt(product.id),
        quantity: 1,
        unit_price: product.sales_price_per_meter,
      });
      setSelectedProducts((prev) => [...prev, product]);
    }

    toast.success("Product added", {
      description: `${product.name} added to cart`,
    });
  };

  // Update quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const currentItem = watchItems[index];
    const product = selectedProducts.find(
      (p) => parseInt(p.id) === currentItem.product_id
    );

    if (product && quantity > product.quantity) {
      toast.warning("Insufficient stock", {
        description: `Only ${product.quantity} units available`,
      });
      return;
    }

    update(index, { ...currentItem, quantity });
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const productId = watchItems[index].product_id;
    const product = selectedProducts.find((p) => parseInt(p.id) === productId);

    remove(index);
    setSelectedProducts((prev) =>
      prev.filter((p) => parseInt(p.id) !== productId)
    );

    if (product) {
      toast.info("Product removed", {
        description: `${product.name} removed from cart`,
      });
    }
  };

  // Navigation
  const nextStep = async () => {
    // Validate current step
    if (currentStep === 0) {
      const isValid = await trigger(["customer_id", "sale_date"]);
      if (!isValid) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 1) {
      if (fields.length === 0) {
        toast.error("Please add at least one product");
        return;
      }
    } else if (currentStep === 2) {
      const isValid = await trigger(["paid_amount", "status"]);
      if (!isValid) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Calculations
  const subtotal = (watchTotalAmount || 0) + (watchDiscount || 0);
  const remainingBalance = Math.max(0, watchTotalAmount - watchPaidAmount);
  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;

  // Submit handler
  const onSubmit = async (data: SaleFormData) => {
    if (!data.sale_items || data.sale_items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // Always show confirmation dialog before creating sale
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = (password?: string) => {
    const data = getValues();

    if (!data.sale_items || data.sale_items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const profit =
      watchItems.reduce((sum, item) => {
        const product = selectedProducts.find(
          (p) => parseInt(p.id) === item.product_id
        );
        if (product) {
          const cost = product.purchase_price_per_meter * item.quantity;
          const revenue = item.unit_price * item.quantity;
          return sum + (revenue - cost);
        }
        return sum;
      }, 0) - (data.discount || 0);

    const formData = {
      sale_data: {
        customer_id: data.customer_id,
        sale_date: data.sale_date,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount,
        discount: data.discount || 0,
        profit: Math.max(0, profit),
        note: data.note || null,
        is_fully_paid: data.total_amount >= data.paid_amount,
        status: data.status || "active",
        branch_id: user?.branch_id,
        user_id: user?.id,
        admin_password: password,
      },
      items: data.sale_items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    // console.log(formData);
    mutate(formData).then(() => reset());
  };

  // Selected customer
  const selectedCustomer = useMemo(() => {
    if (!customersData?.data || !watchCustomerId) return null;
    return customersData.data.find((c) => c.id == watchCustomerId);
  }, [customersData?.data, watchCustomerId]);

  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border shadow-sm">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {sale ? "Edit Sale" : "Create New Sale"}
                  </h1>
                </div>
                <p className="text-muted-foreground ml-[52px]">
                  {sale
                    ? "Update sale details and items"
                    : "Fill in customer details, add products, and process payment"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 bg-background/50 backdrop-blur"
                >
                  <Package className="h-3 w-3 mr-1.5" />
                  {user?.branch_name || user?.branch_id}
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 bg-background/50 backdrop-blur"
                >
                  <User className="h-3 w-3 mr-1.5" />
                  {user?.username}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="relative">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
                      isActive &&
                        "bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30 shadow-lg shadow-primary/10",
                      isCompleted &&
                        "bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:shadow-md",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted/50 border border-transparent hover:border-muted-foreground/20 hover:bg-muted"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-pulse rounded-xl" />
                    )}
                    <div
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                        isCompleted &&
                          "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30",
                        isActive &&
                          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 scale-110",
                        !isActive &&
                          !isCompleted &&
                          "bg-muted-foreground/20 text-muted-foreground group-hover:bg-muted-foreground/30"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate transition-colors",
                          isActive && "text-foreground",
                          isCompleted && "text-green-700 dark:text-green-400",
                          !isActive && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Customer Details */}
            {currentStep === 0 && (
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50" />
                <CardHeader className="pb-3 bg-gradient-to-br from-muted/30 to-background">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Select the customer for this sale. This information will be
                    used for invoicing and records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="customer_id"
                          className="flex items-center gap-2"
                        >
                          Customer <span className="text-destructive">*</span>
                          {customersLoading && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                        </Label>
                        <Controller
                          name="customer_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              disabled={customersLoading}
                            >
                              <SelectTrigger
                                className={cn(
                                  "h-16",
                                  errors.customer_id && "border-destructive"
                                )}
                              >
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* <div className="p-2">
                                  <Input
                                    placeholder="Search customers..."
                                    className="mb-2"
                                    onChange={(e) => {
                                      // Implement search functionality here
                                    }}
                                  />
                                </div> */}
                                {customersData?.data?.map((customer) => (
                                  <SelectItem
                                    key={customer.id}
                                    value={customer.id.toString()}
                                    className="py-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <p className="font-medium">
                                        {customer.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {customer.phone}
                                      </p>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.customer_id && (
                          <p className="text-sm text-destructive">
                            {errors.customer_id.message}
                          </p>
                        )}
                      </div>

                      {selectedCustomer && (
                        <Alert className="bg-muted/50">
                          <User className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {selectedCustomer.name}
                              </p>
                              <p className="text-sm">
                                Phone: {selectedCustomer.phone}
                              </p>
                              {selectedCustomer.email && (
                                <p className="text-sm">
                                  Email: {selectedCustomer.email}
                                </p>
                              )}
                              {selectedCustomer.address && (
                                <p className="text-sm">
                                  Address: {selectedCustomer.address}
                                </p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="sale_date"
                          className="flex items-center gap-2"
                        >
                          Sale Date <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name="sale_date"
                          control={control}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full  justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value
                                    ? format(new Date(field.value), "PPP")
                                    : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    field.onChange(
                                      date ? format(date, "yyyy-MM-dd") : ""
                                    );
                                  }}
                                  initialFocus
                                  disabled={(date) => date > new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="note">Additional Notes</Label>
                        <Controller
                          name="note"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder="Add any special instructions or notes for this sale..."
                              className="min-h-[120px] resize-none"
                            />
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Add notes about delivery, special requests,
                          etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t px-6 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 sm:flex-none"
                    >
                      Continue to Products
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {/* Step 2: Add Products */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <Card className="lg:col-span-2 border shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300" />
                  <CardHeader className="pb-3 bg-gradient-to-br from-blue-500/5 to-background">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Product Selection
                    </CardTitle>
                    <CardDescription>
                      Search and add products from your inventory. Available
                      stock is shown for each item.
                    </CardDescription>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, SKU, or description..."
                        className="pl-9 "
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {productsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p className="text-muted-foreground">
                          Loading products...
                        </p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">
                          No products found
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {searchQuery
                            ? "Try a different search term"
                            : "No products available in your inventory"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => {
                          const isLowStock = product.quantity <= 5;
                          const isOutOfStock = product.quantity === 0;

                          return (
                            <Card
                              key={product.id}
                              className={cn(
                                "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2",
                                isOutOfStock && "opacity-60 cursor-not-allowed",
                                isLowStock &&
                                  !isOutOfStock &&
                                  "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20",
                                !isLowStock &&
                                  !isOutOfStock &&
                                  "hover:border-primary/50"
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-semibold truncate">
                                        {product.name}
                                      </h4>
                                      <Badge
                                        variant={
                                          isLowStock ? "destructive" : "outline"
                                        }
                                        className="ml-2 flex-shrink-0"
                                      >
                                        {isOutOfStock
                                          ? "Out of stock"
                                          : `${product.quantity} in stock`}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                      {product.description || "No description"}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          {/* <DollarSign className="h-3 w-3 text-muted-foreground" /> */}
                                          <span className="text-xs text-muted-foreground">
                                            Cost: Rs.{" "}
                                            {product.purchase_price_per_meter?.toFixed(
                                              2
                                            ) || "0.00"}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="font-bold text-lg">
                                        Rs.{" "}
                                        {product.sales_price_per_meter?.toFixed(
                                          2
                                        ) || "0.00"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleAddProduct(product)}
                                  disabled={isOutOfStock}
                                  className="w-full mt-4"
                                  variant={isOutOfStock ? "outline" : "default"}
                                >
                                  {isOutOfStock ? (
                                    "Out of Stock"
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add to Sale
                                    </>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cart Summary */}
                <Card className="border shadow-lg h-fit sticky top-6 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-300" />
                  <CardHeader className="pb-3 bg-gradient-to-br from-green-500/5 to-background">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      Order Summary
                    </CardTitle>
                    <CardDescription>
                      {fields.length} item{fields.length !== 1 ? "s" : ""} in
                      cart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="font-semibold text-lg">
                          Your cart is empty
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Add products from the list to create a sale
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {fields.map((field, index) => {
                            const product = selectedProducts.find(
                              (p) => parseInt(p.id) === field.product_id
                            );
                            const item = watchItems[index];
                            const total =
                              (item.quantity || 0) * (item.unit_price || 0);
                            const isLowStock =
                              product && item.quantity > product.quantity * 0.8;

                            return (
                              <div
                                key={field.id}
                                className="space-y-3 pb-4 border-b last:border-0 last:pb-0"
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">
                                      {product?.name || "Unknown Product"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Unit Price: Rs.{" "}
                                      {item.unit_price?.toFixed(2)}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(index)}
                                    className="h-8 w-8 flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {isLowStock && product && (
                                  <Alert className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                      High demand: {item.quantity} of{" "}
                                      {product.quantity} units
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateQuantity(index, item.quantity - 1)
                                      }
                                      disabled={item.quantity <= 1}
                                    >
                                      -
                                    </Button>
                                    <span className="w-10 text-center font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateQuantity(index, item.quantity + 1)
                                      }
                                      disabled={
                                        product &&
                                        item.quantity >= product.quantity
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <span className="font-bold">
                                    Rs. {total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}

                    {fields.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span>Rs. {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount" className="text-sm">
                              Discount
                            </Label>
                            <div className="flex items-center gap-2">
                              <Controller
                                name="discount"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    className="h-9"
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                )}
                              />
                              <Badge variant="secondary" className="px-2">
                                %
                              </Badge>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span>
                              Rs. {(watchTotalAmount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="w-full"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Customer
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={fields.length === 0}
                      className="w-full"
                    >
                      Continue to Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300" />
                  <CardHeader className="pb-3 bg-gradient-to-br from-purple-500/5 to-background">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Payment Details
                    </CardTitle>
                    <CardDescription>
                      Enter payment information and update sale status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="total_amount">Total Amount</Label>
                          <div className="relative">
                            <Input
                              id="total_amount"
                              value={watchTotalAmount?.toFixed(2)}
                              disabled
                              className=" bg-muted font-bold text-lg pl-8"
                            />
                            <span className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground text-sm">
                              Rs
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="discount"
                            className="flex items-center gap-2"
                          >
                            Discount
                            {watchDiscount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                -Rs. {watchDiscount.toFixed(2)}
                              </Badge>
                            )}
                          </Label>
                          <Controller
                            name="discount"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                className=""
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Sale Status</Label>
                          <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(SaleStatus).map((status) => (
                                    <SelectItem
                                      key={status}
                                      value={status}
                                      className="py-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        {status === "completed" && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {status === "active" && (
                                          <AlertCircle className="h-4 w-4 text-amber-500" />
                                        )}
                                        {status === "cancelled" && (
                                          <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="capitalize">
                                          {status}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="paid_amount"
                            className="flex items-center gap-2"
                          >
                            Amount Paid{" "}
                            <span className="text-destructive">*</span>
                            {watchPaidAmount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Paid
                              </Badge>
                            )}
                          </Label>
                          <Controller
                            name="paid_amount"
                            control={control}
                            render={({ field }) => (
                              <div className="relative">
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  className={cn(
                                    " pl-8",
                                    errors.paid_amount && "border-destructive"
                                  )}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                                <span className="absolute  text-sm left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                                  Rs{" "}
                                </span>
                              </div>
                            )}
                          />
                          {errors.paid_amount && (
                            <p className="text-sm text-destructive">
                              {errors.paid_amount.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* <div className="space-y-4">
                      <Label className="text-base">Payment Status</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="is_fully_paid"
                          control={control}
                          render={({ field }) => (
                            <>
                              <div
                                onClick={() => field.onChange(true)}
                                className={cn(
                                  "p-4 border rounded-lg cursor-pointer transition-all",
                                  field.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-5 w-5 rounded-full border flex items-center justify-center",
                                      field.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted"
                                    )}
                                  >
                                    {field.value && (
                                      <CheckCircle className="h-3 w-3" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">Fully Paid</p>
                                    <p className="text-sm text-muted-foreground">
                                      Customer has paid the full amount
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div
                                onClick={() => field.onChange(false)}
                                className={cn(
                                  "p-4 border rounded-lg cursor-pointer transition-all",
                                  !field.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-5 w-5 rounded-full border flex items-center justify-center",
                                      !field.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted"
                                    )}
                                  >
                                    {!field.value && (
                                      <CheckCircle className="h-3 w-3" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Partial Payment
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Customer will pay remaining later
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        />
                      </div>
                    </div> */}

                    {remainingBalance > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>Remaining Balance:</span>
                            <span className="font-bold">
                              Rs. {remainingBalance.toFixed(2)}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Summary Sidebar */}
                <Card className="border shadow-lg h-fit sticky top-6 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300" />
                  <CardHeader className="pb-3 bg-gradient-to-br from-emerald-500/5 to-background">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Items Total
                        </span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-destructive">
                          -Rs. {(watchDiscount || 0).toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>Rs. {(watchTotalAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Amount Paid
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Rs. {(watchPaidAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Remaining Balance
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            remainingBalance > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-green-600 dark:text-green-400"
                          )}
                        >
                          Rs. {remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium">Items ({fields.length})</h4>
                      <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-2">
                          {fields.map((field, index) => {
                            const product = selectedProducts.find(
                              (p) => parseInt(p.id) === field.product_id
                            );
                            const item = watchItems[index];
                            return (
                              <div
                                key={field.id}
                                className="flex justify-between items-center py-2 border-b last:border-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">
                                    {product?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity} × Rs.{" "}
                                    {item.unit_price.toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-medium text-sm">
                                  Rs.{" "}
                                  {(item.quantity * item.unit_price).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="w-full"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Products
                    </Button>
                    <Button type="button" onClick={nextStep} className="w-full">
                      Review & Confirm
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 3 && (
              <Card className="border shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300" />
                <CardHeader className="pb-3 bg-gradient-to-br from-indigo-500/5 to-background">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Review & Confirm
                  </CardTitle>
                  <CardDescription>
                    Please review all details before submitting the sale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full mb-4 grid-cols-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="customer">Customer</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Sale Date
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(getValues("sale_date")),
                                  "PPP"
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Status
                              </p>
                              <Badge
                                variant={
                                  watchStatus === "completed"
                                    ? "default"
                                    : watchStatus === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {watchStatus}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Items Count
                              </p>
                              <p className="font-medium">
                                {fields.length} items
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {getValues("note") && (
                        <Card>
                          <CardContent className="">
                            <p className="text-sm text-muted-foreground mb-2">
                              Notes
                            </p>
                            <p className="text-sm">{getValues("note")}</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="customer" className="space-y-4">
                      {selectedCustomer ? (
                        <Card>
                          <CardContent className=" space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {selectedCustomer.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {selectedCustomer.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Customer
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Phone
                                </p>
                                <p className="font-medium">
                                  {selectedCustomer.phone}
                                </p>
                              </div>
                              {selectedCustomer.email && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Email
                                  </p>
                                  <p className="font-medium">
                                    {selectedCustomer.email}
                                  </p>
                                </div>
                              )}
                            </div>
                            {selectedCustomer.address && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Address
                                </p>
                                <p className="font-medium">
                                  {selectedCustomer.address}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="pt-6 text-center py-8">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              No customer selected
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="products">
                      <Card>
                        <CardContent className="pt-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead className="text-right">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {fields.map((field, index) => {
                                const product = selectedProducts.find(
                                  (p) => parseInt(p.id) === field.product_id
                                );
                                const item = watchItems[index];
                                const total = item.quantity * item.unit_price;

                                return (
                                  <TableRow key={field.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">
                                          {product?.name}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      Rs. {item.unit_price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      Rs. {total.toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="payment" className="space-y-4">
                      <Card>
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Subtotal
                              </span>
                              <span>Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Discount
                              </span>
                              <span className="text-destructive">
                                -Rs. {watchDiscount.toFixed(2)}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total Amount</span>
                              <span>Rs. {watchTotalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Amount Paid
                              </span>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Rs. {watchPaidAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Remaining Balance
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  remainingBalance > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-green-600 dark:text-green-400"
                                )}
                              >
                                Rs. {remainingBalance.toFixed(2)}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getValues("is_fully_paid") ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                )}
                                <span className="font-medium">
                                  {getValues("is_fully_paid")
                                    ? "Fully Paid"
                                    : "Partial Payment"}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  getValues("is_fully_paid")
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {getValues("status")}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submitError.message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t px-6 py-4">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 sm:flex-none"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Payment
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {sale ? "Update Sale" : "Create Sale"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </div>

        <ConfirmationDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleConfirmSubmit}
          title={sale ? "Confirm Sale Update" : "Confirm Sale Creation"}
          description={
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">
                  Rs. {watchTotalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-bold text-green-600">
                  Rs. {watchPaidAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Remaining Balance:
                </span>
                <span
                  className={cn(
                    "font-bold",
                    remainingBalance > 0 ? "text-amber-600" : "text-green-600"
                  )}
                >
                  Rs. {remainingBalance.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                Please review the sale details and confirm to{" "}
                {sale ? "update" : "create"} this sale.
              </p>
            </div>
          }
          confirmationText="Confirm Sale"
          confirmText={sale ? "Confirm Update" : "Confirm Sale"}
          cancelText="Review Details"
          variant="default"
          requiresConfirmation={true}
        />
      </FormProvider>
    </TooltipProvider>
  );
}
