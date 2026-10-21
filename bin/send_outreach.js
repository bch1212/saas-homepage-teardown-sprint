#!/usr/bin/env node
// Low-volume outreach sender.
// Prospect file: PROSPECTS_CSV or --csv= (default samples/sample-prospects.csv).
// Sender identity: FROM_NAME, FROM_EMAIL, PUBLIC_SITE_URL (see .env.example).
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnvFile(path.join(root, '.env'));

function resolveProspectsPath() {
  const fromArg = process.argv.find((a) => a.startsWith('--csv='));
  const configured = fromArg ? fromArg.slice('--csv='.length) : process.env.PROSPECTS_CSV;
  if (!configured) return path.join(root, 'samples', 'sample-prospects.csv');
  return path.isAbsolute(configured) ? configured : path.resolve(root, configured);
}

const prospectsCsv = resolveProspectsPath();
const sampleCsv = path.join(root, 'samples', 'sample-prospects.csv');
const fromName = process.env.FROM_NAME || 'Alex Example';
const fromEmail = process.env.FROM_EMAIL || 'alex@example.com';
const publicSite = process.env.PUBLIC_SITE_URL || 'https://example.com/';
const logPath = path.join(root, 'logs', 'outreach.jsonl');
const sentEmails = new Set();
if (fs.existsSync(logPath)) {
  for (const line of fs.readFileSync(logPath, 'utf8').split(/\n/).filter(Boolean)) {
    try { const j = JSON.parse(line); if (j.email && j.status === 'sent') sentEmails.add(j.email.toLowerCase()); } catch {}
  }
}
function parseCSV(text) {
  const rows = []; let row = [], val = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (q && c === '"' && n === '"') { val += '"'; i++; }
    else if (c === '"') { q = !q; }
    else if (!q && c === ',') { row.push(val); val = ''; }
    else if (!q && (c === '\n' || c === '\r')) { if (c === '\r' && n === '\n') i++; row.push(val); if (row.some((x) => x.trim())) rows.push(row); row = []; val = ''; }
    else val += c;
  }
  if (val || row.length) { row.push(val); rows.push(row); }
  return rows;
}
if (!fs.existsSync(prospectsCsv)) {
  console.error('Prospect file not found. Set PROSPECTS_CSV or pass --csv=.');
  process.exit(1);
}
const rows = parseCSV(fs.readFileSync(prospectsCsv, 'utf8')).slice(1).map((r) => ({ company: r[0], website: r[1], contact: r[2], issue: r[3], sources: r[4] }));
const max = Number(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] || 10);
const dry = process.argv.includes('--dry-run');
const placeholderSender = !fromEmail.includes('@') || /@example\.(com|org|net)$/i.test(fromEmail);
const usingSample = path.resolve(prospectsCsv) === path.resolve(sampleCsv);
if (!dry && (placeholderSender || usingSample)) {
  console.error('Refusing to send. Set FROM_EMAIL and pass a local prospect file with PROSPECTS_CSV or --csv=. Re-run with --dry-run to preview.');
  process.exit(1);
}
let attempted = 0, sent = 0, skipped = 0, errors = 0;
for (const p of rows) {
  if (attempted >= max) break;
  const email = (p.contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
  if (!email) { skipped++; continue; }
  if (sentEmails.has(email.toLowerCase())) { skipped++; continue; }
  const company = p.company.replace(/ \(.+\)/, '');
  const subject = `quick homepage teardown note for ${company}`;
  const body = `Hi ${company} team,\n\nI noticed one possible homepage friction point on ${company}: ${p.issue}\n\nI’m opening 5 founding slots for a $199 B2B SaaS homepage teardown this week. It’s a 48-hour written review covering the hero message, CTA path, proof/trust signals, and the 10 fixes I’d prioritize before sending more traffic.\n\nWant me to send a sample report format, or should I look at ${company} as one of the slots?\n\nNo pressure either way — reply "no" and I won’t follow up.\n\n${fromName}\n${publicSite}\n`;
  attempted++;
  if (dry) {
    console.log(`DRY ${company}`);
    continue;
  }
  const raw = `From: ${fromName} <${fromEmail}>\nTo: ${email}\nSubject: ${subject}\nContent-Type: text/plain; charset=utf-8\n\n${body}`;
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const res = spawnSync('himalaya', ['message', 'send'], { input: raw, encoding: 'utf8' });
  const rec = { ts: new Date().toISOString(), company: p.company, email, subject, status: res.status === 0 ? 'sent' : 'error', returncode: res.status, stdout: res.stdout, stderr: res.stderr };
  fs.appendFileSync(logPath, JSON.stringify(rec) + '\n');
  if (res.status === 0) sent++; else errors++;
  console.log(`${rec.status.toUpperCase()} ${company}`);
}
console.log(JSON.stringify({ attempted, sent, skipped, errors, dryRun: dry }, null, 2));
if (errors) process.exit(2);
