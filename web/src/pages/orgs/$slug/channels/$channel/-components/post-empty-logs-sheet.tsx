import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { motion, useReducedMotion } from "framer-motion"

const ROWS = [
  { width: "72%", delay: 0 },
  { width: "54%", delay: 0.25 },
  { width: "63%", delay: 0.5 },
]

function WaitingIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative w-56" aria-hidden="true">
      {/* cartões empilhados ao fundo */}
      <div className="absolute inset-x-4 -top-3 h-10 rounded-xl border bg-card/40" />
      <div className="absolute inset-x-2 -top-1.5 h-10 rounded-xl border bg-card/70" />

      {/* cartão principal com as linhas de log */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-2.5">
          {ROWS.map((row, index) => (
            <motion.div
              key={row.width}
              className="flex items-center gap-2"
              initial={{ opacity: 0.25 }}
              animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 0.9, 0.25] }}
              transition={{
                duration: 2.4,
                delay: row.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <span className="size-5 shrink-0 rounded-md bg-muted" />
              <div className="flex flex-1 flex-col gap-1">
                <span
                  className="h-2 rounded-full bg-muted"
                  style={{ width: row.width }}
                />
                {index === 0 && (
                  <span className="h-1.5 w-1/3 rounded-full bg-muted/60" />
                )}
              </div>
            </motion.div>
          ))}

          {/* linha "esperando": três pontinhos pulsando */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="relative flex size-5 shrink-0 items-center justify-center">
              <motion.span
                className="absolute size-5 rounded-full bg-primary/30"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [0.6, 1.4], opacity: [0.8, 0] }
                }
                transition={{
                  duration: 1.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
              />
              <span className="size-2 rounded-full bg-primary" />
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="size-1.5 rounded-full bg-muted-foreground/60"
                  animate={
                    reduceMotion ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }
                  }
                  transition={{
                    duration: 1,
                    delay: dot * 0.15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* brilho que varre o cartão */}
        {!reduceMotion && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-foreground/5 to-transparent"
            initial={{ x: "-120%" }}
            animate={{ x: "420%" }}
            transition={{
              duration: 2.8,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.8,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* sombra no chão */}
      <div className="mx-auto mt-4 h-2 w-32 rounded-full bg-foreground/5 blur-sm" />
    </div>
  )
}

export function PostEmptyLogsSheet() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia className="mb-6">
          <WaitingIllustration />
        </EmptyMedia>
        <EmptyTitle>Waiting for the first event</EmptyTitle>
        <EmptyDescription>
          Nothing has run for this post yet. Each step of the pipeline will show
          up here as soon as it starts.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
