#!/usr/bin/env node
const fs = require('fs');
const input = process.argv[2];
const output = process.argv[3] || 'reports/generated-report.md';
if (!input) {
  console.error('Usage: node bin/generate_report.js input.json output.md');
  process.exit(1);
}
const d = JSON.parse(fs.readFileSync(input, 'utf8'));
const md = `# Homepage Teardown Report — ${d.company}

## Snapshot

- **Homepage:** ${d.homepage}
- **Target customer:** ${d.targetCustomer}
- **Primary conversion goal:** ${d.primaryGoal}
- **Observed hero:** ${d.observedHero}
- **Observed CTA:** ${d.observedCTA}

## Executive read

The homepage should answer three buyer questions in the first screen: who this is for, what painful workflow it improves, and why the next click is worth taking now. The current message appears broad enough that a qualified visitor may need to scroll or infer the use case before acting.

## Highest-priority fixes

1. **Make the H1 outcome-specific.** Replace broad category language with the buyer-owned workflow or metric.
2. **Make the CTA match intent.** If the buying motion is sales-led, use a demo/audit CTA instead of generic self-serve wording.
3. **Add proof before the first scroll.** Surface one customer, integration, metric, security note, or specific use case near the CTA.

## Hero rewrite directions

- "Help ${d.targetCustomer} fix [painful workflow] before it slows [business outcome]."
- "Turn [messy before-state] into [clear after-state] without [common objection]."
- "The [category] for ${d.targetCustomer} who need [primary job-to-be-done]."

## Prioritized 10-point action list

| Priority | Recommendation | Impact | Effort |
|---:|---|---|---|
| 1 | Rewrite hero around a concrete workflow outcome | High | Low |
| 2 | Change CTA from "${d.observedCTA}" to a specific next step | High | Low |
| 3 | Add a one-line proof strip under the CTA | High | Low |
| 4 | Name the ICP in the subhead | Medium | Low |
| 5 | Add a before/after visual or 3-step workflow | Medium | Medium |
| 6 | Move integrations/security/customer proof higher | Medium | Low |
| 7 | Add objection-handling FAQ near final CTA | Medium | Medium |
| 8 | Keep one dominant H1 and clear heading hierarchy | Medium | Low |
| 9 | Add a lower-intent secondary CTA | Medium | Low |
| 10 | Repeat primary CTA after use cases/proof | Medium | Low |

## Non-guarantee note

This report identifies likely clarity and conversion friction based on a manual page review. It does not guarantee conversion lift, revenue, rankings, funding, or compliance outcomes.
`;
fs.mkdirSync(require('path').dirname(output), {recursive:true});
fs.writeFileSync(output, md);
console.log(`Wrote ${output}`);
