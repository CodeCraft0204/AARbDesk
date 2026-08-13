import { ORGANIZATION } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"

const ROWS = [
  { label: "Organization", value: ORGANIZATION.name },
  { label: "Rooftops", value: "Atlanta North | Atlanta South | Nashville | Dallas" },
  { label: "Monitored inbox", value: "arbitration@exampledealer.com" },
  { label: "Product module", value: "Seller (Buyer and Fleet coming later)" },
  { label: "Demo data", value: "Synthetic only - no live dealer or customer records" },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <PageHeader kicker="System" title="Settings" description="Demo shell only. Authentication, tenancy, and production inbox wiring stay inside the engagement." />
      <div className="mt-5 divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 px-4 py-3 text-[13px]">
            <div className="text-muted-foreground">{row.label}</div>
            <div className="font-medium">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
