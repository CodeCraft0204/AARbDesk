"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CaseWorkspace } from "@/components/cases/case-workspace"
import { useDemo } from "@/lib/demo-store"

function CaseDetailInner() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const { getCase } = useDemo()
  const item = getCase(params.id)

  if (!item) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-lg font-semibold">Case not found</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          That case is not in the current demo session.
        </p>
        <Link href="/cases" className="mt-4 inline-block text-[13px] font-medium text-primary">
          Return to queue
        </Link>
      </div>
    )
  }

  return <CaseWorkspace item={item} fromInbox={search.get("from") === "inbox"} />
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-muted-foreground">Loading case...</div>}>
      <CaseDetailInner />
    </Suspense>
  )
}
