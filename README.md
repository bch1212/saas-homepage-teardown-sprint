# SaaS Homepage Teardown Sprint

A 48-hour, fixed-price productized service for early-stage B2B SaaS and AI-tool teams that need clearer homepage messaging before launch, demo pushes, or paid traffic.

## Offer

- **Product:** B2B SaaS Homepage Teardown Sprint
- **Price:** $199 founding slot (5 slots)
- **Buyer:** founder/marketing lead at early-stage B2B SaaS or AI tool with a live homepage
- **Trigger:** recent launch, low demo/signup conversion, unclear positioning, upcoming Product Hunt / ads / sales push
- **Delivery:** written report with annotated first-impression notes, messaging rewrite suggestions, CTA/friction audit, trust-proof review, and prioritized 10-fix action plan
- **Turnaround:** 48 hours after fit confirmation, payment, and intake
- **Guarantee boundary:** If the buyer says the report has no actionable recommendations, redo once or refund. No conversion/revenue guarantees.

## MVP scope

Included:

1. Above-the-fold first-impression review.
2. ICP and positioning clarity notes.
3. Hero headline/subheadline/CTA rewrite options.
4. Trust signal and proof hierarchy observations.
5. Pricing/demo path friction notes when visible.
6. Prioritized 10-point fix list.
7. One concise markdown/PDF-ready report.

Non-goals:

- Full redesign or implementation.
- SEO, paid ads, analytics setup, or A/B testing.
- Legal/compliance review.
- Guaranteed conversion lift.
- Regulated medical/legal/financial/crypto/gambling claims.

## Files

- `index.html` — public landing page.
- `samples/sample-teardown.md` — sample deliverable.
- `templates/teardown-checklist.md` — repeatable review rubric.
- `templates/client-intake.md` — buyer intake template.
- `sales/offer.md` — offer and outreach positioning.
- `gtm/outreach-drafts.md` — outreach copy variants.
- `b2b_saas_ai_homepage_teardown_prospects.csv` — researched prospect list.
- `bin/generate_report.js` — minimal report generator.
- `bin/send_outreach.js` — low-volume outreach sender via Himalaya.
- `bin/check_replies.js` — reply/bounce watcher.

## Local verification

```bash
node bin/generate_report.js samples/sample-input.json reports/generated-sample-report.md
node bin/check_replies.js --dry-run
zip -r saas-homepage-teardown-sprint-kit.zip README.md index.html samples templates sales gtm reports bin b2b_saas_ai_homepage_teardown_prospects.csv
shasum -a 256 saas-homepage-teardown-sprint-kit.zip
```

## Fastest first-dollar path

1. Send a specific cold email to a founder/contact with one observable homepage friction point.
2. CTA: reply `teardown` with URL + target customer, or reply `sample` to see the report format.
3. Confirm fit manually.
4. Collect payment via Stripe/manual invoice if available; otherwise request confirmation and create invoice/payment link on intent.
5. Deliver report within 48 hours.
