"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Check, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfidenceBar, ToneBadge } from "@/components/status-badges"
import { PageHeader, KpiCard } from "@/components/shared/page-header"
import { SAMPLE_EMAILS } from "@/lib/sample-emails"
import { parseArbitrationEmail } from "@/lib/parse-email"
import { useDemo } from "@/lib/demo-store"
import { dateTime, intakeTone, money, timeOfDay } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EmailIntake, ExtractedField, ExtractionResult, IntakeStatus, SampleEmail } from "@/lib/types"

const STEPS = [
  "Reading email",
  "Extracting vehicle data",
  "Identifying VIN",
  "Matching auction",
  "Checking existing cases",
  "Analyzing attachments",
  "Calculating deadline",
  "Creating arbitration case",
]

export function EmailIntake() {
  const router = useRouter()
  const { cases, inbox, updateIntake, createCaseFromExtraction, linkIntakeToCase } = useDemo()
  const [openId, setOpenId] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(0)
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [editing, setEditing] = useState(false)

  const item = inbox.find((row) => row.id === openId) ?? null
  const sample = item?.sampleId
    ? SAMPLE_EMAILS.find((entry) => entry.id === item.sampleId)
    : item
      ? intakeToSample(item)
      : null

  const counts = {
    new: inbox.filter((row) => row.status === "New").length,
    review: inbox.filter((row) => row.status === "Needs Review").length,
    matched: inbox.filter((row) => row.status === "Matched").length,
    created: inbox.filter((row) => row.status === "Case Created").length,
  }

  function openSample(sampleId: "high-confidence" | "needs-review") {
    const row = inbox.find((entry) => entry.sampleId === sampleId)
    if (row) {
      setExtraction(null)
      setStep(0)
      setEditing(false)
      setOpenId(row.id)
    }
  }

  function openRow(row: EmailIntake) {
    setExtraction(null)
    setStep(0)
    setEditing(false)
    setOpenId(row.id)
  }

  function processArbitration() {
    if (!item || !sample) return
    const result = parseArbitrationEmail(sample.body, sample.attachments, cases)
    setExtraction(null)
    setProcessing(true)
    setStep(0)
    updateIntake(item.id, { status: "Processing" })

    STEPS.forEach((_, index) => {
      window.setTimeout(() => setStep(index + 1), 90 * (index + 1))
    })
    window.setTimeout(() => {
      setExtraction(result)
      setProcessing(false)
      updateIntake(item.id, {
        status: result.needsReview ? "Needs Review" : item.status === "New" ? "New" : item.status,
        confidence: result.fields.find((field) => field.key === "vin")?.confidence ?? item.confidence,
      })
    }, 90 * STEPS.length + 80)
  }

  function createCase() {
    if (!item || !sample || !extraction) return
    const created = createCaseFromExtraction(sample, extraction, item.id)
    toast.success(`${created.caseNumber} created from arbitration email`)
    setOpenId(null)
    router.push(`/cases/${created.id}?from=inbox`)
  }

  function confirmMatch() {
    if (!item || !extraction?.possibleMatchId) return
    linkIntakeToCase(item.id, extraction.possibleMatchId, "Matched")
    toast.success("Linked to existing case - no duplicate created")
    setOpenId(null)
    router.push(`/cases/${extraction.possibleMatchId}?from=inbox`)
  }

  function ignoreDuplicate() {
    if (!item) return
    updateIntake(item.id, { status: "Duplicate" })
    toast.message("Marked as duplicate. No case written.")
    setOpenId(null)
  }

  const matchCase = cases.find((entry) => entry.id === extraction?.possibleMatchId)
  const vinField = extraction?.fields.find((field) => field.key === "vin")

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <PageHeader
        kicker="Arbitration"
        title="Arbitration Inbox"
        description="Incoming auction notices are automatically analyzed and routed into AARbDesk. Email is an input - it is not the case database."
        actions={
          <Button onClick={() => openSample("high-confidence")}>
            <Plus className="size-3.5" />
            Load Sample Arbitration Email
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="New Emails" value={String(counts.new)} tone="info" />
        <KpiCard label="Needs Review" value={String(counts.review)} tone="warning" />
        <KpiCard label="Matched to Cases" value={String(counts.matched)} />
        <KpiCard label="Cases Created" value={String(counts.created)} tone="ok" />
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Received</th>
              <th className="px-3 py-2.5 font-medium">Auction</th>
              <th className="px-3 py-2.5 font-medium">Subject</th>
              <th className="px-3 py-2.5 font-medium">VIN</th>
              <th className="px-3 py-2.5 font-medium">Buyer</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 font-medium">Confidence</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {inbox.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-slate-50/70">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{dateTime(row.receivedAt)}</td>
                <td className="px-3 py-3">{row.auction}</td>
                <td className="max-w-[280px] px-3 py-3">
                  <div className="truncate font-medium">{row.subject}</div>
                </td>
                <td className="px-3 py-3 font-mono text-[12px]">{row.vin || "-"}</td>
                <td className="px-3 py-3">{row.buyer || "-"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{row.amount ? money(row.amount) : "-"}</td>
                <td className="px-3 py-3">{row.confidence != null ? `${row.confidence}%` : "-"}</td>
                <td className="px-3 py-3">
                  <ToneBadge tone={intakeTone(row.status as IntakeStatus)}>{row.status}</ToneBadge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openRow(row)}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!openId} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
          {item && sample ? (
            <>
              <DialogHeader>
                <DialogTitle>{sample.subject}</DialogTitle>
                <DialogDescription>
                  Original inbound email is preserved separately from extracted case data.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                  <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-2 gap-y-1 text-[12px]">
                    <dt className="text-muted-foreground">From</dt>
                    <dd className="font-medium">{sample.from}</dd>
                    <dt className="text-muted-foreground">To</dt>
                    <dd>{sample.to}</dd>
                    <dt className="text-muted-foreground">Received</dt>
                    <dd>{timeOfDay(sample.receivedAt)}</dd>
                  </dl>
                  <pre className="mt-3 max-h-64 overflow-auto font-sans text-[12px] leading-5 whitespace-pre-wrap text-slate-700">
                    {sample.body}
                  </pre>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sample.attachments.map((name) => (
                      <span key={name} className="rounded bg-white px-1.5 py-0.5 text-[11px] ring-1 ring-slate-200">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={processArbitration} disabled={processing} className="w-full">
                    {processing ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    Process Arbitration
                  </Button>

                  {(processing || step > 0) && !extraction ? (
                    <ol className="space-y-1.5">
                      {STEPS.map((label, index) => {
                        const done = step > index
                        const current = processing && step === index + 1
                        return (
                          <li key={label} className={cn("flex items-center gap-2 text-[12px]", done ? "text-foreground" : "text-muted-foreground")}>
                            {done ? <Check className="size-3.5 text-emerald-600" /> : current ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <span className="size-3.5 rounded-full border border-border" />}
                            {label}
                          </li>
                        )
                      })}
                    </ol>
                  ) : null}

                  {extraction ? (
                    <ExtractionBlock
                      extraction={extraction}
                      vinField={vinField}
                      matchLabel={
                        matchCase
                          ? `${matchCase.caseNumber} - ${matchCase.year} ${matchCase.make} ${matchCase.model}`
                          : null
                      }
                      editing={editing}
                      onEdit={() => setEditing(true)}
                      onCreate={createCase}
                      onConfirmMatch={confirmMatch}
                      onIgnore={ignoreDuplicate}
                    />
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function intakeToSample(item: EmailIntake): SampleEmail {
  return {
    id: item.id,
    label: item.subject,
    description: "",
    from: item.from,
    to: item.to,
    subject: item.subject,
    receivedAt: item.receivedAt,
    body: item.body,
    attachments: item.attachments,
  }
}

function ExtractionBlock({
  extraction,
  vinField,
  matchLabel,
  editing,
  onEdit,
  onCreate,
  onConfirmMatch,
  onIgnore,
}: {
  extraction: ExtractionResult
  vinField?: ExtractedField
  matchLabel: string | null
  editing: boolean
  onEdit: () => void
  onCreate: () => void
  onConfirmMatch: () => void
  onIgnore: () => void
}) {
  const display = extraction.fields.filter((field) =>
    ["vin", "vehicle", "auction", "buyer", "seller", "claimReason", "amountRequested", "deadline"].includes(field.key)
  )

  return (
    <div className={cn("rounded-lg ring-1", extraction.needsReview ? "ring-amber-300" : "ring-slate-200")}>
      <div className="border-b border-border px-3 py-2">
        {extraction.needsReview ? (
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-800">
            <AlertTriangle className="size-3.5" />
            Needs Review
          </div>
        ) : (
          <div className="text-[13px] font-semibold">Extraction results</div>
        )}
      </div>
      <div className="divide-y divide-border">
        {display.map((field) => (
          <div key={field.key} className="flex items-start justify-between gap-3 px-3 py-2">
            <div>
              <div className="text-[11px] text-muted-foreground">{field.label}</div>
              {editing && field.key === "vin" ? (
                <Input defaultValue={field.value} className="mt-1 h-7 font-mono text-[12px]" />
              ) : (
                <div className={cn("text-[13px] font-medium", field.key === "vin" && "font-mono", field.confidence < 90 && "text-amber-800")}>
                  {field.value}
                </div>
              )}
            </div>
            <ConfidenceBar value={field.confidence} />
          </div>
        ))}
      </div>
      {extraction.needsReview ? (
        <div className="space-y-2 border-t border-amber-100 bg-amber-50/70 px-3 py-3">
          {vinField ? (
            <div className="text-[12px] text-amber-950">
              VIN <span className="font-mono font-medium">{vinField.value}</span> ... {vinField.confidence}%
            </div>
          ) : null}
          {matchLabel ? (
            <div className="rounded-md bg-white px-3 py-2 text-[12px] ring-1 ring-amber-200">
              <div className="text-[11px] font-medium text-amber-800 uppercase">Possible existing case</div>
              <div className="font-medium">{matchLabel}</div>
              {extraction.matchConfidence ? <div>{extraction.matchConfidence}% match</div> : null}
            </div>
          ) : null}
          <p className="text-[11px] text-amber-900">Low-confidence data is not written to the case record until you confirm.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onConfirmMatch} disabled={!extraction.possibleMatchId}>
              Confirm Match
            </Button>
            <Button size="sm" variant="outline" onClick={onCreate}>Create New Case</Button>
            <Button size="sm" variant="outline" onClick={onEdit}>Correct Information</Button>
            <Button size="sm" variant="ghost" onClick={onIgnore}>Ignore / Duplicate</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 border-t border-border px-3 py-3">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-800">
            <Check className="size-3.5" />
            No matching active arbitration found
          </div>
          <Button onClick={onCreate} className="w-full">Create New Case</Button>
        </div>
      )}
    </div>
  )
}
