"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function Breadcrumb({ className }: { className?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Remove role from segments for display
  const displaySegments = segments.slice(1); // Remove the first segment (role)

  // Home href based on user role
  const homeHref = user?.role ? `/${user.role}/dashboard` : "/";

  return (
    <nav
      aria-label="breadcrumb"
      className={cn(
        "flex items-center py-4 bg-background/10 space-x-1 text-sm",
        className
      )}
    >
      {/* Home Icon */}
      <Link
        href={homeHref}
        className="flex items-center text-muted-foreground hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {displaySegments.map((seg, idx) => {
        const isLast = idx === displaySegments.length - 1;

        return (
          <div key={idx} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {capitalize(seg.replace(/-/g, " "))}
              </span>
            ) : (
              <button
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {capitalize(seg.replace(/-/g, " "))}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
