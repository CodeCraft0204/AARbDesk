"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Briefcase,
  Building2,
  Car,
  Check,
  ChevronDown,
  ChevronsLeft,
  Clock,
  FileText,
  Gavel,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Plug,
  RotateCcw,
  Search,
  Settings,
  Users,
} from "lucide-react"
import { CURRENT_USER, ORGANIZATION } from "@/lib/mock-data"
import { useDemo } from "@/lib/demo-store"
import { vehicleTitle } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cases?mine=1", label: "My Work", icon: ListTodo },
    ],
  },
  {
    label: "Arbitration",
    items: [
      { href: "/inbox", label: "Inbox", icon: Inbox, badgeKey: "inbox" as const },
      { href: "/cases", label: "Cases", icon: Briefcase },
      { href: "/deadlines", label: "Deadlines", icon: Clock },
      { href: "/returns", label: "Returns", icon: RotateCcw },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/auctions", label: "Auctions", icon: Building2 },
      { href: "/vehicles", label: "Vehicles", icon: Car },
      { href: "/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/team", label: "Team", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/rules", label: "Rules", icon: Gavel },
      { href: "/integrations", label: "Integrations", icon: Plug },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
]

function LogoMark() {
  return (
    <div className="flex size-8 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/10">
      <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none">
        <path d="M4 18V8.5L12 4l8 4.5V18" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M8 18v-6h8v6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0]
  if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/"
  if (path === "/cases") return pathname === "/cases" || pathname.startsWith("/cases/")
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { cases, inbox } = useDemo()
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const newCount = inbox.filter((item) => item.status === "New" || item.status === "Needs Review").length

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return {
        cases: cases.slice(0, 4),
        vehicles: cases.slice(0, 3),
        auctions: [...new Set(cases.map((item) => item.auction))].slice(0, 4),
        documents: cases.flatMap((item) => item.documents.map((doc) => ({ ...doc, caseId: item.id }))).slice(0, 4),
      }
    }
    const matched = cases.filter((item) =>
      `${item.caseNumber} ${item.vin} ${item.make} ${item.model} ${item.auction} ${item.buyer}`
        .toLowerCase()
        .includes(q)
    )
    return {
      cases: matched.slice(0, 6),
      vehicles: matched.slice(0, 4),
      auctions: [...new Set(matched.map((item) => item.auction))],
      documents: matched.flatMap((item) => item.documents.map((doc) => ({ ...doc, caseId: item.id }))).slice(0, 6),
    }
  }, [cases, query])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={cn(
          "flex shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width]",
          collapsed ? "w-[68px]" : "w-[232px]"
        )}
      >
        <div className={cn("flex items-center gap-2.5 px-3 pt-4 pb-3", collapsed && "justify-center px-2")}>
          <LogoMark />
          {!collapsed ? (
            <div className="min-w-0">
              <div className="text-[15px] leading-none font-semibold tracking-tight">AARbDesk</div>
              <div className="mt-1 text-[10px] text-white/40">by Auto Auction Review</div>
            </div>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="px-3 pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-between rounded-md bg-white/8 px-2.5 text-[12px] font-medium text-white/80 ring-1 ring-white/10"
                  />
                }
              >
                Seller
                <ChevronDown className="size-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  Seller <Check className="ml-auto size-3.5" />
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Buyer - Coming Soon</DropdownMenuItem>
                <DropdownMenuItem disabled>Fleet - Coming Soon</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        <nav className="flex-1 space-y-4 overflow-auto px-2 pb-3">
          {NAV.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <div className="px-2 pb-1 text-[10px] font-medium tracking-[0.14em] text-white/30 uppercase">
                  {group.label}
                </div>
              ) : null}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  const badge = item.badgeKey === "inbox" ? newCount : 0
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? <span className="flex-1">{item.label}</span> : null}
                      {!collapsed && badge ? (
                        <span className="flex size-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/8 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-8 w-full items-center justify-center rounded-md text-white/45 hover:bg-white/8 hover:text-white"
          >
            <ChevronsLeft className={cn("size-4 transition", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted"
          >
            <Search className="size-3.5" />
            <span className="truncate text-[13px]">Search VIN, case, auction, buyer...</span>
            <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              Ctrl K
            </kbd>
          </button>
          <div className="hidden text-[12px] text-muted-foreground md:block">{ORGANIZATION.name}</div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button type="button" className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted" />
              }
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold">
                {CURRENT_USER.initials}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-[12px] font-medium leading-none">{CURRENT_USER.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{CURRENT_USER.role}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Sign out (demo)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Search AARbDesk</DialogTitle>
            <DialogDescription>Cases, vehicles, auctions, and documents.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search VIN, case, auction, buyer..."
          />
          <div className="max-h-80 space-y-3 overflow-auto">
            <SearchGroup label="Cases">
              {results.cases.map((item) => (
                <SearchHit
                  key={item.id}
                  href={`/cases/${item.id}`}
                  title={item.caseNumber}
                  detail={vehicleTitle(item.year, item.make, item.model)}
                  onSelect={() => setSearchOpen(false)}
                />
              ))}
            </SearchGroup>
            <SearchGroup label="Vehicles">
              {results.vehicles.map((item) => (
                <SearchHit
                  key={`v-${item.id}`}
                  href={`/cases/${item.id}`}
                  title={item.vin}
                  detail={vehicleTitle(item.year, item.make, item.model)}
                  onSelect={() => setSearchOpen(false)}
                />
              ))}
            </SearchGroup>
            <SearchGroup label="Auctions">
              {results.auctions.map((auction) => (
                <SearchHit
                  key={auction}
                  href="/auctions"
                  title={auction}
                  onSelect={() => setSearchOpen(false)}
                />
              ))}
            </SearchGroup>
            <SearchGroup label="Documents">
              {results.documents.map((doc) => (
                <SearchHit
                  key={doc.id}
                  href={`/cases/${doc.caseId}`}
                  title={doc.name}
                  detail={doc.kind}
                  onSelect={() => setSearchOpen(false)}
                />
              ))}
            </SearchGroup>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SearchGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function SearchHit({
  href,
  title,
  detail,
  onSelect,
}: {
  href: string
  title: string
  detail?: string
  onSelect: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="block rounded-md px-2 py-1.5 hover:bg-muted"
    >
      <div className="text-[13px] font-medium">{title}</div>
      {detail ? <div className="text-[11px] text-muted-foreground">{detail}</div> : null}
    </Link>
  )
}
