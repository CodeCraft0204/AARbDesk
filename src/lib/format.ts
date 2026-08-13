import type { ActionState, ActionTone, CaseStage, IntakeStatus, Priority } from "@/lib/types"

/** Frozen "now" so the demo always shows the same deadlines. */
export const DEMO_NOW = new Date("2026-08-13T13:00:00-04:00")

export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function timeOfDay(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function dateTime(iso: string) {
  return `${shortDate(iso)} ${timeOfDay(iso)}`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function remainingClock(iso: string, now = DEMO_NOW) {
  const ms = new Date(iso).getTime() - now.getTime()
  if (ms < 0) return "Overdue"
  const totalH = Math.floor(ms / 36e5)
  const d = Math.floor(totalH / 24)
  const h = totalH % 24
  if (d > 0) return `${d}d ${h}h remaining`
  if (h > 0) return `${h}h remaining`
  return `${Math.max(1, Math.round(ms / 6e4))}m remaining`
}

export function deadlineMeta(iso: string, now = DEMO_NOW) {
  const due = new Date(iso)
  const ms = due.getTime() - now.getTime()
  const overdue = ms < 0
  const abs = Math.abs(ms)
  const hours = abs / 36e5
  const days = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / 864e5
  )
  const remaining = remainingClock(iso, now)

  const urgency: ActionTone = overdue
    ? "critical"
    : hours <= 8 || days === 0
      ? "critical"
      : days === 1
        ? "warning"
        : "neutral"

  return {
    dateLabel: shortDate(iso),
    remaining,
    label: `${shortDate(iso)} ${remaining}`,
    urgency,
    overdue,
    isToday: days === 0 && !overdue,
    isSoon: days >= 0 && days <= 2,
  }
}

export function actionTone(action: ActionState): ActionTone {
  if (action === "Seller Action Required" || action === "Due Today") return "critical"
  if (action === "Deadline Approaching") return "warning"
  if (action === "Waiting on Auction" || action === "Waiting on Buyer") return "warning"
  if (action === "Waiting on Transport" || action === "Waiting on Internal Team") return "ok"
  return "neutral"
}

export function stageTone(stage: CaseStage): ActionTone {
  if (stage === "Negotiating" || stage === "Investigating") return "info"
  if (stage === "Closed" || stage === "Resolved") return "ok"
  if (stage === "Repair / Return In Progress") return "warning"
  return "neutral"
}

export function intakeTone(status: IntakeStatus): ActionTone {
  if (status === "Needs Review") return "warning"
  if (status === "New") return "info"
  if (status === "Case Created" || status === "Matched") return "ok"
  if (status === "Duplicate") return "neutral"
  return "neutral"
}

export function priorityTone(priority: Priority): ActionTone {
  if (priority === "critical") return "critical"
  if (priority === "high") return "warning"
  return "neutral"
}

export function vehicleTitle(year: number, make: string, model: string, trim?: string) {
  return trim ? `${year} ${make} ${model} ${trim}` : `${year} ${make} ${model}`
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
