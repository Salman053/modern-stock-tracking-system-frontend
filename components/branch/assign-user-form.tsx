"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserRegistrationFormData,
  userRegistrationSchema,
} from "@/schema/user-assign-form-schema";
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
  Eye,
  EyeOff,
  Loader2,
  Building,
  Shield,
  User,
  Mail,
  Lock,
  Edit,
  Plus,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { useAuth } from "@/hooks/use-auth";

interface AssignUserFormProps {
  mode?: "create" | "edit";
  initialData?: UserRegistrationFormData & { id?: string };
  onSuccess?: () => void;
}

const ROLE_CONFIG = {
  "sales-manager": {
    label: "Sales Administrator",
    description: "Manage sales and operations within assigned branch",
    color: "bg-blue-100 text-blue-800",
  },
};

const STATUS_CONFIG = {
  active: {
    label: "Active",
    description: "User can access the system immediately",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  inactive: {
    label: "Inactive",
    description: "User account is temporarily disabled",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  archived: {
    label: "Archived",
    description: "User account is archived",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

const createUserSchema = userRegistrationSchema;
const editUserSchema = userRegistrationSchema.omit({
  password: true,
  confirmPassword: true,
});

export function AssignUserForm({
  mode = "create",
  initialData,
  onSuccess,
}: AssignUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] =
    React.useState<UserRegistrationFormData | null>(null);
  const { user } = useAuth();
  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/users/update/${initialData?.id}`
      : `${server_base_url}/users/register`,
    {
      credentials: "include",
      method: "POST",
      onError: (error) => {
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${isEdit ? "update" : "create"} user. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit ? "User Updated Successfully" : "User Created Successfully",
          {
            description: `${formData?.username} has been ${
              isEdit ? "updated" : "created"
            } successfully.`,
          }
        );
        handleReset();
        onSuccess?.();
      },
    }
  );

  const formSchema = isEdit ? editUserSchema : createUserSchema;

  const form = useForm<UserRegistrationFormData>({
    resolver: zodResolver(
      formSchema.omit({
        branch_id: true,
      }) as any
    ),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      confirmPassword: "",
      branch_id: initialData?.branch_id,
      role: initialData?.role || "",
      status: initialData?.status || "active",
    },
  });

  const onSubmit = (data: UserRegistrationFormData) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (password: string) => {
    if (!formData || !password) {
      toast.warning("Please provide admin password");
      return;
    }

    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        branch_id: user?.branch_id,
        status: formData.status,
        admin_password: password,
      };

      if (!isEdit) {
        payload.password = formData.password;
      }

      if (isEdit && initialData?.id) {
        payload.user_id = initialData.id;
      }

      await mutate(payload);
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${isEdit ? "update" : "create"} user. Please try again.`,
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleReset = () => {
    form.reset({
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      confirmPassword: "",
      role: initialData?.role || "",
      status: initialData?.status || "active",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData(null);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const getStatusDescription = (status: keyof typeof STATUS_CONFIG) => {
    return STATUS_CONFIG[status]?.description || "";
  };

  React.useEffect(() => {}, [form.formState.isValid, form.formState.errors]);

  return (
    <>
      <Card className="w-full 2xl:max-w-4xl mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update User" : "Assign System User"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "Administrative Action"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update user details and permissions"
                  : "Create new user accounts with specific roles and branch assignments"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Username
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter unique username"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          3-20 characters, letters, numbers, and underscores
                          only
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
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Please make sure to add the correct email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security Section - Only show for create mode */}
              {!isEdit && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                    <Lock className="h-4 w-4" />
                    SECURITY SETTINGS
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Password
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create secure password"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Minimum 8 characters with uppercase, lowercase, and
                            number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Confirm Password
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter password"
                                {...field}
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={toggleConfirmPasswordVisibility}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Must match the password above
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Assignment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <Shield className="h-4 w-4" />
                  SYSTEM ASSIGNMENT
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Branch Assignment - Display Only */}
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Branch Assignment
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={user?.branch_name || "Current Branch"}
                        disabled
                        className="bg-muted"
                      />
                    </FormControl>
                  </FormItem>

                  {/* Hidden branch_id field for form validation */}
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            type="hidden"
                            {...field}
                            value={String(user?.branch_id || "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          System Role
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ROLE_CONFIG).map(
                              ([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex flex-col">
                                    <span>{config.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {config.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Status Section */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account Status
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account status" />
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
                                        : value === "archived"
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
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
                      {isEdit ? "Update User" : "Create User"}
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
        title={isEdit ? "Confirm User Update" : "Confirm User Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} a user with the
                following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-medium">{formData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">{user?.branch_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge
                    variant="outline"
                    className={
                      ROLE_CONFIG[formData.role as keyof typeof ROLE_CONFIG]
                        ?.color
                    }
                  >
                    {
                      ROLE_CONFIG[formData.role as keyof typeof ROLE_CONFIG]
                        ?.label
                    }
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
                  ? "This will update the user configuration across the system."
                  : "This action cannot be undone. The user will receive system access based on their assigned role."}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating User..."
              : "Creating User..."
            : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your password to confirm this action"
      />
    </>
  );
}
