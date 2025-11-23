import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface InfoPopoverProps {
  icon?: ReactNode;
  title?: string;
  content: string | ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function InfoPopover({
  icon,
  title,
  content,
  className = "",
  side = "top",
  align = "center",
  variant = "ghost",
  size = "icon"
}: InfoPopoverProps) {
  const defaultIcon = (
    <svg 
      className="h-4 w-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`p-2  ${className}`}
        >
          {icon || defaultIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 mr-2" 
        side={side} 
        align={align}
      >
        {title && (
          <h4 className="font-semibold text-lg mb-2 text-gray-900">{title}</h4>
        )}
        <div className="text-sm text-gray-600">
          {content}
        </div>
      </PopoverContent>
    </Popover>
  );
}