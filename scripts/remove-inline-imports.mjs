import fs from 'fs/promises';
import path from 'path';

const dir = path.resolve('components/ui');

async function run(){
  const files = await fs.readdir(dir);
  let changed = 0;
  for(const f of files){
    if(!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
    const p = path.join(dir,f);
    let txt = await fs.readFile(p,'utf8');
    const orig = txt;
    txt = txt.replace(/\r\n/g,'\n');
    // find first non-import line after the header
    const lines = txt.split('\n');
    let headerEnd = 0;
    // skip leading use client if present
    let i=0;
    if(lines[i] && lines[i].match(/^\s*(['"]use client['"])\s*$/)) i++;
    for(; i<lines.length; i++){
      const l = lines[i].trim();
      if(l.startsWith('import ')|| l === ''){
        headerEnd = i+1;
        continue;
      }
      break;
    }
    // Remove any 'import ' occurrences after headerEnd
    let changedLocal = false;
    for(let j = headerEnd; j<lines.length; j++){
      if(lines[j].trim().startsWith('import ')){
        lines[j] = '';
        changedLocal = true;
      }
    }
    if(changedLocal){
      const newText = lines.join('\n').replace(/\n{3,}/g,'\n\n').trimEnd() + '\n';
      await fs.writeFile(p,newText,'utf8');
      console.log('Removed inline imports in', f);
      changed++;
    }
  }
  console.log('Done. Files changed:', changed);
}

run().catch(err=>{console.error(err); process.exit(1);});
