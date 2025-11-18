// components/assign-user-form.tsx
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
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useFetch } from "@/hooks/use-fetch";
import { IBranch } from "@/types";
import { useMutation } from "@/hooks/use-mutation";

const ROLE_CONFIG = {
  "branch-admin": {
    label: "Branch Administrator",
    description: "Manage users and operations within assigned branch",
    color: "bg-blue-100 text-blue-800",
  },
  "super-visor": {
    label: "super-visor",
    description: "Monitor the branch operations and logs",
    color: "bg-green-100 text-green-800",
  },
  staff: {
    label: "Staff Member",
    description: "Standard system access with limited permissions",
    color: "bg-green-100 text-green-800",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to system data",
    color: "bg-gray-100 text-gray-800",
  },
};

export function AssignUserForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState("");
  const [formData, setFormData] =
    React.useState<UserRegistrationFormData | null>(null);

  const { error, data, loading, mutate } = useMutation(
    `${server_base_url}/users/register`,
    {
      credentials: "include",
      onError(error) {
        console.log(error);
      },
      onSuccess: (data) => {
        console.log(data);
      },
    }
  );

  const { data: activeBranches, loading: branchesLoading } = useFetch(
    `${server_base_url}/branches`,
    {
      auto: true,
      method: "GET",
      credentials: "include",
    }
  );

  const form = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      branch_id: "",
      role: "",
      status: "active",
    },
  });

  const onSubmit = (data: UserRegistrationFormData) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    if (!formData) return;

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        branch_id: formData.branch_id,
        status: formData.status,
      };

      await mutate(payload)
        .then(() => {
          toast.success("User Created Successfully", {
            description: `${formData.username} has been assigned as ${
              ROLE_CONFIG[formData.role as keyof typeof ROLE_CONFIG]?.label ||
              formData.role
            }`,
          });
        })
        .catch((e) => {
          toast.error(e.message);
        });

      // form.reset();
      setSelectedRole("");
    } catch (error: any) {
      toast.error("Creation Failed", {
        description:
          error?.message || "Failed to create user. Please try again.",
      });
    } finally {
      setShowConfirmation(false);
      // setFormData(null);
    }
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    form.setValue("role", value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const getRoleDescription = (role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.description || "";
  };

  return (
    <>
      <Card className="w-full 2xl:max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                Assign System User
                <Badge variant="outline" className="ml-2 text-sm">
                  Administrative Action
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Create new user accounts with specific roles and branch
                assignments
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center  gap-2 text-sm font-medium text-muted-foreground my-7 ">
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
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter unique username"
                            {...field}
                            className=""
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
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="user@company.com"
                            {...field}
                            className=""
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

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7  ">
                  <Lock className="h-4 w-4" />
                  SECURITY SETTINGS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create secure password"
                              {...field}
                              className=" pr-10"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              {...field}
                              className=" pr-10"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7  ">
                  <Shield className="h-4 w-4" />
                  SYSTEM ASSIGNMENT
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Branch Assignment
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select branch location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branchesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading branches...
                              </SelectItem>
                            ) : (
                              activeBranches?.data?.map((branch: IBranch) => (
                                <SelectItem
                                  key={branch.id}
                                  value={branch.id.toString()}
                                >
                                  <div className="flex flex-col">
                                    <span>{branch.name}</span>
                                    {branch.address && (
                                      <span className="text-xs text-muted-foreground">
                                        {branch.address}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
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
                        </FormLabel>
                        <Select
                          onValueChange={handleRoleChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className=" text-left ">
                              <SelectValue
                                className="text-left"
                                placeholder="Select access level"
                              />
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
                    <FormLabel>Account Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="">
                          <SelectValue placeholder="Select account status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active - Immediate access
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Archived - No system access
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Active users will receive system access immediately upon
                      creation
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
                  Clear All
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-32 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Create User
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
        onConfirm={handleConfirmCreate}
        title="Confirm User Creation"
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to create a new system user with the following
                details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-medium">{formData.username}</span>
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
                    variant={
                      formData.status === "active" ? "default" : "secondary"
                    }
                  >
                    {formData.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The user will receive system
                access based on their assigned role.
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={loading ? "Creating User..." : "Confirm Creation"}
        requiresConfirmation={true}
        confirmationText="create user"
        confirmationPlaceholder="Type 'create user' to confirm"
      />
    </>
  );
}
