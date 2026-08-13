"use client"

import { Suspense } from "react"
import { WorkQueue } from "@/components/queue/work-queue"

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-muted-foreground">Loading queue...</div>}>
      <WorkQueue />
    </Suspense>
  )
}
