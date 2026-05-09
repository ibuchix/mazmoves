import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingOverlayProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingOverlay({ 
  fullScreen = false, 
  message = "Loading..." 
}: LoadingOverlayProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm",
      fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 z-10"
    )}>
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-lg text-[#334155] font-medium">{message}</p>
      )}
    </div>
  );
}