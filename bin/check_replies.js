#!/usr/bin/env node
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');
const stateDir = path.join(process.env.HOME || '.', '.hermes', 'state');
fs.mkdirSync(stateDir, {recursive:true});
const statePath = path.join(stateDir, 'saas-homepage-teardown-sprint-reply-watch.json');
const outreachLog = path.join(root, 'logs', 'outreach.jsonl');
const dry = process.argv.includes('--dry-run');
let state = {seen:[]};
if(fs.existsSync(statePath)){ try{ state=JSON.parse(fs.readFileSync(statePath,'utf8')); }catch{} }
const contacted=[];
if(fs.existsSync(outreachLog)){
  for(const line of fs.readFileSync(outreachLog,'utf8').split(/\n/).filter(Boolean)){
    try{ const j=JSON.parse(line); if(j.email && j.status === 'sent') contacted.push(j.email.toLowerCase()); }catch{}
  }
}
if(dry){ console.log(JSON.stringify({statePath,outreachLog,contacted:contacted.length,dryRun:true}, null, 2)); process.exit(0); }
const query = 'SaaS Homepage Teardown OR "homepage teardown" OR "sample report" OR "no"';
const res = spawnSync('/usr/local/bin/himalaya', ['envelope','list','--page-size','50'], {encoding:'utf8', timeout:30000});
if (res.error && res.error.code === 'ETIMEDOUT') {
  console.log(JSON.stringify({checked:false, error:'himalaya envelope list timed out', contacted:contacted.length, statePath}, null, 2));
  process.exit(0);
}
const output = (res.stdout || '') + (res.stderr || '');
const hits=[];
for(const email of contacted){
  const domain = email.split('@')[1];
  if(output.toLowerCase().includes(email) || (domain && output.toLowerCase().includes(domain))){ hits.push({email, domain}); }
}
const sig = JSON.stringify(hits);
if(hits.length && !state.seen.includes(sig)){
  console.log('Potential SaaS Homepage Teardown reply/bounce activity:');
  console.log(JSON.stringify(hits, null, 2));
  state.seen.push(sig);
}
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log(JSON.stringify({checked:true, contacted:contacted.length, hits:hits.length, statePath}, null, 2));
