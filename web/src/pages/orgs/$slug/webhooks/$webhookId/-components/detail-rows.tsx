import { CopyButton } from "@/components/ui/copy-button"

const MAX_VALUE_LENGTH = 48

function truncateValue(value: string) {
  if (value.length <= MAX_VALUE_LENGTH) return value
  return `${value.slice(0, 32)}…${value.slice(-10)}`
}

type DetailRowsProps = {
  data: {
    key: string,
    value: string,
  }[]
}

export function DetailRows({ data }: DetailRowsProps) {
  return (
    <div className="divide-y rounded-md border">
      {data.map((item) => {
        const isTruncated = item.value.length > MAX_VALUE_LENGTH

        return (
          <div
            key={item.key}
            className="flex items-center gap-4 px-3 py-2 text-sm"
          >
            <span className="shrink-0 text-muted-foreground">{item.key}</span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <span
                className="min-w-0 truncate text-right font-mono text-xs text-foreground"
                title={isTruncated ? item.value : undefined}
              >
                {truncateValue(item.value)}
              </span>
              {isTruncated && <CopyButton value={item.value} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
