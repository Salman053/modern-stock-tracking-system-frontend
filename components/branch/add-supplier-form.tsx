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
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Shield,
  Edit,
  Plus,
  Building,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useFetch } from "@/hooks/use-fetch";
import { ISupplier } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { supplierSchema, SupplierSchemaType } from "@/schema/supplier-schema";

interface SupplierFormProps {
  mode?: "create" | "edit";
  initialData?: SupplierSchemaType & { id?: string };
  onSuccess?: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    description: "Supplier is active and can receive orders",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  inactive: {
    label: "Inactive",
    description: "Supplier is temporarily inactive",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  archived: {
    label: "archived",
    description: "Supplier has been archived",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export function SupplierForm({
  mode = "create",
  initialData,
  onSuccess,
}: SupplierFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<SupplierSchemaType | null>(
    null
  );

  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/suppliers/${initialData?.id}`
      : `${server_base_url}/suppliers`,
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
            } supplier. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Supplier Updated Successfully"
            : "Supplier Created Successfully",
          {
            description: `${formData?.name} has been ${
              isEdit ? "updated" : "created"
            } successfully.`,
          }
        );

        form.reset();
        onSuccess?.();
      },
    }
  );

  const form = useForm<SupplierSchemaType>({
    resolver: zodResolver(supplierSchema as any),
    defaultValues: initialData || {
      name: "",
      address: "",
      phone: "",
      email: "",
      cnic: "",
      is_permanent: false,
      status: "active",
    },
  });

  const onSubmit = (data: SupplierSchemaType) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (password: string) => {
    if (!formData || !password) return;

    try {
      await mutate({
        ...formData,
        user_id: user?.id,
        branch_id: user?.branch_id,
        admin_password: password,
      });
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${
            isEdit ? "update" : "create"
          } supplier. Please try again.`,
      });
    }
  };

  const getStatusDescription = (status: keyof typeof STATUS_CONFIG) => {
    return STATUS_CONFIG[status]?.description || "";
  };

  return (
    <>
      <Card className="w-full gap-0 2xl:max-w-4xl mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Supplier" : "Add New Supplier"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "Vendor Management"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update supplier details and information"
                  : "Add new supplier to your vendor management system"}
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
                  <User className="h-4 w-4" />
                  SUPPLIER INFORMATION
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Supplier Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier name" {...field} />
                        </FormControl>
                        <FormDescription>
                          2-100 characters for supplier/company name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          CNIC Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter CNIC number"
                            {...field}
                            onChange={(e) => {
                              // Format CNIC: XXXXX-XXXXXXX-X
                              const value = e.target.value.replace(/\D/g, "");
                              let formatted = value;
                              if (value.length > 5) {
                                formatted =
                                  value.slice(0, 5) + "-" + value.slice(5);
                              }
                              if (value.length > 12) {
                                formatted =
                                  formatted.slice(0, 13) +
                                  "-" +
                                  formatted.slice(13);
                              }
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Supplier&apos;s CNIC in XXXXX-XXXXXXX-X format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Enter complete supplier address"
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormDescription>
                        5-500 characters describing complete address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Primary contact number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional email for communication
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Status & Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <Shield className="h-4 w-4" />
                  STATUS & SETTINGS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="is_permanent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Permanent Supplier
                          </FormLabel>
                          <FormDescription>
                            Mark as permanent supplier for long-term
                            partnerships
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field?.value ? true : false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier status" />
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
                                          value === "active"
                                            ? "bg-green-500"
                                            : value === "inactive"
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
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
                </div>
              </div>

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
                      {isEdit ? "Update Supplier" : "Create Supplier"}
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
        title={isEdit ? "Confirm Supplier Update" : "Confirm Supplier Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} a supplier with
                the following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNIC:</span>
                  <span className="font-medium">{formData.cnic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Permanent:</span>
                  <Badge
                    variant="outline"
                    className={
                      formData.is_permanent
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {formData.is_permanent ? "Yes" : "No"}
                  </Badge>
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
                  ? "This will update the supplier information across the system."
                  : "This supplier will be added to your vendor management system."}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating Supplier..."
              : "Creating Supplier..."
            : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your password to confirm this action"
      />
    </>
  );
}
