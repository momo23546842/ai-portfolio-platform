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
    const occurrences = (txt.match(/import \* as React from 'react'/g) || []).length;
    if(occurrences <= 1) continue;
    // Find first export occurrence
    let exportIdx = txt.search(/\nexport\s/);
    if(exportIdx === -1) exportIdx = txt.search(/\nexport\s+default|\nexport\s+\{|\nexport\s+const|\nexport\s+function/);
    let endIdx;
    if(exportIdx !== -1){
      // find end of export block (next empty line) or end of file
      const doubleNewline = txt.indexOf('\n\n', exportIdx);
      if(doubleNewline !== -1) endIdx = doubleNewline;
      else endIdx = txt.length;
    } else {
      // fallback: keep content up to first blank line after the first occurrence of import
      const firstImportIdx = txt.indexOf("import * as React from 'react'");
      const nextBlank = txt.indexOf('\n\n', firstImportIdx);
      endIdx = nextBlank !== -1 ? nextBlank : txt.length;
    }

    const newText = txt.slice(0, endIdx).trimEnd() + '\n\n';
    if(newText !== txt){
      await fs.writeFile(p, newText, 'utf8');
      console.log('Updated', f);
      changed++;
    }
  }
  console.log('Done. Files changed:', changed);
}

run().catch(err=>{console.error(err); process.exit(1)});
