"use client"

import {
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Mail,
  StickyNote,
  UserRound,
} from "lucide-react"
import { dateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TimelineEvent, TimelineKind } from "@/lib/types"

const ICONS: Record<TimelineKind, typeof Mail> = {
  email: Mail,
  system: CheckCircle2,
  note: StickyNote,
  financial: Gavel,
  deadline: Clock,
  document: FileText,
  assignment: UserRound,
  decision: Gavel,
}

export function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  const ordered = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  )

  return (
    <ol className="relative ml-3 border-l border-slate-200">
      {ordered.map((event, index) => {
        const Icon = ICONS[event.kind] ?? FileText
        return (
          <li key={event.id} className={cn("relative pl-6", index === ordered.length - 1 ? "pb-1" : "pb-6")}>
            <span className="absolute top-0.5 -left-[9px] flex size-[17px] items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
              <Icon className="size-2.5 text-slate-600" />
            </span>
            <div className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {dateTime(event.at)}
            </div>
            <div className="mt-0.5 text-[13px] font-semibold text-slate-900">{event.title}</div>
            {event.detail ? <div className="mt-0.5 text-[13px] text-slate-600">{event.detail}</div> : null}
            {event.meta ? <div className="mt-0.5 text-[12px] text-muted-foreground">{event.meta}</div> : null}
            {event.actor ? <div className="mt-0.5 text-[12px] text-muted-foreground">{event.actor}</div> : null}
            {event.items?.length ? (
              <ul className="mt-1.5 space-y-0.5 text-[12px] text-slate-600">
                {event.items.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
