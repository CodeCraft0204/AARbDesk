"use client"

import Link from "next/link"
import { useDemo } from "@/lib/demo-store"
import { money, vehicleTitle } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"

const STEPS = [
  "Return Authorized",
  "Transportation Arranged",
  "Vehicle Picked Up",
  "Vehicle In Transit",
  "Vehicle Received",
  "Condition Confirmed",
  "Return Costs Entered",
  "Case Closed",
]

export default function ReturnsPage() {
  const { cases } = useDemo()
  const rows = cases.filter((item) => item.stage === "Repair / Return In Progress" || item.resolution === "Vehicle Returned / Unwound")

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Arbitration" title="Returns / Unwinds" description="Track transportation until the vehicle is back under seller control." />
      <div className="mt-5 space-y-3">
        {rows.map((item) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="block rounded-xl bg-card p-4 ring-1 ring-foreground/10 hover:ring-foreground/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold">{item.caseNumber} | {vehicleTitle(item.year, item.make, item.model)}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{item.auction} | exposure {money(item.currentExposure)}</div>
              </div>
              <div className="text-[12px] font-medium">{item.returnStep || "Return Authorized"}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {STEPS.map((step) => (
                <span key={step} className={`rounded px-1.5 py-0.5 text-[10px] ${step === item.returnStep ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {step}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
