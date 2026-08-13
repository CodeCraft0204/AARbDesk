"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { money, shortDate } from "@/lib/format"
import { useDemo } from "@/lib/demo-store"
import { cn } from "@/lib/utils"
import type { ArbitrationCase } from "@/lib/types"

export function NegotiationPanel({ item }: { item: ArbitrationCase }) {
  const { addOffer } = useDemo()
  const [amount, setAmount] = useState("4000")
  const { financials, offers } = item
  const saved =
    financials.finalSellerCost != null
      ? financials.originalDemand - financials.finalSellerCost
      : financials.originalDemand - (financials.sellerCounter ?? financials.sellerOffer ?? 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Mini label="Original Buyer Demand" value={money(financials.originalDemand)} />
        <Mini label="Current Exposure" value={money(item.currentExposure)} />
        <Mini label="Seller Latest Offer" value={financials.sellerCounter ? money(financials.sellerCounter) : financials.sellerOffer ? money(financials.sellerOffer) : "-"} />
        <Mini label="Potential Savings" value={money(Math.max(0, saved))} tone="ok" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Negotiation history
          </div>
          <ol className="mt-3">
            {offers.map((offer) => (
              <li key={offer.id} className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[13px] last:border-0">
                <div>
                  <span className="text-muted-foreground">{shortDate(offer.at)}</span>
                  <span className="mx-1.5 text-slate-300">-</span>
                  <span>{offer.label}</span>
                </div>
                <div className="font-medium tabular-nums">{money(offer.amount)}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-[13px] font-semibold">Add Offer / Counter</div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Structured financial events - not buried in notes.
          </p>
          <div className="mt-3 flex gap-2">
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} className="w-32" />
            <Button
              onClick={() => {
                addOffer(item.id, {
                  at: new Date().toISOString(),
                  party: "seller",
                  label: "Seller Counter",
                  amount: Number(amount.replace(/[^0-9.]/g, "")) || 0,
                })
                toast.success("Seller counter recorded")
              }}
            >
              Record seller offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold tabular-nums", tone === "ok" && "text-emerald-700")}>
        {value}
      </div>
    </div>
  )
}
