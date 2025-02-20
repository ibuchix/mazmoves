
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-[#040480] px-4 py-2 text-sm font-montserrat font-semibold text-white transition-colors hover:bg-[#1f3dd2] focus:outline-none focus:ring-2 focus:ring-[#1f3dd2] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mt-2",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

