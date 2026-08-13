import { RULES } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"

const SETS = ["NAAA Standard Rules", "Manheim Atlanta", "ADESA Dallas", "Custom Dealer Rules"]

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="System" title="Rules" description="Configurable arbitration windows. Synthetic demo data only - not a legal NAAA database." />
      <div className="mt-5 flex flex-wrap gap-2">
        {SETS.map((set) => (
          <span key={set} className="rounded-md bg-white px-2.5 py-1 text-[12px] font-medium ring-1 ring-slate-200">{set}</span>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Rule Name</th>
              <th className="px-3 py-2.5 font-medium">Auction</th>
              <th className="px-3 py-2.5 font-medium">Claim Category</th>
              <th className="px-3 py-2.5 font-medium">Response Window</th>
              <th className="px-3 py-2.5 font-medium">Evidence Window</th>
              <th className="px-3 py-2.5 font-medium">Escalation</th>
              <th className="px-4 py-2.5 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((rule) => (
              <tr key={rule.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{rule.name}</td>
                <td className="px-3 py-2.5">{rule.auction}</td>
                <td className="px-3 py-2.5">{rule.claimCategory}</td>
                <td className="px-3 py-2.5">{rule.responseWindow}</td>
                <td className="px-3 py-2.5">{rule.evidenceWindow}</td>
                <td className="px-3 py-2.5">{rule.escalation}</td>
                <td className="px-4 py-2.5">{rule.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
