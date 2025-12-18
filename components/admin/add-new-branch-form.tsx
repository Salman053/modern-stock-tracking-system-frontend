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
  Building,
  MapPin,
  Globe,
  Home,
  Edit,
  Plus,
} from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { Switch } from "@/components/ui/switch";
import { branchSchema, BranchSchemaType } from "@/schema/add-new-branch-schema";

interface BranchFormProps {
  mode?: "create" | "edit";
  initialData?: BranchSchemaType & { id?: string };
  onSuccess?: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    description: "Branch is operational and accessible",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  "In-active": {
    label: "Inactive",
    description: "Branch is temporarily disabled",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  archived: {
    label: "Archived",
    description: "Branch is permanently deactivated",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function BranchForm({
  mode = "create",
  initialData,
  onSuccess,
}: BranchFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<BranchSchemaType | null>(null);

  const isEdit = mode === "edit";

  const { loading, mutate } = useMutation(
    isEdit
      ? `${server_base_url}/branches/${initialData?.id}`
      : `${server_base_url}/branches`,
    {
      credentials: "include",
      method: isEdit ? "PATCH" : "POST",
      onError: (error) => {
        toast.error(isEdit ? "Update Failed" : "Creation Failed", {
          description:
            error?.message ||
            `Failed to ${
              isEdit ? "update" : "create"
            } branch. Please try again.`,
        });
      },
      onSuccess: (data) => {
        toast.success(
          isEdit
            ? "Branch Updated Successfully"
            : "Branch Created Successfully",
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

  const form = useForm<any>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData || {
      name: "",
      country: "",
      city: "",
      address: "",
      isMain: false,
      status: "active",
    },
  });

  const onSubmit = (data: any) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async (password: string) => {
    if (!formData || !password) return;

    try {
      await mutate({
        ...formData,
        is_main_branch: formData.isMain,
        password: password,
      });
    } catch (error: any) {
      toast.error(isEdit ? "Update Failed" : "Creation Failed", {
        description:
          error?.message ||
          `Failed to ${isEdit ? "update" : "create"} branch. Please try again.`,
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
      <Card className="w-full 2xl:max-w-4xl mx-auto">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isEdit ? "Update Branch" : "Create New Branch"}
                <Badge variant="outline" className="ml-2 text-sm">
                  {isEdit ? "Edit Mode" : "Administrative Action"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {isEdit
                  ? "Update branch details and configuration"
                  : "Add new branch location to your business network"}
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
                  <Building className="h-4 w-4" />
                  BRANCH INFORMATION
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Branch Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter branch name" {...field} />
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
                    name="isMain"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-base">
                            <Home className="h-4 w-4" />
                            Main Branch
                          </FormLabel>
                          <FormDescription>
                            Designate this as the primary headquarters
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground my-7">
                  <MapPin className="h-4 w-4" />
                  LOCATION DETAILS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Country
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter country" {...field} />
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormDescription>
                          3-20 characters, letters, numbers, and underscores
                          only
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
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter complete street address"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        3-200 characters, letters, numbers, and underscores only
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
                    <FormLabel>Branch Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch status" />
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
                                        : value === "In-active"
                                        ? "bg-yellow-500"
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
                      {isEdit ? "Update Branch" : "Create Branch"}
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
        title={isEdit ? "Confirm Branch Update" : "Confirm Branch Creation"}
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to {isEdit ? "update" : "create"} a branch with
                the following details:
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">
                    {formData.city}, {formData.country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Main Branch:</span>
                  <Badge variant={formData.isMain ? "default" : "secondary"}>
                    {formData.isMain ? "Yes" : "No"}
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
                {formData.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {formData.address}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "This will update the branch configuration across the system."
                  : "This action cannot be undone. The branch will be added to your network."}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText={
          loading
            ? isEdit
              ? "Updating Branch..."
              : "Creating Branch..."
            : "Confirm"
        }
        requiresPassword={true}
        passwordLabel="Enter your password to delete this branch"
      />
    </>
  );
}
