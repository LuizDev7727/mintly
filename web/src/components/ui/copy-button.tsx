import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  value: string
}

export function CopyButton({
  value,
  className,
  size = "icon-sm",
  variant = "outline",
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("shrink-0", className)}
      onClick={handleCopy}
      aria-label={children ? undefined : "Copy to clipboard"}
      {...props}
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {children}
    </Button>
  )
}
