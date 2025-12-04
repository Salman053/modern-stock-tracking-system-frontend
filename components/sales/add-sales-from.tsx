"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Search, ShoppingCart, DollarSign, User, FileText, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFetch } from "@/hooks/use-fetch";
import { useMutation } from "@/hooks/use-mutation";
import { toast } from "sonner";
import { IProduct, Sale, SaleStatus } from "@/types";
import { SaleFormData, saleSchema } from "@/schema/sales-schema";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";

interface SalesFormProps {
    sale?: Sale;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const STEPS = [
    { id: "customer", label: "Customer Details", icon: User },
    { id: "products", label: "Add Products", icon: ShoppingCart },
    { id: "payment", label: "Payment & Summary", icon: DollarSign },
    { id: "review", label: "Review & Confirm", icon: CheckCircle },
];

export function SalesForm({ sale, onSuccess, onCancel }: SalesFormProps) {
    const { user } = useAuth()
    const [currentStep, setCurrentStep] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch products
    const { data: productsData, loading: productsLoading } = useFetch<IProduct[]>(
        `${server_base_url}/products`,
        { auto: true }
    );

    // Fetch customers
    const { error, data: customersData, loading: customersLoading } = useFetch<any[]>(
        `${server_base_url}/customers?branch_id=${user?.branch_id}`,
        { auto: true }
    );

    console.log(error)

    // Prepare mutation
    const { mutate, data, loading: submitting, error: submitError } = useMutation<Sale>(
        sale ? `${server_base_url}/sales/${sale.id}` : `${server_base_url}/sales/`,
        {
            method: sale ? "PUT" : "POST",
            onSuccess: (data) => {
                toast.success(sale ? "Sale updated successfully" : "Sale created successfully");
                if (onSuccess) onSuccess();
            },
            onError: (error) => {
                toast.error(error.message || "Failed to save sale");
            },
        }
    );

    // console.log(data)
    const methods = useForm<SaleFormData>({
        resolver: zodResolver(saleSchema as any),
        defaultValues: {
            sale_date: new Date().toISOString().split("T")[0],
            total_amount: 0,
            paid_amount: 0,
            discount: 0,
            is_fully_paid: false,
            status: 'pending',
            sale_items: [],
        },
    }
    );

    const { fields, append, remove, update } = useFieldArray({
        control: methods.control,
        name: "sale_items",
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = methods;

    // Watch form values
    const watchItems = watch("sale_items");
    const watchPaidAmount = watch("paid_amount");
    const watchTotalAmount = watch("total_amount");
    const watchDiscount = watch("discount");

    // Calculate totals
    useEffect(() => {
        const items = watchItems || [];
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const totalAfterDiscount = subtotal - (watchDiscount || 0);
        const total = Math.max(0, totalAfterDiscount);

        setValue("total_amount", total);

        // Auto-set is_fully_paid if paid amount >= total
        if (watchPaidAmount >= total) {
            setValue("is_fully_paid", true);
        } else {
            setValue("is_fully_paid", false);
        }
    }, [watchItems, watchDiscount, watchPaidAmount, setValue]);

    // Filter products based on search
    const filteredProducts = productsData?.data?.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Handle product selection
    const handleAddProduct = (product: IProduct) => {
        const existingIndex = fields.findIndex(item => item.product_id === parseInt(product.id));

        if (existingIndex >= 0) {
            // Update quantity if product already exists
            const currentItem = watchItems[existingIndex];
            update(existingIndex, {
                ...currentItem,
                quantity: currentItem.quantity + 1,
            });
        } else {
            // Add new product
            append({
                product_id: parseInt(product.id),
                quantity: 1,
                unit_price: product.sales_price_per_meter,
            });

            setSelectedProducts([...selectedProducts, product]);
        }
    };

    // Update item quantity
    const updateQuantity = (index: number, quantity: number) => {
        if (quantity < 1) return;
        const currentItem = watchItems[index];
        update(index, { ...currentItem, quantity });
    };

    // Update item price
    const updatePrice = (index: number, price: number) => {
        if (price < 0) return;
        const currentItem = watchItems[index];
        update(index, { ...currentItem, unit_price: price });
    };

    // Remove item
    const handleRemoveItem = (index: number) => {
        const productId = watchItems[index].product_id;
        remove(index);
        setSelectedProducts(selectedProducts.filter(p => parseInt(p.id) !== productId));
    };

    // Navigate between steps
    const nextStep = () => {
        // Validate current step
        if (currentStep === 0) {
            const customerId = methods.getValues("customer_id");
            if (!customerId) {
                toast.error("Please select a customer");
                return;
            }
        } else if (currentStep === 1) {
            if (fields.length === 0) {
                toast.error("Please add at least one product");
                return;
            }
        }

        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    // Calculate remaining balance
    const remainingBalance = Math.max(0, watchTotalAmount - watchPaidAmount);

    // Submit form
    const onSubmit = async (data: SaleFormData) => {
        // Add profit calculation
        const profit = watchItems.reduce((sum, item) => {
            const product = selectedProducts.find(p => parseInt(p.id) === item.product_id);
            if (product) {
                const cost = product.purchase_price_per_meter * item.quantity;
                const revenue = item.unit_price * item.quantity;
                return sum + (revenue - cost);
            }
            return sum;
        }, 0) - (data.discount || 0);

        const formData = {
            ...data,
            profit,
            updated_at: new Date().toISOString(),
        };

        // Show confirmation dialog for large amounts
        if (data.total_amount > 1000 && !data.is_fully_paid) {
            setShowConfirmDialog(true);
        } else {
            mutate(formData);
        }
    };

    const handleConfirmSubmit = (password?: string) => {
        const data = methods.getValues();
        mutate({ ...data, password });
        setShowConfirmDialog(false);
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6">
                {/* Progress Steps */}
                <div className="relative">
                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted" />
                    <div className="relative flex justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2",
                                        isCompleted && "bg-primary text-primary-foreground border-primary",
                                        isActive && "border-primary bg-background",
                                        !isActive && !isCompleted && "border-muted bg-background"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                        "mt-2 text-sm font-medium",
                                        isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Step 1: Customer Details */}
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>Select customer for this sale</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_id">Customer *</Label>
                                        <Controller
                                            name="customer_id"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString()}
                                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                                    disabled={customersLoading}
                                                >
                                                    <SelectTrigger className={errors.customer_id ? "border-red-500" : ""}>
                                                        <SelectValue placeholder="Select a customer" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customersData?.data?.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                {customer.name} - {customer.phone}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.customer_id && (
                                            <p className="text-sm text-red-500">{errors.customer_id.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sale_date">Sale Date *</Label>
                                        <Controller
                                            name="sale_date"
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">Notes (Optional)</Label>
                                    <Controller
                                        name="note"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="Add any notes about this sale..."
                                                className="min-h-[100px]"
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={nextStep}>
                                    Next: Add Products
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 2: Add Products */}
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Product Selection Panel */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Product Selection</CardTitle>
                                    <CardDescription>Search and add products to the sale</CardDescription>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search products..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {productsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredProducts.map((product) => (
                                                <Card key={product.id} className="overflow-hidden">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-semibold">{product.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <Badge variant="outline">{product.type}</Badge>
                                                                    <span className="text-sm">
                                                                        Stock: {product.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => handleAddProduct(product)}
                                                                disabled={product.quantity <= 0}
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add
                                                            </Button>
                                                        </div>
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">
                                                                Cost: Rs. {product.purchase_price_per_meter}
                                                            </span>
                                                            <span className="font-semibold">
                                                                Rs. {product.sales_price_per_meter}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cart Summary Panel */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                    <CardDescription>{fields.length} items in cart</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {fields.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No products added yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="max-h-[400px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Product</TableHead>
                                                            <TableHead>Qty / meter</TableHead>
                                                            <TableHead>Price</TableHead>
                                                            <TableHead>Total</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {fields.map((field, index) => {
                                                            const product = selectedProducts.find(
                                                                p => parseInt(p.id) === field.product_id
                                                            );
                                                            const item = watchItems[index];
                                                            const total = (item.quantity || 0) * (item.unit_price || 0);

                                                            return (
                                                                <TableRow key={field.id}>
                                                                    <TableCell className="font-medium">
                                                                        {product?.name || "Loading..."}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                                                disabled={item.quantity <= 1}
                                                                            >
                                                                                -
                                                                            </Button>
                                                                            <span className="w-8 text-center">{item.quantity}</span>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                                                                disabled={product && item.quantity >= product.quantity}
                                                                            >
                                                                                +
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            //                                                                          value={item.unit_price}
                                                                            onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                                                                            className="w-24"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="font-semibold">
                                                                        Rs. {total.toFixed(2)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleRemoveItem(index)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Subtotal</span>
                                                    <span>Rs. {(watchTotalAmount + (watchDiscount || 0)).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Discount</span>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={watchDiscount || 0}
                                                            onChange={(e) => setValue("discount", parseFloat(e.target.value) || 0)}
                                                            className="w-24 h-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                                    <span>Total</span>
                                                    <span>Rs. {(watchTotalAmount || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={fields.length === 0}
                                    >
                                        Next: Payment
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Payment Details</CardTitle>
                                    <CardDescription>Enter payment information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="total_amount">Total Amount</Label>
                                            <Input
                                                id="total_amount"
                                                value={watchTotalAmount?.toFixed(2)}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="discount">Discount</Label>
                                            <Controller
                                                name="discount"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"

                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="paid_amount">Amount Paid *</Label>
                                            <Controller
                                                name="paid_amount"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        className={errors.paid_amount ? "border-red-500" : ""}
                                                    />
                                                )}
                                            />
                                            {errors.paid_amount && (
                                                <p className="text-sm text-red-500">{errors.paid_amount.message}</p>
                                            )}
                                        </div>

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
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.values(SaleStatus).map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="is_fully_paid">Payment Status</Label>
                                        <Controller
                                            name="is_fully_paid"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_fully_paid"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="is_fully_paid" className="cursor-pointer">
                                                        Mark as fully paid
                                                    </Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary Sidebar */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>Rs. {(watchTotalAmount + (watchDiscount || 0)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="text-red-500">-Rs. {(watchDiscount || 0).toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span>Rs. {(watchTotalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Amount Paid</span>
                                            <span className="text-green-600">Rs. {(watchPaidAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Remaining Balance</span>
                                            <span className={remainingBalance > 0 ? "text-amber-600" : "text-green-600"}>
                                                Rs. {remainingBalance.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Items ({fields.length})</h4>
                                        <div className="text-sm space-y-1">
                                            {fields.map((field, index) => {
                                                const product = selectedProducts.find(
                                                    p => parseInt(p.id) === field.product_id
                                                );
                                                const item = watchItems[index];
                                                return (
                                                    <div key={field.id} className="flex justify-between">
                                                        <span className="truncate">
                                                            {product?.name} × {item.quantity}
                                                        </span>
                                                        <span>Rs. {(item.quantity * item.unit_price).toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        Back
                                    </Button>
                                    <Button type="button" onClick={nextStep}>
                                        Review & Confirm
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* Step 4: Review & Confirm */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review & Confirm</CardTitle>
                                <CardDescription>Please review all details before submitting</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Tabs defaultValue="order">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="order">Order Details</TabsTrigger>
                                        <TabsTrigger value="customer">Customer</TabsTrigger>
                                        <TabsTrigger value="products">Products</TabsTrigger>
                                        <TabsTrigger value="payment">Payment</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="order" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">Sale Date</Label>
                                                <p>{format(methods.getValues("sale_date"), "PPP")}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Status</Label>
                                                <Badge variant="outline">
                                                    {methods.getValues("status")}
                                                </Badge>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Notes</Label>
                                                <p>{methods.getValues("note") || "No notes"}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="customer" className="space-y-4">
                                        {(() => {
                                            const customerId = methods.getValues("customer_id");
                                            const customer = customersData?.data?.find(c => c.id == customerId);
                                            return customer ? (
                                                <div className="space-y-2">
                                                    <p><strong>Name:</strong> {customer.name}</p>
                                                    <p><strong>Phone:</strong> {customer.phone}</p>
                                                    <p><strong>Email:</strong> {customer.email || "N/A"}</p>
                                                    <p><strong>Address:</strong> {customer.address || "N/A"}</p>
                                                </div>
                                            ) : (
                                                <p>Loading customer details...</p>
                                            );
                                        })()}
                                    </TabsContent>

                                    <TabsContent value="products">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Unit Price</TableHead>
                                                    <TableHead>Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => {
                                                    const product = selectedProducts.find(
                                                        p => parseInt(p.id) === field.product_id
                                                    );
                                                    const item = watchItems[index];
                                                    const total = item.quantity * item.unit_price;

                                                    return (
                                                        <TableRow key={field.id}>
                                                            <TableCell>{product?.name}</TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>Rs. {item.unit_price.toFixed(2)}</TableCell>
                                                            <TableCell>Rs. {total.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>

                                    <TabsContent value="payment" className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Total Amount:</span>
                                                <span className="font-semibold">
                                                    Rs. {methods.getValues("total_amount").toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Discount:</span>
                                                <span className="text-red-500">
                                                    -Rs. {methods.getValues("discount").toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Paid Amount:</span>
                                                <span className="text-green-600">
                                                    Rs. {methods.getValues("paid_amount").toFixed(2)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Remaining Balance:</span>
                                                <span className={
                                                    remainingBalance > 0 ? "text-amber-600" : "text-green-600"
                                                }>
                                                    Rs. {remainingBalance.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className={
                                                    methods.getValues("is_fully_paid")
                                                        ? "text-green-600 flex items-center gap-1"
                                                        : "text-amber-600 flex items-center gap-1"
                                                }>
                                                    {methods.getValues("is_fully_paid") ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span>Fully Paid</span>
                                                        </>
                                                    ) : (
                                                        <span>Partial Payment</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {submitError && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-red-600 font-medium">Error: {submitError.message}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    Back
                                </Button>
                                <div className="space-x-2">
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : sale ? "Update Sale" : "Create Sale"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </form>
            </div>

            {/* Confirmation Dialog for Large Amounts */}
            <ConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                onConfirm={handleConfirmSubmit}
                title="Confirm Large Sale"
                description={
                    <div className="space-y-2">
                        <p>You are about to create a sale for <strong>Rs. {watchTotalAmount.toFixed(2)}</strong> with a remaining balance of<br></br> <strong>  Rs. {remainingBalance.toFixed(2)}</strong>.</p>
                        <p>This is a large transaction. Please confirm to proceed.</p>
                    </div>
                }
                confirmText="Confirm Sale"
                cancelText="Review Details"
                variant="default"
                requiresPassword={remainingBalance > 1000}
                passwordLabel="Enter your password to confirm large transaction"
            />
        </FormProvider >
    );
}