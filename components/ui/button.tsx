import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 active:duration-75",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:scale-105 hover:shadow-md",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:scale-105 hover:shadow-md",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:scale-105 hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 hover:scale-105 hover:shadow-md",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        glow: "hover:shadow-lg hover:shadow-primary/25",
        ripple: "relative overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
}

function Button({
  className,
  variant,
  size,
  animation,
  asChild = false,
  loading = false,
  success = false,
  error = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [showError, setShowError] = React.useState(false)

  React.useEffect(() => {
    if (success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [success])

  React.useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return
    onClick?.(e)
  }

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, animation, className }),
        {
          'animate-bounce': showSuccess,
          'animate-pulse opacity-75': loading,
          'animate-[shake_0.5s_ease-in-out]': showError,
        }
      )}
      onClick={handleClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
