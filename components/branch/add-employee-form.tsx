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
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  IdCard,
  Building2,
  DollarSign,
  Edit,
  Plus,
  Shield,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { employeeSchema, EmployeeSchemaType } from "@/schema/employee-schema";

interface EmployeeFormProps {
  mode?: "create" | "edit";
  initialData?: EmployeeSchemaType & { id?: string };
  onSuccess?: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    description: "Employee is currently working",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  inactive: {
    label: "Inactive",
    description: "Employee is no longer working",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  suspended: {
    label: "Archived",
    description: "Employee is temporarily archived",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

const DESIGNATION_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "sales_associate", label: "Sales Associate" },
  { value: "store_supervisor", label: "Store Supervisor" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "accountant", label: "Accountant" },
  { value: "admin", label: "Administrator" },
  { value: "driver", label: "Driver" },
  { value: "helper", label: "Helper" },
];

export function EmployeeForm({
  mode = "create",
  initialData,
  onSuccess,
}: EmployeeFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<EmployeeSchemaType | null>(
    null
  );

  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/employees/${initialData?.id}`
      : `${server_base_url}/employees`,
    {
      credentials: "include",
      method: isEdit ? "PATCH" : "POST",
      onError: (error) => {
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${
              isEdit ? "update" : "create"
            } employee. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Employee Updated Successfully"
            : "Employee Created Successfully",
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

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(employeeSchema as any),
    defaultValues: (initialData && {
      ...initialData,
      salary: Number(initialData.salary),
      is_permanent: initialData.is_permanent ? true : false,
    }) || {
      name: "",
      address: "",
      phone: "",
      email: "",
      designation: "",
      cnic: "",
      is_permanent: true,
      salary: "" as any,
      status: "active",
    },
  });

  const onSubmit = (data: EmployeeSchemaType) => {
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
          } employee. Please try again.`,
      });
    } finally {
      setShowConfirmation(false);
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
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Employee" : "Add New Employee"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "HR Action"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update employee details and employment information"
                  : "Add new employee to your organization"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <User className="h-4 w-4" />
                  PERSONAL INFORMATION
                </div>
                <div className="grid grid-cols-2 gap-4 ">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter employee full name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          2-100 characters for employee name
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
                            placeholder="00000-0000000-0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 13) {
                                let formatted = value;
                                if (value.length > 5) {
                                  formatted = `${value.slice(
                                    0,
                                    5
                                  )}-${value.slice(5)}`;
                                }
                                if (value.length > 12) {
                                  formatted = `${value.slice(
                                    0,
                                    5
                                  )}-${value.slice(5, 12)}-${value.slice(12)}`;
                                }
                                field.onChange(formatted);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          13-digit CNIC number without dashes
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
                          placeholder="Enter complete residential address"
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormDescription>
                        Complete residential address of the employee
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
                          <Input
                            placeholder="0300-1234567"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 11) {
                                let formatted = value;
                                if (value.length > 4) {
                                  formatted = `${value.slice(
                                    0,
                                    4
                                  )}-${value.slice(4)}`;
                                }
                                field.onChange(formatted);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          11-digit phone number with country code
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
                            placeholder="employee@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Official email address for communication
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <Briefcase className="h-4 w-4" />
                  EMPLOYMENT INFORMATION
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Designation
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DESIGNATION_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Employee's job title and role
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Salary
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Gross monthly salary in PKR
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_permanent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Permanent Employee
                          </FormLabel>
                          <FormDescription>
                            Check if employee is permanent, otherwise considered
                            contractual
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment status" />
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
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
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
                      {isEdit ? "Update Employee" : "Create Employee"}
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
        title={isEdit ? "Confirm Employee Update" : "Confirm Employee Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} an employee with
                the following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-medium capitalize">
                    {DESIGNATION_OPTIONS.find(
                      (d) => d.value === formData.designation
                    )?.label || formData.designation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="font-medium">
                    Rs. {formData.salary?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Employment Type:
                  </span>
                  <span className="font-medium">
                    {formData.is_permanent ? "Permanent" : "Contractual"}
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
                  ? "This will update the employee information across the system."
                  : "This action will create a new employee record in the system."}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating Employee..."
              : "Creating Employee..."
            : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your password to confirm this action"
      />
    </>
  );
}
