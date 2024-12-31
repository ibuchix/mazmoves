import { Toast } from "./Toast"
import { ToastAction } from "./ToastAction"
import { ToastClose } from "./ToastClose"
import { ToastDescription } from "./ToastDescription"
import { ToastProvider } from "./ToastProvider"
import { ToastTitle } from "./ToastTitle"
import { ToastViewport } from "./ToastViewport"

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
export type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}