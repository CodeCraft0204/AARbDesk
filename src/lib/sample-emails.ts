import type { SampleEmail } from "@/lib/types"

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: "high-confidence",
    label: "Load Sample Arbitration Email",
    description: "Complete Manheim notice - high-confidence extraction",
    from: "arbitration@manheim-example.com",
    to: "arbitration@exampledealer.com",
    subject: "Arbitration Notification - VIN 1FTFW1E50PFA12345",
    receivedAt: "2026-08-12T10:42:00-04:00",
    attachments: [
      "Condition Report.pdf",
      "Engine Inspection.pdf",
      "Repair Estimate.pdf",
      "Damage Photo 01.jpg",
      "Damage Photo 02.jpg",
    ],
    body: `Arbitration Notification

FROM: arbitration@manheim-example.com
TO: arbitration@exampledealer.com
SUBJECT: Arbitration Notification - VIN 1FTFW1E50PFA12345

Auction: Manheim Atlanta
Vehicle: 2023 Ford F-150 Lariat
VIN: 1FTFW1E50PFA12345
Buyer: Southeast Auto Group
Seller: Premier Automotive Group
Seller Location: Atlanta North
Sale Date: August 6, 2026
Claim Date: August 12, 2026
Claim Reason: Undisclosed engine noise / internal engine condition
Buyer Requested Amount: $4,850
Response Required: August 15, 2026 at 5:00 PM
Auction Contact: Sarah Mitchell

Buyer reports abnormal engine noise discovered immediately after delivery.
Please review the attached condition report, inspection photographs, and repair estimate and respond before the arbitration deadline.

Sarah Mitchell
Arbitration Specialist
Manheim Atlanta
`,
  },
  {
    id: "needs-review",
    label: "Load Ambiguous Email",
    description: "Incomplete VIN - controlled automation",
    from: "arbitration@manheim-example.com",
    to: "arbitration@exampledealer.com",
    subject: "Arbitration Claim Opened - Please Review",
    receivedAt: "2026-08-13T09:18:00-04:00",
    attachments: ["Condition Report.pdf", "Buyer Photos.zip"],
    body: `Hello,

Please see the arbitration opened this morning.

Auction: Manheim Atlanta
VIN: 1FTFW1E50PFA???
Vehicle: 2023 Ford F-150 Lariat
Buyer: Metro Wholesale Auto
Seller: Premier Automotive Group
Seller Location: Atlanta North
Sale Date: July 29, 2026
Claim Date: August 13, 2026
Claim Reason: Frame damage not disclosed on CR
Buyer Requested Amount: $3,750
Response Required: August 16, 2026 at 5:00 PM
Auction Contact: Priya Nair

The VIN in the source notice appears truncated. Please confirm the vehicle before responding.

Manheim Atlanta Arbitration
`,
  },
]
