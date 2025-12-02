// components/branch-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard, Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";

export interface Branch {
  id: string;
  name: string;
  status: "active" | "inactive" | "archived";
  country: string;
  city: string;
  address: string;
  is_main_branch: boolean;
  created_at: string;
  updated_at: string;
  active_users_count: number;
}

interface BranchCardProps {
  branch: Branch;
  onView?: () => void;
  className?: string;
  onEdit?: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
  onPayment?: (branch: Branch) => void;
}

export function BranchCard({
  branch,
  className,
  onEdit,
  onDelete,
  onView,
  onPayment,
}: BranchCardProps) {
  const getStatusVariant = (status: Branch["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: Branch["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "archived":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card
      onClick={onView}
      className={`w-full ${
        branch.is_main_branch && "bg-green-500/5"
      } max-w-md hover:shadow-lg cursor-pointer hover:bg-primary/5  transition-all duration-300 ${className}`}
    >
      <CardHeader className="">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg  font-semibold flex items-center gap-2">
            {branch.name}
          </CardTitle>
          <Badge
            variant={getStatusVariant(branch.status)}
            className={`${getStatusColor(branch.status)} capitalize`}
          >
            {branch.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 font-semibold">
          <h3>Active Users : {branch.active_users_count}</h3>
        </div>
        {/* Location Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4" />
            <span className="font-medium">
              {branch.city}, {branch.country}
            </span>
          </div>
          <p className="text-sm text-gray-500 pl-6">{branch.address}</p>
        </div>

        {/* Dates Information */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-medium text-gray-600">Created</p>
            <p>{format(new Date(branch.created_at), "MMM dd, yyyy")}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Updated</p>
            <p>{format(new Date(branch.updated_at), "MMM dd, yyyy")}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete || onPayment) && (
          <div className="flex gap-2 pt-2 justify-end border-t">
            {onEdit && (
              <Button variant={"outline"} onClick={() => onEdit(branch)}>
                <Edit size={18} />
              </Button>
            )}
            {onPayment && (
              <Button variant={"outline"} onClick={() => onPayment(branch)}>
                <CreditCard size={18} />
              </Button>
            )}
            {onDelete && (
              <Button variant={"destructive"} onClick={() => onDelete(branch)}>
                <Trash />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple MapPin Icon component
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
