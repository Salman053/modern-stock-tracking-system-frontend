
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  Lock,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-mutation";
import { server_base_url } from "@/constant/server-constants";


const passwordUpdateSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    .regex(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;

interface PasswordUpdateFormProps {
  userId?: string;
  userName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  apiEndpoint?: string;
  requireCurrentPassword?: boolean;
  title?: string;
  description?: string;
}

const PASSWORD_STRENGTH_INDICATOR = {
  weak: { color: "bg-red-500", text: "Weak", description: "Easy to crack" },
  medium: { color: "bg-yellow-500", text: "Medium", description: "Could be stronger" },
  strong: { color: "bg-green-500", text: "Strong", description: "Good security" },
  veryStrong: { color: "bg-blue-500", text: "Very Strong", description: "Excellent security" },
};

export function PasswordUpdateForm({
  userId,
  userName,
  onSuccess,
  onCancel,
  apiEndpoint = `${server_base_url}/users/password`,
  requireCurrentPassword = false,
  title = "Update Password",
  description = "Change your account password securely",
}: PasswordUpdateFormProps) {
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState<keyof typeof PASSWORD_STRENGTH_INDICATOR>("weak");

  const { loading, mutate } = useMutation(apiEndpoint, {
    credentials: "include",
    method: "POST",
    onError: (error:any) => {
      toast.error("Password Update Failed", {
        description: error?.message || "Failed to update password. Please try again.",
      });
    },
    onSuccess: () => {
      toast.success("Password Updated Successfully", {
        description: "Your password has been changed securely.",
      });
      form.reset();
      onSuccess?.();
    },
  });

  const form = useForm<PasswordUpdateFormData & { currentPassword?: string }>({
    resolver: zodResolver(
      requireCurrentPassword 
        ? passwordUpdateSchema.extend({
            currentPassword: z.string().min(1, "Current password is required"),
          })
        : passwordUpdateSchema
    ),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      currentPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");

  
  React.useEffect(() => {
    if (!newPassword) {
      setPasswordStrength("weak");
      return;
    }

    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) score++;
    if (newPassword.length >= 16) score++;

    if (score <= 2) setPasswordStrength("weak");
    else if (score <= 4) setPasswordStrength("medium");
    else if (score <= 6) setPasswordStrength("strong");
    else setPasswordStrength("veryStrong");
  }, [newPassword]);

  const onSubmit = (data: PasswordUpdateFormData & { currentPassword?: string }) => {
    setShowConfirmation(true);
  };

  const handleConfirm = async (adminPassword: string) => {
    const formData = form.getValues();
    
    try {
      const payload: any = {
        password: formData.newPassword,
        admin_password: adminPassword,
        user_id:userId
      };

      if (requireCurrentPassword) {
        payload.currentPassword = formData.currentPassword;
      }

      if (userId) {
        payload.user_id = userId;
      }

      await mutate(payload);
    } catch (error: any) {
      toast.error("Password Update Failed", {
        description: error?.message || "Failed to update password. Please try again.",
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);

  const getPasswordRequirements = () => {
    const password = form.watch("newPassword") || "";
    return [
      { met: password.length >= 8, text: "At least 8 characters" },
      { met: /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: /[a-z]/.test(password), text: "One lowercase letter" },
      { met: /[0-9]/.test(password), text: "One number" },
      { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: "One special character" },
    ];
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            {title}
            <Badge variant="outline" className="text-xs">
              Secure
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">
            {description}
            {userName && (
              <span className="block mt-1 font-medium text-foreground">
                for <span className="text-blue-600">{userName}</span>
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Current Password (if required) */}
              {requireCurrentPassword && (
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Current Password
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            {...field}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleCurrentPasswordVisibility}
                          >
                            {showCurrentPassword ? (
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
              )}

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      New Password
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Create new secure password"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={toggleNewPasswordVisibility}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Password Strength:</span>
                          <span className={`font-medium ${
                            passwordStrength === "weak" ? "text-red-600" :
                            passwordStrength === "medium" ? "text-yellow-600" :
                            passwordStrength === "strong" ? "text-green-600" : "text-blue-600"
                          }`}>
                            {PASSWORD_STRENGTH_INDICATOR[passwordStrength].text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              PASSWORD_STRENGTH_INDICATOR[passwordStrength].color
                            }`}
                            style={{
                              width: `${
                                passwordStrength === "weak" ? 25 :
                                passwordStrength === "medium" ? 50 :
                                passwordStrength === "strong" ? 75 : 100
                              }%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {PASSWORD_STRENGTH_INDICATOR[passwordStrength].description}
                        </p>
                      </div>
                    )}

                    {/* Password Requirements */}
                    <div className="space-y-1 mt-2">
                      {getPasswordRequirements().map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={req.met ? "text-green-600" : "text-gray-500"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm New Password
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800">Security Notice</p>
                    <p className="text-xs text-blue-700">
                      For security reasons, please ensure you safely communicate the new password to the user. 
                      We recommend using secure channels and encouraging the user to change their password after first login.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="min-w-20"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-28 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
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
        onConfirm={(password: any) => handleConfirm(password as string)}
        title="Confirm Password Update"
        description={
          <div className="space-y-3">
            <p className="font-medium text-amber-800">
              You are about to change the password for <span className="text-blue-600">{userName || "this user"}</span>
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800">Important Security Instructions</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Safely communicate the new password to the authentic user</li>
                    <li>Use encrypted channels or secure communication methods</li>
                    <li>Do not share passwords over unsecured platforms</li>
                    <li>Advise the user to change their password after first login</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This action will immediately invalidate all existing sessions and require the user to login with the new password.
            </p>
          </div>
        }
        confirmText={loading ? "Updating Password..." : "Confirm Update"}
        requiresPassword={true}
        passwordLabel="Enter your admin password to confirm password change"
        variant="default"
      />
    </>
  );
}
