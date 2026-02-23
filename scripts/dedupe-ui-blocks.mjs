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
    // Normalize newlines
    const norm = txt.replace(/\r\n/g,'\n');
    // Split into blocks by two or more newlines
    const blocks = norm.split(/\n{2,}/g).map(b=>b.trim());
    const seen = new Set();
    const outBlocks = [];
    for(const b of blocks){
      if(b === '') continue;
      if(!seen.has(b)){
        seen.add(b);
        outBlocks.push(b);
      }
    }
    const newText = outBlocks.join('\n\n') + (norm.endsWith('\n') ? '\n' : '');
    if(newText !== norm){
      await fs.writeFile(p, newText, 'utf8');
      console.log('Deduped', f);
      changed++;
    }
  }
  console.log('Done. Files changed:', changed);
}

run().catch(err=>{console.error(err); process.exit(1);});
