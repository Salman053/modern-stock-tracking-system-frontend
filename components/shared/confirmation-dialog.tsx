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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  requiresConfirmation?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  requiresConfirmation = false,
  confirmationText = "",
  confirmationPlaceholder = "Type to confirm...",
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleConfirm = () => {
    if (requiresConfirmation && inputValue !== confirmationText) {
      return;
    }
    onConfirm();
    setInputValue("");
    onOpenChange(false);
  };

  const isConfirmDisabled = requiresConfirmation && inputValue !== confirmationText;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {description}
            
            {requiresConfirmation && (
              <div className="space-y-2">
                <Label htmlFor="confirmation-input">
                  Please type <span className="font-mono text-red-500">{confirmationText}</span> to confirm:
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInputValue("")}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
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