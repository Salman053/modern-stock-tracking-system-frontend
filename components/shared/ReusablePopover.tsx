import { ReactNode, FC } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReusablePopoverProps {
  triggerIcon?: ReactNode;
  actions: Array<{
    label: string;
    onClick: (data: any) => void;
    icon?: ReactNode;
    className?: string;
    disabled?: boolean;
    variant?: "default" | "destructive" | "outline";
  }>;
  rowData?: any;
  PopoverState?: (state: boolean) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  triggerVariant?: "ghost" | "outline" | "secondary";
}

const ReusablePopover: FC<ReusablePopoverProps> = ({
  triggerIcon = <MoreHorizontal className="h-4 w-4" />,
  actions,
  PopoverState = () => {},
  rowData,
  align = "end",
  side = "bottom",
  triggerVariant = "ghost",
}) => {
  return (
    <DropdownMenu onOpenChange={PopoverState}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          size="sm"
          className="h-8 w-8 p-0 data-[state=open]:bg-accent"
        >
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        className="w-48 p-2 rounded-lg shadow-lg border"
      >
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={action.label}
            className={cn(
              "flex items-start gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors",
              "focus:bg-accent focus:text-accent-foreground",
              "hover:bg-accent hover:text-accent-foreground",
              action.variant === "destructive" && 
                "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive",
              action.disabled && 
                "opacity-50 pointer-events-none text-muted-foreground",
              action.className
            )}
            onClick={() => !action.disabled && action.onClick(rowData)}
            disabled={action.disabled}
          >
            {action.icon && (
              <div className="flex-shrink-0 w-4 h-4">
                {action.icon}
              </div>
            )}
            <span className="capitalize  ">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReusablePopover;