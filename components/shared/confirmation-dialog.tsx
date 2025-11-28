// components/confirmation-dialog.tsx
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password?: string) => void; // Updated to accept password
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  requiresConfirmation?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
  requiresPassword?: boolean;
  passwordLabel?: string;
  disabled?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  disabled = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  requiresConfirmation = false,
  confirmationText = "",
  confirmationPlaceholder = "Type to confirm...",
  requiresPassword = false,
  passwordLabel = "Enter your password to confirm",
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleConfirm = () => {
    if (requiresConfirmation && inputValue !== confirmationText) {
      return;
    }
    if (requiresPassword && password.trim() === "") {
      return;
    }

    // Pass the password to the onConfirm callback
    if (requiresPassword) {
      onConfirm(password); // Password is passed here
    } else {
      onConfirm(); // No password passed
    }

    // Reset form
    setInputValue("");
    setPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  const isConfirmDisabled =
    (requiresConfirmation && inputValue !== confirmationText) ||
    (requiresPassword && password.trim() === "");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 ">
            {description}

            {requiresConfirmation && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="confirmation-input">
                  Please type{" "}
                  <span className="font-mono text-red-500">
                    {confirmationText}
                  </span>{" "}
                  to confirm:
                </Label>
                <Input
                  id="confirmation-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={confirmationPlaceholder}
                  className="mt-2"
                />
              </div>
            )}

            {requiresPassword && (
              <div className="space-y-2 mt-4">
                <Label
                  htmlFor="password-input"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {passwordLabel}
                </Label>
                <div className="relative flex items-center justify-between">
                  <Input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 flex items-center justify-center top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  For security reasons, please confirm your identity.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setInputValue("");
              setPassword("");
              setShowPassword(false);
            }}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled || disabled}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
