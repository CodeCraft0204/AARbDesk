"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Building2, Calendar, MapPin, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ActionBadge, StageBadge, ToneBadge } from "@/components/status-badges"
import { CaseTimeline } from "@/components/cases/case-timeline"
import { NegotiationPanel } from "@/components/cases/negotiation-panel"
import { deadlineMeta, longDate, money, remainingClock, shortDate, vehicleTitle } from "@/lib/format"
import { useDemo } from "@/lib/demo-store"
import { cn } from "@/lib/utils"
import type { ArbitrationCase, CaseStage, CommChannel, ResolutionOutcome, ReturnStep } from "@/lib/types"

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "timeline", label: "Timeline" },
  { value: "communications", label: "Communications" },
  { value: "documents", label: "Documents" },
  { value: "tasks", label: "Tasks" },
  { value: "deadlines", label: "Deadlines" },
  { value: "negotiation", label: "Negotiation" },
  { value: "financial", label: "Financial Result" },
]

const STAGES: CaseStage[] = [
  "New",
  "Under Review",
  "Investigating",
  "Negotiating",
  "Decision Received",
  "Repair / Return In Progress",
  "Resolved",
  "Closed",
]

const OUTCOMES: ResolutionOutcome[] = [
  "Claim Denied",
  "Repair Paid",
  "Partial Repair Paid",
  "Price Adjustment",
  "Buyer Keeps Vehicle",
  "Vehicle Returned / Unwound",
  "Seller Repurchase",
  "Other Settlement",
]

const RETURN_STEPS: ReturnStep[] = [
  "Return Authorized",
  "Transportation Arranged",
  "Vehicle Picked Up",
  "Vehicle In Transit",
  "Vehicle Received",
  "Condition Confirmed",
  "Return Costs Entered",
  "Case Closed",
]

export function CaseWorkspace({
  item,
  fromInbox,
}: {
  item: ArbitrationCase
  fromInbox?: boolean
}) {
  const { updateCase } = useDemo()
  const due = deadlineMeta(item.deadline)
  const title = vehicleTitle(item.year, item.make, item.model, item.trim)

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <Link
          href={fromInbox ? "/inbox" : "/cases"}
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {fromInbox ? "Back to inbox" : "Seller work queue"}
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium tracking-wide text-muted-foreground">{item.caseNumber}</div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-1 font-mono text-[12px] text-muted-foreground">VIN {item.vin}</div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
              <span>{item.auction}</span>
              <span>{item.buyer}</span>
              <span>{item.seller}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={item.stage} />
            <ActionBadge action={item.actionState} />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 px-6 py-5">
          <Tabs defaultValue={fromInbox ? "timeline" : "overview"}>
            <TabsList variant="line" className="w-full justify-start overflow-x-auto">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="px-2.5">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview" className="pt-5"><OverviewTab item={item} /></TabsContent>
            <TabsContent value="timeline" className="pt-5"><CaseTimeline events={item.timeline} /></TabsContent>
            <TabsContent value="communications" className="pt-5"><CommunicationsTab item={item} /></TabsContent>
            <TabsContent value="documents" className="pt-5"><DocumentsTab item={item} /></TabsContent>
            <TabsContent value="tasks" className="pt-5"><TasksTab item={item} /></TabsContent>
            <TabsContent value="deadlines" className="pt-5"><DeadlinesTab item={item} /></TabsContent>
            <TabsContent value="negotiation" className="pt-5"><NegotiationPanel item={item} /></TabsContent>
            <TabsContent value="financial" className="pt-5"><FinancialTab item={item} /></TabsContent>
          </Tabs>
        </div>

        <aside className="border-t border-border bg-card lg:sticky lg:top-0 lg:h-[calc(100vh-48px)] lg:overflow-auto lg:border-t-0 lg:border-l">
          <div className="p-5">
            <SideBlock label="Case Stage" value={item.stage} />
            <SideBlock label="Action State" value={item.actionState} danger={item.actionState === "Seller Action Required" || item.actionState === "Due Today"} />
            <SideBlock label="Deadline" value={`${shortDate(item.deadline)}, 5:00 PM\n${remainingClock(item.deadline)}`} danger={due.urgency === "critical"} />
            <SideBlock label="Financial Exposure" value={money(item.currentExposure)} />
            <div className="mt-5 space-y-3 border-t border-border pt-4 text-[13px]">
              <MetaRow icon={UserRound} label="Assigned to" value={item.assignedTo} />
              <MetaRow icon={Building2} label="Auction" value={item.auction} />
              <MetaRow icon={UserRound} label="Buyer" value={item.buyer} />
              <MetaRow icon={MapPin} label="Seller location" value={item.sellerLocation} />
              <MetaRow icon={Calendar} label="Claim type" value={item.claimType} />
            </div>
            <div className="mt-4">
              <div className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Priority</div>
              <div className="mt-1"><ToneBadge tone={item.priority === "critical" || item.priority === "high" ? "warning" : "neutral"}>{item.priority}</ToneBadge></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => toast.message("Reply composer is on Communications.")}>Send Response</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Task prompt is on the Tasks tab.")}>Add Task</Button>
              <Button size="sm" variant="outline" onClick={() => toast.message("Use Documents to attach evidence.")}>Upload Document</Button>
              <select
                className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
                value={item.stage}
                onChange={(event) => {
                  updateCase(item.id, { stage: event.target.value as CaseStage })
                  toast.success("Case stage updated")
                }}
              >
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SideBlock({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="border-b border-border py-3 first:pt-0">
      <div className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</div>
      <div className={cn("mt-1 text-[15px] font-semibold tracking-tight whitespace-pre-line", danger && "text-red-700")}>
        {value}
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-3.5 text-muted-foreground" />
      <div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  )
}

function OverviewTab({ item }: { item: ArbitrationCase }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="Claim Summary">
        <p className="text-[13px] leading-6 text-slate-700">{item.claimReason}</p>
        <div className="mt-3 text-[12px] text-muted-foreground">Original demand {money(item.originalExposure)}</div>
      </Section>
      <Section title="Vehicle Information">
        <dl className="grid grid-cols-2 gap-2 text-[13px]">
          <Info label="Year" value={String(item.year)} />
          <Info label="Make" value={item.make} />
          <Info label="Model" value={`${item.model}${item.trim ? ` ${item.trim}` : ""}`} />
          <Info label="VIN" value={item.vin} mono />
          <Info label="Mileage" value={item.mileage ? item.mileage.toLocaleString() : "-"} />
        </dl>
      </Section>
      <Section title="Arbitration Information">
        <dl className="grid grid-cols-2 gap-2 text-[13px]">
          <Info label="Auction" value={item.auction} />
          <Info label="Buyer" value={item.buyer} />
          <Info label="Seller" value={item.seller} />
          <Info label="Sale date" value={longDate(item.saleDate)} />
          <Info label="Claim date" value={longDate(item.claimDate)} />
          <Info label="Contact" value={item.auctionContact} />
        </dl>
      </Section>
      <Section title="Seller Review">
        <p className="text-[13px] leading-6 text-slate-700">
          {item.reviewNotes || item.notes[0] || "Compare the claim against the announcement, condition report, and applicable auction rules before responding."}
        </p>
      </Section>
      <Section title="Current Exposure">
        <div className="text-2xl font-semibold tabular-nums">{money(item.currentExposure)}</div>
      </Section>
      <Section title="Next Required Action">
        <p className="text-[13px] leading-6">{item.nextAction || item.actionState}</p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="mb-2 text-[13px] font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-medium", mono && "font-mono text-[12px]")}>{value}</dd>
    </div>
  )
}

function CommunicationsTab({ item }: { item: ArbitrationCase }) {
  const { addMessage } = useDemo()
  const [channel, setChannel] = useState<CommChannel>("auction")
  const [body, setBody] = useState("")
  const groups: CommChannel[] = ["auction", "buyer", "internal"]
  const labels: Record<CommChannel, string> = { auction: "Auction", buyer: "Buyer", internal: "Internal Notes" }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <div className="mb-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{labels[group]}</div>
            {item.messages.filter((message) => message.channel === group).length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No {labels[group].toLowerCase()} yet.</p>
            ) : (
              item.messages.filter((message) => message.channel === group).map((message) => (
                <article key={message.id} className="mb-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                  <div className="flex justify-between gap-2">
                    <div className="text-[13px] font-semibold">{message.from}</div>
                    <div className="text-[11px] text-muted-foreground">{shortDate(message.at)}</div>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-slate-700">{message.body}</p>
                </article>
              ))
            )}
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="text-[13px] font-semibold">Reply</div>
        <div className="mt-2 flex gap-1">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setChannel(group)}
              className={cn("h-7 rounded-md px-2 text-[11px] font-medium", channel === group ? "bg-slate-900 text-white" : "bg-slate-100")}
            >
              {labels[group]}
            </button>
          ))}
        </div>
        <Input className="mt-2" defaultValue={item.auctionContact} />
        <Input className="mt-2" defaultValue={`Re: ${item.caseNumber}`} />
        <Textarea className="mt-2 min-h-28" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Message" />
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (!body.trim()) return
              addMessage(item.id, {
                at: new Date().toISOString(),
                channel,
                direction: "out",
                from: "Dan Hulse",
                to: channel === "internal" ? "Premier Automotive Group" : item.auctionContact,
                subject: `Re: ${item.caseNumber}`,
                preview: body.slice(0, 120),
                body,
              })
              setBody("")
              toast.success(channel === "internal" ? "Internal note added to timeline" : "Reply filed to the case")
            }}
          >
            {channel === "internal" ? "Add Internal Note" : "Reply"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.message("Forward is simulated in this demo.")}>Forward</Button>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab({ item }: { item: ArbitrationCase }) {
  if (!item.documents.length) return <p className="text-[13px] text-muted-foreground">No documents preserved yet.</p>
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-2.5 font-medium">Document</th>
            <th className="px-3 py-2.5 font-medium">Type</th>
            <th className="px-3 py-2.5 font-medium">Uploaded</th>
            <th className="px-3 py-2.5 font-medium">Source</th>
            <th className="px-3 py-2.5 font-medium">Uploaded By</th>
            <th className="px-3 py-2.5 font-medium">Version</th>
            <th className="px-4 py-2.5 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {item.documents.map((doc) => (
            <tr key={doc.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5">
                <div className="font-medium">{doc.name}</div>
                {doc.origin === "original" ? (
                  <div className="text-[10px] font-medium tracking-wide text-blue-800 uppercase">Original source file</div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">User-uploaded evidence</div>
                )}
              </td>
              <td className="px-3 py-2.5">{doc.kind}</td>
              <td className="px-3 py-2.5">{shortDate(doc.addedAt)}</td>
              <td className="px-3 py-2.5">{doc.source}</td>
              <td className="px-3 py-2.5">{doc.uploadedBy}</td>
              <td className="px-3 py-2.5">{doc.version}</td>
              <td className="px-4 py-2.5">
                <button className="mr-2 text-[12px] text-primary" onClick={() => toast.message("Preview is simulated.")}>Preview</button>
                <button className="mr-2 text-[12px] text-primary" onClick={() => toast.message("Download is simulated.")}>Download</button>
                <button className="text-[12px] text-primary" onClick={() => toast.message("Version 1.0 is the current file.")}>Version History</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TasksTab({ item }: { item: ArbitrationCase }) {
  const { addTask } = useDemo()
  const [title, setTitle] = useState("Confirm auction rule")
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        <Button
          onClick={() => {
            addTask(item.id, {
              title,
              due: item.deadline,
              owner: item.assignedTo,
              priority: "medium",
              status: "open",
            })
            toast.success("Task added")
          }}
        >
          Add Task
        </Button>
      </div>
      {item.tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <div>
            <div className="text-[13px] font-medium">{task.title}</div>
            <div className="text-[12px] text-muted-foreground">{task.owner} ... {shortDate(task.due)} ... {task.priority}</div>
          </div>
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{task.status}</span>
        </div>
      ))}
    </div>
  )
}

function DeadlinesTab({ item }: { item: ArbitrationCase }) {
  const rows = item.deadlines.length
    ? item.deadlines
    : [{ id: "fallback", type: "Seller Initial Response", source: "Auction notice", due: item.deadline, owner: item.assignedTo, status: "open" as const, priority: item.priority, escalation: "Manager notified 12 hours before due" }]
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((deadline) => {
        const due = deadlineMeta(deadline.due)
        return (
          <div key={deadline.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="text-[13px] font-semibold">{deadline.type}</div>
            <div className="mt-1 text-[13px]">{longDate(deadline.due)} ... 5:00 PM</div>
            <div className={cn("mt-1 text-[13px] font-medium", due.urgency === "critical" && "text-red-700")}>{remainingClock(deadline.due)}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-muted-foreground">
              <div>Source: {deadline.source}</div>
              <div>Owner: {deadline.owner}</div>
              <div>Status: {deadline.status}</div>
              <div>Escalation: {deadline.escalation || "None"}</div>
            </div>
            {(deadline.priority === "high" || deadline.priority === "critical") && (
              <div className="mt-3 text-[10px] font-semibold tracking-wide text-red-700 uppercase">High priority</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FinancialTab({ item }: { item: ArbitrationCase }) {
  const { updateCase } = useDemo()
  const { financials } = item
  const saved = financials.finalSellerCost != null ? financials.originalDemand - financials.finalSellerCost : null
  const returnMode = item.resolution === "Vehicle Returned / Unwound"

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Row label="Original Exposure" value={money(financials.originalDemand)} />
        <Row label="Settlement" value={financials.settlement ? money(financials.settlement) : "-"} />
        <Row label="Repair Cost" value={money(financials.repairCost)} />
        <Row label="Transportation" value={money(financials.transportationCost)} />
        <Row label="Other Costs" value={money(financials.otherCost)} />
        <Row label="Final Seller Cost" value={financials.finalSellerCost ? money(financials.finalSellerCost) : "-"} />
      </div>
      <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
        <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-800 uppercase">Amount Saved</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-900">{saved == null ? "-" : money(saved)}</div>
      </div>
      <div>
        <div className="mb-2 text-[13px] font-semibold">Resolution</div>
        <div className="flex flex-wrap gap-1.5">
          {OUTCOMES.map((outcome) => (
            <button
              key={outcome}
              type="button"
              onClick={() => {
                updateCase(item.id, {
                  resolution: outcome,
                  stage: outcome === "Vehicle Returned / Unwound" ? "Repair / Return In Progress" : "Resolved",
                  returnStep: outcome === "Vehicle Returned / Unwound" ? "Return Authorized" : item.returnStep,
                })
                toast.success(`Outcome set: ${outcome}`)
              }}
              className={cn(
                "h-7 rounded-md px-2 text-[11px] font-medium ring-1",
                item.resolution === outcome ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200"
              )}
            >
              {outcome}
            </button>
          ))}
        </div>
      </div>
      {returnMode ? (
        <div>
          <div className="mb-2 text-[13px] font-semibold">Return / unwind</div>
          <ol className="space-y-1.5">
            {RETURN_STEPS.map((step, index) => {
              const current = RETURN_STEPS.indexOf(item.returnStep || "Return Authorized")
              const done = index <= current
              return (
                <li key={step} className="flex items-center gap-2 text-[13px]">
                  <span className={cn("size-2 rounded-full", done ? "bg-emerald-500" : "bg-slate-200")} />
                  <span className={done ? "font-medium" : "text-muted-foreground"}>{step}</span>
                </li>
              )
            })}
          </ol>
        </div>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-[13px] ring-1 ring-foreground/10">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  )
}
