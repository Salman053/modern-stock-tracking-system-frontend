
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Building, CheckCircle2 } from "lucide-react";
import { ConfirmationDialog } from "../shared/confirmation-dialog";
import { server_base_url } from "@/constant/server-constants";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import {
  UserProfileFormData,
  userProfileSchema,
} from "@/schema/user-profile-schema";
import { IUser } from "@/types";

interface UserProfileFormProps {
  userData: IUser;
  onUpdateStart?: () => void;
  onUpdateSuccess?: () => void;
  onUpdateError?: () => void;
}

export function UserProfileForm({
  userData,
  onUpdateStart,
  onUpdateSuccess,
  onUpdateError,
}: UserProfileFormProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [formData, setFormData] = React.useState<UserProfileFormData | null>(
    null
  );

  const { loading, mutate } = useMutation(`${server_base_url}/users/update`, {
    credentials: "include",
    method: "POST",
    onError: (error) => {
      toast.error("Update Failed", {
        description:
          error?.message || "Failed to update profile. Please try again.",
      });
      onUpdateError?.();
    },
    onSuccess: (data) => {
      toast.success("Profile Updated Successfully", {
        description: "Your profile has been updated successfully.",
      });
      onUpdateSuccess?.();
    },
  });

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      username: userData.username || "",
      email: userData.email || "",
    },
  });

  
  const hasChanges = form.formState.isDirty;

  const onSubmit = (data: UserProfileFormData) => {
    setFormData(data);
    setShowConfirmation(true);
    onUpdateStart?.();
  };

  const handleConfirm = async (adminPassword: string) => {
    if (!formData) return;

    try {
      
      const payload: any = {
        username: formData.username,
        email: formData.email,
        admin_password: adminPassword, 
      };

      await mutate(payload);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("Update Failed", {
        description:
          error?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">
              {userData.role}
            </Badge>
            <Badge
            className="uppercase"
              variant={userData.status === "active" ? "default" : "secondary"}
            >
              {userData.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  ACCOUNT INFORMATION
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
                            placeholder="Enter your username"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Your unique identifier in the system
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
                            placeholder="your.email@company.com"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Important for notifications and recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Read-only Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member since</span>
                  </div>
                  <p className="text-sm font-medium">
                    {userData.created_at
                      ? new Date(userData.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Branch Name</span>
                  </div>
                  <p className="text-sm font-medium">
                    {userData.branch_name || "Not assigned"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={loading || !hasChanges}
                  className="min-w-24"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className="min-w-32 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Update Profile
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
        title="Confirm Profile Update"
        description={
          formData ? (
            <div className="space-y-3">
              <p>
                You are about to update your profile with the following changes:
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
              </div>
              <p className="text-sm text-muted-foreground">
                Please verify that all information is correct before proceeding.
              </p>
            </div>
          ) : (
            "Loading changes..."
          )
        }
        confirmText={loading ? "Updating Profile..." : "Confirm Update"}
        requiresPassword
        passwordLabel="Enter your current password to confirm changes"
      />
    </>
  );
}
