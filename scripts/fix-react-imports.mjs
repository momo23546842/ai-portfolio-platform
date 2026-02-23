import fs from 'fs/promises';
import path from 'path';

const dir = path.resolve('components/ui');

async function run(){
  const files = await fs.readdir(dir);
  let changed = 0;
  for(const f of files){
    if(!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
    const p = path.join(dir, f);
    let txt = await fs.readFile(p, 'utf8');
    const regex = /import \* as React from 'react'\s*\n/g;
    const matches = txt.match(regex);
    if(!matches || matches.length <= 1) continue;
    // remove all occurrences
    const cleaned = txt.replace(regex, '');
    // decide where to insert single import
    let newText;
    if(cleaned.startsWith("'use client'") || cleaned.startsWith('"use client"')){
      const firstLineEnd = cleaned.indexOf('\n') + 1;
      newText = cleaned.slice(0, firstLineEnd) + "import * as React from 'react'\n" + cleaned.slice(firstLineEnd).trimStart();
    } else {
      newText = "import * as React from 'react'\n" + cleaned.trimStart();
    }
    await fs.writeFile(p, newText, 'utf8');
    console.log('Normalized React import in', f);
    changed++;
  }
  console.log('Done. Files normalized:', changed);
}

run().catch(err=>{console.error(err); process.exit(1)});
