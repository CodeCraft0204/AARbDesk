export type CaseStage =
  | "New"
  | "Under Review"
  | "Investigating"
  | "Negotiating"
  | "Decision Received"
  | "Repair / Return In Progress"
  | "Resolved"
  | "Closed"

export type ActionState =
  | "Seller Action Required"
  | "Due Today"
  | "Deadline Approaching"
  | "Waiting on Buyer"
  | "Waiting on Auction"
  | "Waiting on Internal Team"
  | "Waiting on Transport"
  | "No Current Action"

export type ActionTone = "critical" | "warning" | "ok" | "info" | "neutral"

export type Priority = "low" | "medium" | "high" | "critical"

export type UserRole =
  | "Owner"
  | "Admin"
  | "Arbitration Manager"
  | "Arbitration Specialist"
  | "Finance"
  | "Read Only"

export type DocumentKind =
  | "Original Email"
  | "Condition Report"
  | "Announcement"
  | "Inspection Report"
  | "Diagnostic Report"
  | "Photos"
  | "Repair Estimate"
  | "Invoice"
  | "Transportation"
  | "Auction Correspondence"
  | "Other"

export type DocumentOrigin = "original" | "uploaded"

export type TimelineKind =
  | "system"
  | "email"
  | "note"
  | "financial"
  | "deadline"
  | "document"
  | "assignment"
  | "decision"

export type OfferParty = "buyer" | "seller" | "auction"

export type TaskStatus = "open" | "in_progress" | "waiting" | "done"

export type DeadlineStatus = "open" | "met" | "missed"

export type IntakeStatus =
  | "New"
  | "Processing"
  | "Case Created"
  | "Matched"
  | "Needs Review"
  | "Duplicate"

export type ExtractedFieldKey =
  | "vin"
  | "vehicle"
  | "auction"
  | "buyer"
  | "seller"
  | "sellerLocation"
  | "saleDate"
  | "claimDate"
  | "claimReason"
  | "amountRequested"
  | "auctionContact"
  | "deadline"
  | "attachments"

export type ResolutionOutcome =
  | "Claim Denied"
  | "Repair Paid"
  | "Partial Repair Paid"
  | "Price Adjustment"
  | "Buyer Keeps Vehicle"
  | "Vehicle Returned / Unwound"
  | "Seller Repurchase"
  | "Other Settlement"

export type ReturnStep =
  | "Return Authorized"
  | "Transportation Arranged"
  | "Vehicle Picked Up"
  | "Vehicle In Transit"
  | "Vehicle Received"
  | "Condition Confirmed"
  | "Return Costs Entered"
  | "Case Closed"

export type CommChannel = "auction" | "buyer" | "internal"

export interface Organization {
  id: string
  name: string
}

export interface Location {
  id: string
  organizationId: string
  name: string
  city: string
  state: string
}

export interface AppUser {
  id: string
  organizationId: string
  locationId: string
  name: string
  role: UserRole
  initials: string
  email: string
  activeCases: number
  status: "active" | "away"
}

export interface Auction {
  id: string
  name: string
  market: string
  openCases: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
}

export interface CaseDocument {
  id: string
  name: string
  kind: DocumentKind
  origin: DocumentOrigin
  size: string
  addedAt: string
  source: string
  uploadedBy: string
  version: string
}

export interface TimelineEvent {
  id: string
  at: string
  kind: TimelineKind
  title: string
  detail?: string
  meta?: string
  items?: string[]
  actor?: string
}

export interface Message {
  id: string
  at: string
  channel: CommChannel
  direction: "in" | "out"
  from: string
  to: string
  subject: string
  preview: string
  body: string
}

export interface NegotiationOffer {
  id: string
  at: string
  party: OfferParty
  label: string
  amount: number
}

export interface CaseTask {
  id: string
  title: string
  due: string
  owner: string
  priority: Priority
  status: TaskStatus
}

export interface CaseDeadline {
  id: string
  type: string
  source: string
  due: string
  owner: string
  status: DeadlineStatus
  priority: Priority
  escalation?: string
}

export interface Financials {
  originalDemand: number
  currentExposure: number
  sellerOffer: number | null
  buyerCounter: number | null
  sellerCounter: number | null
  auctionDecision: number | null
  settlement: number | null
  repairCost: number
  transportationCost: number
  otherCost: number
  finalSellerCost: number | null
}

export interface ArbitrationCase {
  id: string
  organizationId: string
  locationId: string
  caseNumber: string
  year: number
  make: string
  model: string
  trim?: string
  vin: string
  mileage?: number
  auctionId: string
  auction: string
  buyer: string
  seller: string
  sellerLocation: string
  saleDate: string
  claimDate: string
  claimReason: string
  claimType: string
  auctionContact: string
  stage: CaseStage
  actionState: ActionState
  priority: Priority
  deadline: string
  originalExposure: number
  currentExposure: number
  assignedUserId: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  documents: CaseDocument[]
  timeline: TimelineEvent[]
  messages: Message[]
  offers: NegotiationOffer[]
  tasks: CaseTask[]
  deadlines: CaseDeadline[]
  financials: Financials
  notes: string[]
  reviewNotes?: string
  nextAction?: string
  resolution?: ResolutionOutcome
  returnStep?: ReturnStep
}

export interface ExtractedField {
  key: ExtractedFieldKey
  field: ExtractedFieldKey
  label: string
  value: string
  confidence: number
  source: "email_body" | "subject" | "attachment"
}

export interface ExtractionResult {
  fields: ExtractedField[]
  needsReview: boolean
  reviewReasons: string[]
  possibleMatchId: string | null
  matchConfidence: number | null
  attachments: string[]
}

export interface SampleEmail {
  id: string
  label: string
  description: string
  from: string
  to: string
  subject: string
  receivedAt: string
  body: string
  attachments: string[]
}

export interface EmailIntake {
  id: string
  organizationId: string
  receivedAt: string
  from: string
  to: string
  auction: string
  subject: string
  vin: string
  buyer: string
  amount: number | null
  confidence: number | null
  status: IntakeStatus
  body: string
  attachments: string[]
  caseId?: string
  sampleId?: "high-confidence" | "needs-review"
}

export interface AuctionResultRow {
  auction: string
  open: number
  settled: number
  exposure: number
  paid: number
  saved: number
}

export interface RuleRow {
  id: string
  name: string
  set: string
  auction: string
  claimCategory: string
  responseWindow: string
  evidenceWindow: string
  escalation: string
  active: boolean
}
