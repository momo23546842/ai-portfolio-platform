import fs from 'fs/promises';
import path from 'path';

const dir = path.resolve('components/ui');

async function normalize(pattern){
  const files = await fs.readdir(dir);
  let changed = 0;
  const regex = new RegExp(pattern,'g');
  for(const f of files){
    if(!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
    const p = path.join(dir, f);
    let txt = await fs.readFile(p, 'utf8');
    const matches = txt.match(regex);
    if(!matches || matches.length <= 1) continue;
    // remove all occurrences
    const cleaned = txt.replace(regex, '');
    // decide where to insert single import
    const m = matches[0];
    let newText;
    if(cleaned.startsWith("'use client'") || cleaned.startsWith('"use client"')){
      const firstLineEnd = cleaned.indexOf('\n') + 1;
      newText = cleaned.slice(0, firstLineEnd) + m + cleaned.slice(firstLineEnd).trimStart();
    } else {
      newText = m + cleaned.trimStart();
    }
    await fs.writeFile(p, newText, 'utf8');
    console.log('Normalized', pattern, 'in', f);
    changed++;
  }
  return changed;
}

async function run(){
  let total = 0;
  total += await normalize("import \\* as React from 'react'\\s*\\n");
  total += await normalize("import .* from 'class-variance-authority'\\s*\\n");
  console.log('Done. Total files changed:', total);
}

run().catch(err=>{console.error(err); process.exit(1)});
