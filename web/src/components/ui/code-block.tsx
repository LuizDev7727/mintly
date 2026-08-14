import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.ComponentProps<"div"> {
  code: string
  language?: string
}

export function CodeBlock({
  className,
  code,
  language = "json",
  ...props
}: CodeBlockProps) {
  const [html, setHtml] = useState("")

  useEffect(() => {
    let cancelled = false

    codeToHtml(code, { lang: language, theme: "min-dark" }).then(
      (result) => {
        if (!cancelled) setHtml(result)
      },
    )

    return () => {
      cancelled = true
    }
  }, [code, language])

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md border [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  )
}
