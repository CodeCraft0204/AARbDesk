"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDemo } from "@/lib/demo-store"
import { CURRENT_USER, QUEUE_STATS } from "@/lib/mock-data"
import { ActionBadge, StageBadge } from "@/components/status-badges"
import { PageHeader, KpiCard } from "@/components/shared/page-header"
import { deadlineMeta, money, shortDate, vehicleTitle } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ArbitrationCase } from "@/lib/types"

type FilterId =
  | "all"
  | "mine"
  | "action"
  | "today"
  | "approaching"
  | "auction"
  | "buyer"
  | "returns"
  | "closed"

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All Cases" },
  { id: "mine", label: "My Cases" },
  { id: "action", label: "Action Required" },
  { id: "today", label: "Due Today" },
  { id: "approaching", label: "Approaching Deadline" },
  { id: "auction", label: "Waiting on Auction" },
  { id: "buyer", label: "Waiting on Buyer" },
  { id: "returns", label: "Returns" },
  { id: "closed", label: "Closed" },
]

function matches(item: ArbitrationCase, filter: FilterId) {
  const due = deadlineMeta(item.deadline)
  if (filter === "all") return item.stage !== "Closed"
  if (filter === "mine") return item.assignedTo === CURRENT_USER.name && item.stage !== "Closed"
  if (filter === "action") return item.actionState === "Seller Action Required" || item.actionState === "Due Today"
  if (filter === "today") return due.isToday
  if (filter === "approaching") return due.isSoon && item.stage !== "Closed"
  if (filter === "auction") return item.actionState === "Waiting on Auction"
  if (filter === "buyer") return item.actionState === "Waiting on Buyer"
  if (filter === "returns") return item.stage === "Repair / Return In Progress"
  return item.stage === "Closed"
}

export function WorkQueue() {
  const { cases } = useDemo()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<FilterId>(searchParams.get("mine") ? "mine" : "all")
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    let list = cases.filter((item) => matches(item, filter))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((item) =>
        `${item.caseNumber} ${item.make} ${item.model} ${item.vin} ${item.buyer} ${item.auction}`
          .toLowerCase()
          .includes(q)
      )
    }
    return [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }, [cases, filter, query])

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <PageHeader
        kicker="Arbitration"
        title="Seller Work Queue"
        description="Stage is where the arbitration is. Action is who owes the next move."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="New" value={String(QUEUE_STATS.newCases)} />
        <KpiCard label="Action Required Today" value={String(QUEUE_STATS.actionRequiredToday)} tone="critical" />
        <KpiCard label="Approaching Deadline" value={String(QUEUE_STATS.approachingDeadline)} tone="warning" />
        <KpiCard label="Waiting on Auction" value={String(QUEUE_STATS.waitingOnAuction)} tone="warning" />
        <KpiCard label="Waiting on Buyer" value={String(QUEUE_STATS.waitingOnBuyer)} />
        <KpiCard label="Open Exposure" value={money(QUEUE_STATS.openExposure)} />
      </div>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "h-7 rounded-md px-2.5 text-[12px] font-medium",
                filter === item.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
              )}
            >
              {item.label}
            </button>
          ))}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search VIN, case ID, auction, buyer..."
            className="ml-auto h-7 w-64 rounded-md border border-input bg-transparent px-2.5 text-[12px] outline-none"
          />
        </div>
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Case</th>
              <th className="px-3 py-2.5 font-medium">Vehicle / VIN</th>
              <th className="px-3 py-2.5 font-medium">Auction</th>
              <th className="px-3 py-2.5 font-medium">Buyer</th>
              <th className="px-3 py-2.5 font-medium">Stage</th>
              <th className="px-3 py-2.5 font-medium">Action</th>
              <th className="px-3 py-2.5 font-medium">Deadline</th>
              <th className="px-3 py-2.5 text-right font-medium">Exposure</th>
              <th className="px-3 py-2.5 font-medium">Assigned To</th>
              <th className="px-4 py-2.5 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const due = deadlineMeta(item.deadline)
              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${item.id}`} className="font-medium text-primary hover:underline">
                      {item.caseNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <div>{vehicleTitle(item.year, item.make, item.model)}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{item.vin}</div>
                  </td>
                  <td className="px-3 py-3">{item.auction}</td>
                  <td className="px-3 py-3">{item.buyer}</td>
                  <td className="px-3 py-3"><StageBadge stage={item.stage} /></td>
                  <td className="px-3 py-3"><ActionBadge action={item.actionState} /></td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{due.dateLabel}</div>
                    <div className={cn("text-[11px]", due.urgency === "critical" ? "font-medium text-red-700" : "text-muted-foreground")}>{due.remaining}</div>
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{item.currentExposure ? money(item.currentExposure) : "-"}</td>
                  <td className="px-3 py-3">{item.assignedTo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{shortDate(item.updatedAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
