"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DemoProvider } from "@/lib/demo-store"
import { AppShell } from "@/components/app-shell"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <TooltipProvider delay={200}>
        <DemoProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" />
        </DemoProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
