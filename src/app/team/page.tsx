import { LOCATIONS, ORGANIZATION, USERS } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <PageHeader kicker="Management" title={ORGANIZATION.name} description="One organization, multiple rooftops, assigned cases, and role-based work." />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LOCATIONS.map((location) => (
          <div key={location.id} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
            <div className="text-[13px] font-semibold">{location.name}</div>
            <div className="text-[12px] text-muted-foreground">{location.city}, {location.state}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Location</th>
              <th className="px-3 py-2.5 font-medium">Active Cases</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{user.name}</td>
                <td className="px-3 py-2.5">{user.role}</td>
                <td className="px-3 py-2.5">{LOCATIONS.find((location) => location.id === user.locationId)?.name}</td>
                <td className="px-3 py-2.5 tabular-nums">{user.activeCases}</td>
                <td className="px-4 py-2.5 capitalize">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
