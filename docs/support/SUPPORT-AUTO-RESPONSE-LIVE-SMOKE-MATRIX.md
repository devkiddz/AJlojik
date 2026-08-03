# AJ Logik Support Auto Response — Live Smoke Matrix

## Customer Guide

| Test | Action | Expected result |
|---|---|---|
| Greeting | Send `Hi..` | Greeting intent answers naturally. |
| Platform information | Ask `What is AJ Logik?` | Approved database answer is returned. |
| Shopping guidance | Ask `How do I buy on AJ Logik?` | Approved buying steps and actions appear. |
| Product context | Ask whether a real published product is available | Verified product, variant and inventory context is used. |
| Explicit order | Ask about a real owned order number | Only the signed-in customer’s order is resolved. |
| Safe inference | Ask `Where is my order?` with one clear active order | The single safe order is selected. |
| Ambiguity | Ask `Where is my order?` with multiple possible orders | AJ Intelligence asks for clarification. |
| Payment | Ask for help with a real payment | Verified state is used without exposing raw references. |
| Delivery | Ask about a real delivery | Verified delivery status is used. |
| Age eligibility | Ask for alcohol eligibility | Identity or age verification is not invented. |
| Clear chat | Click Clear beside the input | Only the visible Guide conversation resets. |
| Shortcut | Press Ctrl/Cmd + Shift + Backspace | The current Guide conversation clears. |
| Undo | Click Undo within eight seconds | The cleared conversation returns. |
| Helpful feedback | Select Yes | Feedback is recorded for the interaction. |
| Unhelpful feedback | Select Not really and add a reason | Negative feedback and reason are recorded. |
| Human handoff | Continue with a human Support agent | A real case opens with transcript and verified references. |

## Ownership and privacy

| Test | Action | Expected result |
|---|---|---|
| Foreign order reference | Enter another customer’s order number | No foreign order data is revealed. |
| Foreign interaction feedback | Submit feedback for another customer’s interaction | Request is rejected or not found. |
| Unauthenticated Guide | POST without a session | 401 or 403. |
| Unauthenticated case | POST without a session | No case is created. |
| Unauthenticated Knowledge Studio | Request admin API without access | 401 or 403. |
| Sensitive context | Inspect Guide and case metadata | No exact address, raw payment reference, dispatcher secret or provider payload is exposed. |

## Human Support continuity

| Test | Action | Expected result |
|---|---|---|
| Case category | Handoff from order, payment and delivery intents | Category matches the originating intent. |
| Priority | Handoff from payment/account failure | Governed higher priority is used. |
| Transcript | Open the case | Customer and Guide transcript is preserved. |
| Knowledge link | Inspect the interaction | Originating interaction links to the case. |
| Live reply | Agent replies | Customer receives the reply through existing Quick Support. |
| Existing cases | Open prior cases | Previous history remains intact. |

## Knowledge Studio

| Test | Action | Expected result |
|---|---|---|
| Access control | Open without configure permission | Mutation controls are denied. |
| Existing authority | Open as authorized admin | Active, draft and archived entries load. |
| Draft | Create a draft | Runtime matcher does not use it. |
| Publish safeguard | Publish without examples | Request is rejected. |
| Publish | Add answer and example, then publish | Entry becomes active and version increments. |
| Runtime activation | Ask the new approved question | Published answer resolves. |
| Archive | Archive the entry | It leaves active runtime authority. |
| Learning evidence | Open Learning | Unresolved and unhelpful clusters appear. |
| Prepare draft | Select a candidate | Evidence copies into an unsaved draft; answer remains human-authored. |
| Audit | Review audit events | Create, update, publish and archive actions are recorded. |

## Operational quality

| Test | Action | Expected result |
|---|---|---|
| Desktop | Complete the full Guide flow | Input, actions, feedback and clear control remain usable. |
| Mobile | Complete the flow on a phone | Composer, scrolling and handoff remain usable above the keyboard. |
| Reconnect | Interrupt and restore network | Clear status is shown and continuation is safe. |
| Repetition | Ask several questions | No duplicated uncontrolled result sections appear. |
| Latency | Observe normal Guide questions | No noticeable regression or blocking delay. |
| Logs | Review production logs | No repeated Prisma, route, authorization or serialization errors. |

## Closure record

```text
Production URL:
Deployment commit:
Deployment ID:
Migration status:
Production knowledge inventory:
Customer tester:
Admin tester:
Desktop result:
Mobile result:
Human handoff result:
Knowledge Studio result:
Security boundary result:
Observed latency:
Open defects:
Closure decision:
Date:
```
