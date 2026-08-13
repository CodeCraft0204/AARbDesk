"use client"

import Link from "next/link"
import { useDemo } from "@/lib/demo-store"
import { vehicleTitle } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"
import { StageBadge } from "@/components/status-badges"

export default function VehiclesPage() {
  const { cases } = useDemo()
  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Data" title="Vehicles" description="VIN-centric view of active and recent arbitrations." />
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">VIN</th>
              <th className="px-3 py-2.5 font-medium">Vehicle</th>
              <th className="px-3 py-2.5 font-medium">Case</th>
              <th className="px-3 py-2.5 font-medium">Auction</th>
              <th className="px-4 py-2.5 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-mono text-[12px]">{item.vin}</td>
                <td className="px-3 py-2.5">{vehicleTitle(item.year, item.make, item.model, item.trim)}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/cases/${item.id}`} className="text-primary hover:underline">{item.caseNumber}</Link>
                </td>
                <td className="px-3 py-2.5">{item.auction}</td>
                <td className="px-4 py-2.5"><StageBadge stage={item.stage} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
