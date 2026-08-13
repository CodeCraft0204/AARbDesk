import type {
  ExtractedField,
  ExtractedFieldKey,
  ExtractionResult,
  ArbitrationCase,
} from "@/lib/types"

const LABELS: { key: ExtractedFieldKey; label: string; patterns: RegExp[] }[] = [
  {
    key: "vin",
    label: "VIN",
    patterns: [
      /VIN:\s*([A-HJ-NPR-Z0-9?]{11,17})/i,
      /\bVIN\b[^A-HJ-NPR-Z0-9?]*([A-HJ-NPR-Z0-9?]{11,17})/i,
    ],
  },
  {
    key: "vehicle",
    label: "Vehicle",
    patterns: [/Vehicle:\s*(.+)$/im],
  },
  {
    key: "auction",
    label: "Auction",
    patterns: [/Auction:\s*(.+)$/im],
  },
  {
    key: "buyer",
    label: "Buyer",
    patterns: [/Buyer:\s*(.+)$/im],
  },
  {
    key: "seller",
    label: "Seller",
    patterns: [/Seller:\s*(.+)$/im],
  },
  {
    key: "sellerLocation",
    label: "Seller location",
    patterns: [/Seller Location:\s*(.+)$/im],
  },
  {
    key: "saleDate",
    label: "Sale date",
    patterns: [/Sale Date:\s*(.+)$/im],
  },
  {
    key: "claimDate",
    label: "Claim date",
    patterns: [/Claim Date:\s*(.+)$/im],
  },
  {
    key: "claimReason",
    label: "Claim",
    patterns: [/Claim Reason:\s*(.+)$/im, /Claim:\s*(.+)$/im],
  },
  {
    key: "amountRequested",
    label: "Requested Amount",
    patterns: [
      /Buyer Requested Amount:\s*(\$[\d,]+(?:\.\d{2})?)/im,
      /Requested(?: Amount)?:\s*(\$[\d,]+(?:\.\d{2})?)/im,
    ],
  },
  {
    key: "auctionContact",
    label: "Auction contact",
    patterns: [/Auction Contact:\s*(.+)$/im],
  },
  {
    key: "deadline",
    label: "Response Deadline",
    patterns: [/Response Required:\s*(.+)$/im],
  },
]

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
    if (match?.[0] && !match[1]) return match[0].trim()
  }
  return ""
}

function vinConfidence(vin: string) {
  if (!vin) return 0
  if (/\?/.test(vin) || vin.length < 17) return 78
  if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return 100
  return 86
}

function fieldConfidence(key: ExtractedFieldKey, value: string) {
  if (!value) return 0
  if (key === "vin") return vinConfidence(value)
  if (key === "amountRequested") return 99
  if (key === "auction") return 100
  if (key === "vehicle") return 98
  if (key === "buyer") return 96
  if (key === "seller") return 100
  if (key === "deadline") return 100
  if (key === "claimReason") return 92
  if (key === "saleDate" || key === "claimDate") return 94
  return 97
}

function normalizeVinPrefix(vin: string) {
  return vin.replace(/\?/g, "").replace(/[^A-HJ-NPR-Z0-9]/gi, "").toUpperCase()
}

export function findPossibleMatch(
  vin: string,
  cases: ArbitrationCase[]
): { id: string; confidence: number } | null {
  const prefix = normalizeVinPrefix(vin)
  if (prefix.length < 8) return null
  const exact = cases.find((item) => item.vin.toUpperCase() === vin.toUpperCase())
  if (exact) return { id: exact.id, confidence: 100 }
  if (!vin.includes("?") && vin.length === 17) return null
  const match = cases.find((item) =>
    normalizeVinPrefix(item.vin).startsWith(prefix.slice(0, Math.min(11, prefix.length)))
  )
  if (!match) return null
  return { id: match.id, confidence: 83 }
}

export function parseArbitrationEmail(
  raw: string,
  attachmentNames: string[] = [],
  cases: ArbitrationCase[] = []
): ExtractionResult {
  const fields: ExtractedField[] = LABELS.map((def) => {
    const value = firstMatch(raw, def.patterns)
    return {
      key: def.key,
      field: def.key,
      label: def.label,
      value,
      confidence: fieldConfidence(def.key, value),
      source: "email_body" as const,
    }
  }).filter((field) => field.value)

  if (attachmentNames.length) {
    fields.push({
      key: "attachments",
      field: "attachments",
      label: "Attachments",
      value: `${attachmentNames.length} files preserved`,
      confidence: 100,
      source: "attachment",
    })
  }

  const vin = fields.find((field) => field.key === "vin")
  const reviewReasons: string[] = []
  if (!vin) reviewReasons.push("VIN was not found in the message.")
  else if (vin.confidence < 90) {
    reviewReasons.push("VIN is incomplete or low-confidence.")
  }

  const match = vin ? findPossibleMatch(vin.value, cases) : null

  return {
    fields,
    needsReview: reviewReasons.length > 0,
    reviewReasons,
    possibleMatchId: match?.id ?? null,
    matchConfidence: match?.confidence ?? null,
    attachments: attachmentNames,
  }
}

export function fieldValue(result: ExtractionResult, key: ExtractedFieldKey) {
  return result.fields.find((field) => field.key === key)?.value ?? ""
}

export function parseVehicle(value: string) {
  const match = value.match(/^(\d{4})\s+(\S+)\s+(.+)$/)
  if (!match) {
    return { year: new Date().getFullYear(), make: "Unknown", model: value }
  }
  return { year: Number(match[1]), make: match[2], model: match[3] }
}

export function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
}

export function parseUsDate(value: string, hour = 17) {
  const slash = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (slash) {
    const [, month, day, year] = slash
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00-04:00`
  }
  const named = value.match(
    /([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})(?:\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM))?/i
  )
  if (named) {
    const month = MONTHS[named[1].toLowerCase()] ?? "01"
    const day = named[2].padStart(2, "0")
    const year = named[3]
    let h = hour
    if (named[4]) {
      h = Number(named[4]) % 12
      if (named[6]?.toUpperCase() === "PM") h += 12
    }
    return `${year}-${month}-${day}T${String(h).padStart(2, "0")}:${named[5] ?? "00"}:00-04:00`
  }
  return new Date().toISOString()
}
