"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { INITIAL_CASES, INITIAL_INBOX, nextCaseNumber, ORGANIZATION } from "@/lib/mock-data"
import { parseUsDate, parseMoney, parseVehicle, fieldValue } from "@/lib/parse-email"
import type {
  ActionState,
  ArbitrationCase,
  CaseStage,
  CaseTask,
  EmailIntake,
  ExtractionResult,
  IntakeStatus,
  Message,
  NegotiationOffer,
  SampleEmail,
} from "@/lib/types"

interface DemoStore {
  cases: ArbitrationCase[]
  inbox: EmailIntake[]
  getCase: (id: string) => ArbitrationCase | undefined
  updateIntake: (id: string, patch: Partial<EmailIntake>) => void
  createCaseFromExtraction: (
    email: SampleEmail | EmailIntake,
    extraction: ExtractionResult,
    intakeId?: string
  ) => ArbitrationCase
  linkIntakeToCase: (intakeId: string, caseId: string, status: IntakeStatus) => void
  addMessage: (caseId: string, message: Omit<Message, "id">) => void
  addOffer: (caseId: string, offer: Omit<NegotiationOffer, "id">) => void
  addTask: (caseId: string, task: Omit<CaseTask, "id">) => void
  updateCase: (caseId: string, patch: Partial<ArbitrationCase>) => void
}

const DemoContext = createContext<DemoStore | null>(null)

function isIntake(email: SampleEmail | EmailIntake): email is EmailIntake {
  return "status" in email
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<ArbitrationCase[]>(INITIAL_CASES)
  const [inbox, setInbox] = useState<EmailIntake[]>(INITIAL_INBOX)

  const getCase = useCallback(
    (id: string) => cases.find((item) => item.id === id || item.caseNumber === id),
    [cases]
  )

  const updateIntake = useCallback((id: string, patch: Partial<EmailIntake>) => {
    setInbox((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const linkIntakeToCase = useCallback(
    (intakeId: string, caseId: string, status: IntakeStatus) => {
      setInbox((prev) =>
        prev.map((item) => (item.id === intakeId ? { ...item, caseId, status } : item))
      )
    },
    []
  )

  const updateCase = useCallback((caseId: string, patch: Partial<ArbitrationCase>) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseId || item.caseNumber === caseId
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }, [])

  const addMessage = useCallback((caseId: string, message: Omit<Message, "id">) => {
    setCases((prev) =>
      prev.map((item) => {
        if (item.id !== caseId && item.caseNumber !== caseId) return item
        const id = `${item.id}-m-${item.messages.length + 1}`
        return {
          ...item,
          messages: [...item.messages, { ...message, id }],
          timeline: [
            ...item.timeline,
            {
              id: `${item.id}-tl-${item.timeline.length + 1}`,
              at: message.at,
              kind: message.channel === "internal" ? "note" : "email",
              title: message.channel === "internal" ? "Internal note added" : "Message sent",
              detail: message.preview,
              actor: message.from,
            },
          ],
          updatedAt: message.at,
        }
      })
    )
  }, [])

  const addOffer = useCallback((caseId: string, offer: Omit<NegotiationOffer, "id">) => {
    setCases((prev) =>
      prev.map((item) => {
        if (item.id !== caseId && item.caseNumber !== caseId) return item
        const id = `${item.id}-o-${item.offers.length + 1}`
        const currentExposure = offer.party === "buyer" ? offer.amount : item.currentExposure
        return {
          ...item,
          offers: [...item.offers, { ...offer, id }],
          currentExposure,
          financials: {
            ...item.financials,
            currentExposure,
            sellerOffer: offer.party === "seller" ? offer.amount : item.financials.sellerOffer,
            buyerCounter: offer.party === "buyer" ? offer.amount : item.financials.buyerCounter,
          },
          timeline: [
            ...item.timeline,
            {
              id: `${item.id}-tl-${item.timeline.length + 1}`,
              at: offer.at,
              kind: "financial",
              title: offer.label,
              detail: `$${offer.amount.toLocaleString()}`,
            },
          ],
          stage: "Negotiating" as CaseStage,
          actionState: "Waiting on Auction" as ActionState,
          updatedAt: offer.at,
        }
      })
    )
  }, [])

  const addTask = useCallback((caseId: string, task: Omit<CaseTask, "id">) => {
    setCases((prev) =>
      prev.map((item) => {
        if (item.id !== caseId && item.caseNumber !== caseId) return item
        const id = `${item.id}-k-${item.tasks.length + 1}`
        return {
          ...item,
          tasks: [...item.tasks, { ...task, id }],
          timeline: [
            ...item.timeline,
            {
              id: `${item.id}-tl-${item.timeline.length + 1}`,
              at: new Date().toISOString(),
              kind: "system",
              title: "Task added",
              detail: task.title,
            },
          ],
        }
      })
    )
  }, [])

  const createCaseFromExtraction = useCallback(
    (
      email: SampleEmail | EmailIntake,
      extraction: ExtractionResult,
      intakeId?: string
    ) => {
      const vin = fieldValue(extraction, "vin") || "UNKNOWN"
      const existing = cases.find((item) => item.vin === vin)
      if (existing && !vin.includes("?")) {
        if (intakeId) linkIntakeToCase(intakeId, existing.id, "Matched")
        return existing
      }

      const vehicle = parseVehicle(fieldValue(extraction, "vehicle") || "2023 Vehicle Unknown")
      const amount = parseMoney(fieldValue(extraction, "amountRequested") || "$0")
      const receivedAt = email.receivedAt || new Date().toISOString()
      const preferred = vin === "1FTFW1E50PFA12345" ? "ARB-2026-0048" : nextCaseNumber(cases)
      const caseNumber = cases.some((item) => item.caseNumber === preferred)
        ? nextCaseNumber(cases)
        : preferred
      const id = caseNumber.toLowerCase()
      const deadlineRaw = fieldValue(extraction, "deadline")
      const deadline = deadlineRaw ? parseUsDate(deadlineRaw) : new Date(Date.now() + 2 * 864e5).toISOString()
      const attachments = email.attachments ?? extraction.attachments
      const auction = fieldValue(extraction, "auction") || (isIntake(email) ? email.auction : "Unknown auction")
      const buyer = fieldValue(extraction, "buyer") || (isIntake(email) ? email.buyer : "Unknown buyer")
      const seller = fieldValue(extraction, "seller") || ORGANIZATION.name
      const location = fieldValue(extraction, "sellerLocation") || "Atlanta North"

      const created: ArbitrationCase = {
        id,
        organizationId: ORGANIZATION.id,
        locationId: "loc-atl-n",
        caseNumber,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin,
        mileage: 41280,
        auctionId: "auc-mh-atl",
        auction,
        buyer,
        seller,
        sellerLocation: location,
        saleDate: fieldValue(extraction, "saleDate")
          ? parseUsDate(fieldValue(extraction, "saleDate"), 0)
          : receivedAt,
        claimDate: receivedAt,
        claimReason: fieldValue(extraction, "claimReason") || email.subject,
        claimType: "Mechanical / Engine",
        auctionContact: fieldValue(extraction, "auctionContact") || email.from,
        stage: "Investigating",
        actionState: "Seller Action Required",
        priority: "high",
        deadline,
        originalExposure: amount,
        currentExposure: amount,
        assignedUserId: "dan",
        assignedTo: "Dan Hulse",
        createdAt: receivedAt,
        updatedAt: receivedAt,
        notes: [],
        nextAction: "Review condition report and prepare seller response.",
        documents: attachments.map((name, index) => ({
          id: `${id}-doc-${index}`,
          name,
          kind: name.toLowerCase().includes("photo")
            ? "Photos"
            : name.toLowerCase().includes("estimate")
              ? "Repair Estimate"
              : name.toLowerCase().includes("condition")
                ? "Condition Report"
                : name.toLowerCase().includes("inspection")
                  ? "Inspection Report"
                  : name.toLowerCase().includes("engine")
                    ? "Diagnostic Report"
                    : "Other",
          origin: "original",
          size: "-",
          addedAt: receivedAt,
          source: "Inbound email",
          uploadedBy: "Inbound email",
          version: "1.0",
        })),
        timeline: [
          { id: `${id}-t1`, at: receivedAt, kind: "email", title: "Arbitration email received", detail: `Source: ${auction}`, meta: email.from },
          { id: `${id}-t2`, at: receivedAt, kind: "system", title: "VIN automatically identified", detail: vin, meta: `Confidence: ${extraction.fields.find((f) => f.key === "vin")?.confidence ?? 0}%` },
          { id: `${id}-t3`, at: receivedAt, kind: "system", title: `Case ${caseNumber} created` },
          { id: `${id}-t4`, at: receivedAt, kind: "deadline", title: "Seller response deadline created", detail: fieldValue(extraction, "deadline") || "TBD" },
          ...(attachments.length
            ? [{ id: `${id}-t5`, at: receivedAt, kind: "document" as const, title: `${attachments.length} original attachments preserved`, items: attachments }]
            : []),
          { id: `${id}-t6`, at: receivedAt, kind: "assignment", title: "Case assigned to Dan Hulse" },
        ],
        messages: [
          {
            id: `${id}-m1`,
            at: receivedAt,
            channel: "auction",
            direction: "in",
            from: email.from,
            to: seller,
            subject: email.subject,
            preview: email.body.slice(0, 140),
            body: email.body,
          },
        ],
        offers: [{ id: `${id}-o1`, at: receivedAt, party: "buyer", label: "Buyer Demand", amount }],
        tasks: [
          { id: `${id}-k1`, title: "Review condition report", due: deadline, owner: "Dan Hulse", priority: "high", status: "open" },
          { id: `${id}-k2`, title: "Prepare seller response", due: deadline, owner: "Dan Hulse", priority: "high", status: "open" },
        ],
        deadlines: [
          {
            id: `${id}-dl1`,
            type: "Seller Initial Response",
            source: "Auction notice",
            due: deadline,
            owner: "Dan Hulse",
            status: "open",
            priority: "high",
            escalation: "Manager notified 12 hours before due",
          },
        ],
        financials: {
          originalDemand: amount,
          currentExposure: amount,
          sellerOffer: null,
          buyerCounter: null,
          sellerCounter: null,
          auctionDecision: null,
          settlement: null,
          repairCost: 0,
          transportationCost: 0,
          otherCost: 0,
          finalSellerCost: null,
        },
      }

      setCases((prev) => [created, ...prev])
      if (intakeId) linkIntakeToCase(intakeId, created.id, "Case Created")
      return created
    },
    [cases, linkIntakeToCase]
  )

  const value = useMemo(
    () => ({
      cases,
      inbox,
      getCase,
      updateIntake,
      createCaseFromExtraction,
      linkIntakeToCase,
      addMessage,
      addOffer,
      addTask,
      updateCase,
    }),
    [cases, inbox, getCase, updateIntake, createCaseFromExtraction, linkIntakeToCase, addMessage, addOffer, addTask, updateCase]
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error("useDemo must be used within DemoProvider")
  return ctx
}
