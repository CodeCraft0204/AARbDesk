"use client"

import Link from "next/link"
import { useDemo } from "@/lib/demo-store"
import { deadlineMeta, money, remainingClock, vehicleTitle } from "@/lib/format"
import { ActionBadge } from "@/components/status-badges"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

export default function DeadlinesPage() {
  const { cases } = useDemo()
  const rows = [...cases]
    .filter((item) => item.stage !== "Closed")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Arbitration" title="Deadlines" description="Response clocks are first-class records. Missed responses lose otherwise defensible claims." />
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {rows.map((item) => {
          const due = deadlineMeta(item.deadline)
          return (
            <Link key={item.id} href={`/cases/${item.id}`} className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-slate-50/80">
              <div>
                <div className="text-[13px] font-medium">{item.caseNumber} | {vehicleTitle(item.year, item.make, item.model)}</div>
                <div className="text-[12px] text-muted-foreground">{item.auction} | {item.assignedTo}</div>
              </div>
              <div className="flex items-center gap-3">
                <ActionBadge action={item.actionState} />
                <div className="w-40 text-right">
                  <div className="text-[13px] font-medium tabular-nums">{money(item.currentExposure)}</div>
                  <div className={cn("text-[11px]", due.urgency === "critical" ? "font-medium text-red-700" : "text-muted-foreground")}>{remainingClock(item.deadline)}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
