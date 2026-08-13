"use client"

import Link from "next/link"
import { useDemo } from "@/lib/demo-store"
import { PageHeader } from "@/components/shared/page-header"

export default function DocumentsPage() {
  const { cases } = useDemo()
  const docs = cases.flatMap((item) =>
    item.documents.map((doc) => ({
      ...doc,
      caseId: item.id,
      caseNumber: item.caseNumber,
      vehicle: `${item.year} ${item.make} ${item.model}`,
    }))
  )

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Data" title="Documents" description="Original source files stay distinct from later evidence." />
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">File</th>
              <th className="px-3 py-2.5 font-medium">Type</th>
              <th className="px-3 py-2.5 font-medium">Case</th>
              <th className="px-3 py-2.5 font-medium">Origin</th>
              <th className="px-4 py-2.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{doc.name}</td>
                <td className="px-3 py-2.5">{doc.kind}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/cases/${doc.caseId}`} className="text-primary hover:underline">{doc.caseNumber}</Link>
                  <div className="text-[11px] text-muted-foreground">{doc.vehicle}</div>
                </td>
                <td className="px-3 py-2.5">{doc.origin === "original" ? "Original source file" : "Uploaded evidence"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{doc.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
