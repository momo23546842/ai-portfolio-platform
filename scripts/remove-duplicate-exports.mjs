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
    let orig = txt;
    // normalize newlines
    txt = txt.replace(/\r\n/g,'\n');
    // Remove duplicate 'use client' occurrences, keep first
    const useClientRegex = /(^|\n)\s*['"]use client['"]\s*(\n|$)/g;
    let firstUseClientFound = false;
    txt = txt.replace(useClientRegex, (m)=>{
      if(!firstUseClientFound){ firstUseClientFound = true; return '"use client"\n\n'; }
      return '\n';
    });

    // Remove duplicate export { ... } for the same identifiers
    // Collect exported names in order and remove subsequent exports of same single-name exports
    const exportRegex = /export\s*\{\s*([^}]+)\s*\}\s*/g;
    const seenNames = new Set();
    txt = txt.replace(exportRegex, (m, p1)=>{
      // get individual names
      const names = p1.split(',').map(s=>s.trim()).filter(Boolean);
      const newNames = [];
      for(const n of names){
        // handle 'as' renames: take leftmost name
        const short = n.split(/\s+as\s+/)[0].trim();
        if(!seenNames.has(short)){
          seenNames.add(short);
          newNames.push(n);
        }
      }
      if(newNames.length === 0) return '';
      return `export { ${newNames.join(', ')} }\n`;
    });

    // Trim trailing whitespace
    txt = txt.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trimEnd() + '\n';

    if(txt !== orig){
      await fs.writeFile(p, txt, 'utf8');
      console.log('Fixed exports/use client in', f);
      changed++;
    }
  }
  console.log('Done. Files changed:', changed);
}

run().catch(err=>{console.error(err); process.exit(1);});
