import { PageHeader } from "@/components/shared/page-header"

const INTEGRATIONS = [
  { name: "Auto Auction Review", status: "Planned", owns: "Website / dealer ecosystem" },
  { name: "HubSpot", status: "Planned", owns: "CRM / sales" },
  { name: "Inbound Arbitration Email", status: "Demo", owns: "AARbDesk intake" },
  { name: "Stripe", status: "Future", owns: "Billing" },
  { name: "Auction APIs", status: "Future", owns: "Lane data" },
  { name: "OpenAI / Claude", status: "Future", owns: "Optional assist" },
]

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-[900px] p-6">
      <PageHeader
        kicker="System"
        title="Integrations"
        description="AARbDesk is the arbitration system of record. Auto Auction Review and HubSpot are integrations, not this database."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((item) => (
          <div key={item.name} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[13px] font-semibold">{item.name}</div>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{item.status}</span>
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">{item.owns}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
