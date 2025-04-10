import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const toastVariants = cva(
  "relative flex items-center border-l-4 p-4 my-4 mx-6",
  {
    variants: {
      variant: {
        default:
          "bg-white border-gray-600 text-gray-700",
        success:
          "bg-[#1AA49A]/10 border-[#1AA49A] text-[#1AA49A]",
        error:
          "bg-red-50 border-red-500 text-red-700",
        warning:
          "bg-yellow-50 border-yellow-500 text-yellow-700",
        info:
          "bg-blue-50 border-blue-500 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, message, onClose, autoClose = true, duration = 5000, ...props }, ref) => {
    React.useEffect(() => {
      if (autoClose && message) {
        const timer = setTimeout(() => {
          if (onClose) onClose()
        }, duration)
        
        return () => clearTimeout(timer)
      }
    }, [message, autoClose, duration, onClose])

    return message ? (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex-shrink-0 mr-3">
          {variant === 'success' && (
            <svg className="h-5 w-5 text-[#1AA49A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
          )}
          {variant === 'error' && (
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          )}
          {variant === 'warning' && (
            <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          )}
          {variant === 'info' && (
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          )}
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className={cn(
              "ml-3 flex-shrink-0",
              variant === 'success' && "text-[#1AA49A] hover:text-[#1AA49A]/80",
              variant === 'error' && "text-red-500 hover:text-red-700",
              variant === 'warning' && "text-yellow-500 hover:text-yellow-700",
              variant === 'info' && "text-blue-500 hover:text-blue-700",
              variant === 'default' && "text-gray-500 hover:text-gray-700"
            )}
            aria-label="Luk besked"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    ) : null
  }
)
Toast.displayName = "Toast"

export { toastVariants } 