import { AUCTION_RESULTS, DASHBOARD_STATS, LOCATIONS, USERS } from "@/lib/mock-data"
import { money } from "@/lib/format"
import { PageHeader, KpiCard } from "@/components/shared/page-header"

const CLAIM_TYPES = [
  { type: "Mechanical / Engine", volume: 18, saved: 21400 },
  { type: "Structural", volume: 7, saved: 18200 },
  { type: "Body / Paint", volume: 9, saved: 8600 },
  { type: "Mechanical / Drivetrain", volume: 6, saved: 12400 },
  { type: "Mechanical / Transmission", volume: 7, saved: 11000 },
]

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <PageHeader kicker="Management" title="Reports" description="Portfolio results by auction, rooftop, employee, and claim type." />
      <div className="mt-4 flex flex-wrap gap-2">
        {["Date Range", "Auction", "Rooftop", "Buyer", "Claim Type", "Employee", "Vehicle"].map((filter) => (
          <button key={filter} type="button" className="h-7 rounded-md bg-white px-2.5 text-[12px] font-medium ring-1 ring-slate-200">
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Arbitration Volume" value="47" />
        <KpiCard label="Open Exposure" value={money(DASHBOARD_STATS.openExposure)} />
        <KpiCard label="Final Cost" value={money(DASHBOARD_STATS.settlementsThisMonth)} />
        <KpiCard label="Amount Saved" value={money(DASHBOARD_STATS.moneySaved)} tone="ok" />
        <KpiCard label="Win / Denial Rate" value="38%" />
        <KpiCard label="Average Resolution Time" value={`${DASHBOARD_STATS.avgResolutionDays} days`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Table title="Results by Auction" rows={AUCTION_RESULTS.map((row) => [row.auction, String(row.open), money(row.paid), money(row.saved)])} heads={["Auction", "Open", "Paid", "Saved"]} />
        <Table title="Results by Rooftop" rows={LOCATIONS.map((loc, i) => [loc.name, String(8 + i * 3), money(12000 + i * 4000), money(8000 + i * 2500)])} heads={["Rooftop", "Volume", "Cost", "Saved"]} />
        <Table title="Results by Employee" rows={USERS.filter((user) => user.activeCases).map((user) => [user.name, user.role, String(user.activeCases), money(user.activeCases * 2100)])} heads={["Employee", "Role", "Cases", "Saved"]} />
        <Table title="Results by Claim Type" rows={CLAIM_TYPES.map((row) => [row.type, String(row.volume), money(row.saved)])} heads={["Claim Type", "Volume", "Saved"]} />
      </div>
    </div>
  )
}

function Table({ title, heads, rows }: { title: string; heads: string[]; rows: string[][] }) {
  return (
    <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">{title}</div>
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <tr>
            {heads.map((head) => (
              <th key={head} className="px-4 py-2.5 font-medium">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`px-4 py-2.5 ${cellIndex > 0 ? "tabular-nums" : ""}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
