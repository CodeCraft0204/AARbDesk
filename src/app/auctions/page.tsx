import { AUCTIONS, AUCTION_RESULTS } from "@/lib/mock-data"
import { money } from "@/lib/format"
import { PageHeader } from "@/components/shared/page-header"

export default function AuctionsPage() {
  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Data" title="Auctions" description="Open work and results by auction lane." />
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Auction</th>
              <th className="px-3 py-2.5 font-medium">Market</th>
              <th className="px-3 py-2.5 font-medium">Open cases</th>
              <th className="px-3 py-2.5 text-right font-medium">Exposure</th>
              <th className="px-4 py-2.5 text-right font-medium">Saved</th>
            </tr>
          </thead>
          <tbody>
            {AUCTIONS.map((auction) => {
              const stats = AUCTION_RESULTS.find((row) => row.auction === auction.name)
              return (
                <tr key={auction.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium">{auction.name}</td>
                  <td className="px-3 py-2.5">{auction.market}</td>
                  <td className="px-3 py-2.5 tabular-nums">{auction.openCases}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{stats ? money(stats.exposure) : "-"}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-emerald-700">{stats ? money(stats.saved) : "-"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
