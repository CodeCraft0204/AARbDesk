import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? (
          <div className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {kicker}
          </div>
        ) : null}
        <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "critical" | "warning" | "ok" | "info"
}) {
  return (
    <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
      <div className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
          tone === "critical" && "text-red-700",
          tone === "warning" && "text-amber-700",
          tone === "ok" && "text-emerald-700",
          tone === "info" && "text-blue-800"
        )}
      >
        {value}
      </div>
    </div>
  )
}
