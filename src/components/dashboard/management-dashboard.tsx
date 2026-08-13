"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { AUCTION_RESULTS, DASHBOARD_STATS } from "@/lib/mock-data"
import { useDemo } from "@/lib/demo-store"
import { deadlineMeta, money, vehicleTitle } from "@/lib/format"
import { ActionBadge, StageBadge } from "@/components/status-badges"
import { PageHeader, KpiCard } from "@/components/shared/page-header"

const STAGES = ["New", "Under Review", "Investigating", "Negotiating", "Repair / Return In Progress", "Resolved", "Closed"] as const

export function ManagementDashboard() {
  const { cases, inbox } = useDemo()
  const open = cases.filter((item) => item.stage !== "Closed")
  const attention = open.filter(
    (item) => item.actionState === "Seller Action Required" || item.actionState === "Due Today"
  )
  const upcoming = [...open].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 5)
  const recent = [...cases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
  const byStage = STAGES.map((stage) => ({
    stage,
    count: cases.filter((item) => item.stage === stage).length,
  }))
  const maxStage = Math.max(1, ...byStage.map((row) => row.count))
  const pending = inbox.filter((item) => item.status === "New" || item.status === "Needs Review").length

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <PageHeader
        kicker="Overview"
        title="Seller dashboard"
        description="Workload, financial exposure, and arbitration results across Premier Automotive Group."
      />

      <Link
        href="/inbox"
        className="flex items-center justify-between gap-4 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 hover:ring-foreground/20"
      >
        <div>
          <div className="text-[13px] font-medium">{pending} auction emails ready to process</div>
          <div className="text-[12px] text-muted-foreground">
            Process a Manheim notice into a structured seller case with confidence review.
          </div>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground">
          Open inbox
        </span>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Open Cases" value={String(DASHBOARD_STATS.openCases)} />
        <KpiCard label="Action Required Today" value={String(DASHBOARD_STATS.actionRequiredToday)} tone="critical" />
        <KpiCard label="Open Financial Exposure" value={money(DASHBOARD_STATS.openExposure)} />
        <KpiCard label="Settlements This Month" value={money(DASHBOARD_STATS.settlementsThisMonth)} />
        <KpiCard label="Money Saved" value={money(DASHBOARD_STATS.moneySaved)} tone="ok" />
        <KpiCard label="Average Resolution" value={`${DASHBOARD_STATS.avgResolutionDays} days`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Seller Work Queue" href="/cases">
          {attention.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/cases/${item.id}`} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-slate-50/80">
              <div>
                <div className="text-[13px] font-medium">{vehicleTitle(item.year, item.make, item.model)}</div>
                <div className="text-[12px] text-muted-foreground">{item.caseNumber} ... {item.auction}</div>
              </div>
              <ActionBadge action={item.actionState} />
            </Link>
          ))}
        </Panel>
        <Panel title="Upcoming Deadlines" href="/deadlines">
          {upcoming.map((item) => {
            const due = deadlineMeta(item.deadline)
            return (
              <Link key={item.id} href={`/cases/${item.id}`} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-slate-50/80">
                <div>
                  <div className="text-[13px] font-medium">{item.caseNumber}</div>
                  <div className="text-[12px] text-muted-foreground">{due.remaining}</div>
                </div>
                <div className="text-right text-[13px] font-medium tabular-nums">{money(item.currentExposure)}</div>
              </Link>
            )
          })}
        </Panel>
        <Panel title="Exposure by Auction" href="/reports">
          <table className="w-full text-[13px]">
            <tbody>
              {AUCTION_RESULTS.map((row) => (
                <tr key={row.auction} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">{row.auction}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{money(row.exposure)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Cases by Stage" href="/cases">
          <div className="space-y-2 px-4 py-3">
            {byStage.map((row) => (
              <div key={row.stage}>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span>{row.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{row.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${(row.count / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Recent Cases" href="/cases">
        {recent.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-slate-50/80">
            <div>
              <div className="text-[13px] font-medium">{item.caseNumber} ... {vehicleTitle(item.year, item.make, item.model)}</div>
              <div className="text-[12px] text-muted-foreground">{item.buyer} ... {item.auction}</div>
            </div>
            <StageBadge stage={item.stage} />
          </Link>
        ))}
      </Panel>
    </div>
  )
}

function Panel({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        <Link href={href} className="text-[12px] font-medium text-primary">View</Link>
      </div>
      {children}
    </section>
  )
}
