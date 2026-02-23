import fs from 'fs/promises';
import path from 'path';

const dir = path.resolve('components/ui');

function parseImport(line){
  // match import ... from 'module' or import 'module'
  const m = line.match(/import\s+(.*)\s+from\s+['"](.*)['"];?$/);
  if(m){
    return {spec: m[1].trim(), module: m[2].trim(), raw: line};
  }
  const m2 = line.match(/import\s+['"](.*)['"];?$/);
  if(m2) return {spec: null, module: m2[1].trim(), raw: line};
  return null;
}

async function run(){
  const files = await fs.readdir(dir);
  let changed = 0;
  for(const f of files){
    if(!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
    const p = path.join(dir,f);
    let txt = await fs.readFile(p,'utf8');
    const orig = txt;
    txt = txt.replace(/\r\n/g,'\n');
    // Ensure single use client at top
    const useClientMatch = txt.match(/^[ \t]*(['\"])use client\1\s*\n?/);
    let headerStart = 0;
    if(useClientMatch){
      headerStart = useClientMatch[0].length;
      // remove additional ones later
    }
    // Extract import block: from start (after any use client) through consecutive import lines
    const rest = txt.slice(headerStart);
    const lines = rest.split('\n');
    const importLines = [];
    let i = 0;
    for(; i<lines.length; i++){
      const line = lines[i];
      if(line.trim().startsWith('import ')) importLines.push(line);
      else if(line.trim() === '') importLines.push(line); // allow blank lines in import block
      else break;
    }
    const afterImports = lines.slice(i).join('\n');

    // Deduplicate imports: keep first occurrence per raw line, and also prefer merging same-module named imports
    const seenRaw = new Set();
    const importsByModule = new Map();
    const sideEffectImports = new Set();

    for(const line of importLines){
      if(!line.trim()) continue;
      const parsed = parseImport(line.trim());
      if(!parsed){
        if(!seenRaw.has(line)){
          seenRaw.add(line);
        }
        continue;
      }
      if(parsed.spec === null){
        // side-effect import
        if(!sideEffectImports.has(parsed.module)){
          sideEffectImports.add(parsed.module);
          seenRaw.add(line.trim());
        }
        continue;
      }
      // named or default imports
      const key = parsed.module;
      if(!importsByModule.has(key)){
        importsByModule.set(key, parsed.spec);
        seenRaw.add(line.trim());
      } else {
        // merge if both are named imports like {A, B}
        const prev = importsByModule.get(key);
        // simplify: if both are exactly same, skip; otherwise, create a merged spec by concatenation if both are {...}
        if(prev === parsed.spec) continue;
        // handle {..} form
        const clean = (s)=>s.replace(/[{}]/g,'').split(',').map(x=>x.trim()).filter(Boolean);
        if(prev.startsWith('{') && parsed.spec.startsWith('{')){
          const merged = Array.from(new Set([...clean(prev), ...clean(parsed.spec)])).join(', ');
          const mergedSpec = `{ ${merged} }`;
          importsByModule.set(key, mergedSpec);
        } else {
          // different forms (default + named) or other, keep first and ignore subsequent
          continue;
        }
      }
    }

    // rebuild import block
    const rebuilt = [];
    // if use client existed, keep it once at top
    if(useClientMatch){
      rebuilt.push(useClientMatch[0].trim());
    }
    // add importsByModule entries
    for(const [module,spec] of importsByModule.entries()){
      rebuilt.push(`import ${spec} from '${module}'`);
    }
    // add side-effect imports
    for(const module of sideEffectImports){
      rebuilt.push(`import '${module}'`);
    }

    // For any other unique raw imports not parsed (rare), add them
    for(const raw of seenRaw){
      const parsed = parseImport(raw);
      if(parsed) continue;
      rebuilt.push(raw);
    }

    const newText = rebuilt.join('\n') + '\n\n' + afterImports.trimStart() + (txt.endsWith('\n')? '\n' : '');

    if(newText !== txt){
      await fs.writeFile(p, newText, 'utf8');
      console.log('Normalized imports in', f);
      changed++;
    }
  }
  console.log('Done. Files changed:', changed);
}

run().catch(err=>{console.error(err); process.exit(1)});
