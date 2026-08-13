import type { ReactNode } from "react"
import type { ActionState, ActionTone, CaseStage } from "@/lib/types"
import { actionTone, stageTone } from "@/lib/format"
import { cn } from "@/lib/utils"

const toneClass: Record<ActionTone, string> = {
  critical: "bg-red-50 text-red-700 ring-red-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  info: "bg-blue-50 text-blue-800 ring-blue-100",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
}

const dotClass: Record<ActionTone, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-400",
  ok: "bg-emerald-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
}

export function StageBadge({ stage }: { stage: CaseStage }) {
  const tone = stageTone(stage)
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium ring-1",
        toneClass[tone]
      )}
    >
      {stage}
    </span>
  )
}

export function ActionBadge({ action }: { action: ActionState }) {
  const tone = actionTone(action)
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-md px-1.5 text-[11px] font-medium ring-1",
        toneClass[tone]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClass[tone])} />
      {action}
    </span>
  )
}

export function ToneBadge({
  tone,
  children,
}: {
  tone: ActionTone
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium ring-1",
        toneClass[tone]
      )}
    >
      {children}
    </span>
  )
}

export function ConfidenceBar({ value }: { value: number }) {
  const tone = value >= 95 ? "ok" : value >= 85 ? "warning" : "critical"
  const bar =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warning"
        ? "bg-amber-500"
        : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${value}%` }} />
      </div>
      <span
        className={cn(
          "text-[11px] font-medium tabular-nums",
          tone === "ok" && "text-emerald-700",
          tone === "warning" && "text-amber-700",
          tone === "critical" && "text-red-700"
        )}
      >
        {value}%
      </span>
    </div>
  )
}
