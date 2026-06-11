#!/usr/bin/env node
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');
const prospectsCsv = path.join(root, 'b2b_saas_ai_homepage_teardown_prospects.csv');
const logPath = path.join(root, 'logs', 'outreach.jsonl');
const sentEmails = new Set();
fs.mkdirSync(path.dirname(logPath), {recursive:true});
if (fs.existsSync(logPath)) {
  for (const line of fs.readFileSync(logPath,'utf8').split(/\n/).filter(Boolean)) {
    try { const j = JSON.parse(line); if (j.email && j.status === 'sent') sentEmails.add(j.email.toLowerCase()); } catch {}
  }
}
function parseCSV(text){
  const rows=[]; let row=[], val='', q=false;
  for(let i=0;i<text.length;i++){const c=text[i], n=text[i+1];
    if(q && c==='"' && n==='"'){val+='"'; i++;}
    else if(c==='"'){q=!q;}
    else if(!q && c===','){row.push(val); val='';}
    else if(!q && (c==='\n' || c==='\r')){ if(c==='\r' && n==='\n') i++; row.push(val); if(row.some(x=>x.trim())) rows.push(row); row=[]; val='';}
    else val+=c;
  }
  if(val || row.length){row.push(val); rows.push(row)}
  return rows;
}
const rows = parseCSV(fs.readFileSync(prospectsCsv,'utf8')).slice(1).map(r=>({company:r[0], website:r[1], contact:r[2], issue:r[3], sources:r[4]}));
const max = Number(process.argv.find(a=>a.startsWith('--max='))?.split('=')[1] || 10);
const dry = process.argv.includes('--dry-run');
let attempted=0, sent=0, skipped=0, errors=0;
for(const p of rows){
  if(attempted>=max) break;
  const email = (p.contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0];
  if(!email){ skipped++; continue; }
  if(sentEmails.has(email.toLowerCase())){ skipped++; continue; }
  const subject = `quick homepage teardown note for ${p.company.replace(/ \(.+\)/,'')}`;
  const body = `Hi ${p.company.replace(/ \(.+\)/,'')} team,\n\nI noticed one possible homepage friction point on ${p.company.replace(/ \(.+\)/,'')}: ${p.issue}\n\nI’m opening 5 founding slots for a $199 B2B SaaS homepage teardown this week. It’s a 48-hour written review covering the hero message, CTA path, proof/trust signals, and the 10 fixes I’d prioritize before sending more traffic.\n\nWant me to send a sample report format, or should I look at ${p.company.replace(/ \(.+\)/,'')} as one of the slots?\n\nNo pressure either way — reply "no" and I won’t follow up.\n\nBrett\nhttps://bch1212.github.io/saas-homepage-teardown-sprint/\n`;
  attempted++;
  if(dry){
    console.log(`DRY ${email} ${subject}`);
    continue;
  }
  const raw = `From: Brett Halverson <brett@vikinetic.com>\nTo: ${email}\nSubject: ${subject}\nContent-Type: text/plain; charset=utf-8\n\n${body}`;
  const res = spawnSync('himalaya', ['message','send'], {input:raw, encoding:'utf8'});
  const rec = {ts:new Date().toISOString(), company:p.company, email, subject, status:res.status===0?'sent':'error', returncode:res.status, stdout:res.stdout, stderr:res.stderr};
  fs.appendFileSync(logPath, JSON.stringify(rec)+'\n');
  if(res.status===0) sent++; else errors++;
  console.log(`${rec.status.toUpperCase()} ${email}`);
}
console.log(JSON.stringify({attempted,sent,skipped,errors,logPath}, null, 2));
if(errors) process.exit(2);
