// Pull the geometry section out of the app and render a proof sheet + simulate tracing.
const fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8');
const js=src.match(/<script>([\s\S]*)<\/script>/)[1];
const geo=js.slice(js.indexOf('const L = {'), js.indexOf('/* ---------- Storage'));
const api=new Function(geo+'; return {model,svgOf,L,DIG,SP,dist};')();
const {model,SP,dist}=api;
const items=[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),"Leo","Ava","Tim","Ella","Jack","Zoe","Bob","Sam","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","cat","love","boat","jump","snail","wow","box","the"];
// proof sheet
let x=0,y=0,rowH=340,cells=[],maxW=2200,rowX=0;
const parts=[];
for(const t of items){const m=model(t);const w=(m.maxX-m.minX)+60; if(rowX+w>maxW){rowX=0;y+=rowH;}
  const ox=rowX-m.minX+30, oy=y+230;
  parts.push(`<g transform="translate(${ox},${oy})"><line x1="${m.minX-25}" x2="${m.maxX+25}" y1="-200" y2="-200" stroke="#9bd" stroke-width="2"/><line x1="${m.minX-25}" x2="${m.maxX+25}" y1="-100" y2="-100" stroke="#9bd" stroke-dasharray="8 8" stroke-width="2"/><line x1="${m.minX-25}" x2="${m.maxX+25}" y1="0" y2="0" stroke="#d77" stroke-width="2"/>`+
   m.strokes.map((s,k)=>`<polyline fill="none" stroke="${k?'#c60':'#234'}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" points="${s.pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/><circle cx="${s.pts[0][0]}" cy="${s.pts[0][1]}" r="9" fill="#2a2"/>`+s.cks.map(c=>`<circle cx="${s.pts[c][0]}" cy="${s.pts[c][1]}" r="5" fill="#fff" stroke="#2a2" stroke-width="2"/>`).join('')).join('')+`<text x="${m.minX}" y="95" font-size="28" fill="#888">${t}</text></g>`);
  rowX+=w+20;}
const H=y+rowH;
fs.writeFileSync(process.argv[3],`<svg xmlns="http://www.w3.org/2000/svg" width="${maxW}" height="${H}" viewBox="0 0 ${maxW} ${H}"><rect width="100%" height="100%" fill="#fff"/>${parts.join('')}</svg>`);
// simulate: move the pointer along the true path with jitter; check every stroke completes with the app's tracking rule
function trace(m,tol,jit){let mistakes=0;
  for(const s of m.strokes){ if(s.len<16) continue; let p=0,n=s.pts.length; let done=false;
    for(let i=0;i<n;i+=2){const q=s.pts[i]; const pt=[q[0]+(Math.random()*2-1)*jit,q[1]+(Math.random()*2-1)*jit];
      const maxJ=Math.min(n-1,p+Math.ceil(tol*2.4/SP)); let best=1e9,bi=p;
      for(let j=p;j<=maxJ;j++){const d=dist(s.pts[j],pt); if(d<best){best=d;bi=j;} else if(best<=tol&&d>best+6) break;}
      if(best<=tol){ if(bi>p)p=bi; if(p>=n-1-Math.ceil(3/SP)){done=true;break;} } else {mistakes++;}
    }
    if(!done){ const end=s.pts[s.pts.length-1]; const pt=end; const maxJ=Math.min(n-1,p+Math.ceil(tol*2.4/SP)); let best=1e9,bi=p; for(let j=p;j<=maxJ;j++){const d=dist(s.pts[j],pt); if(d<best){best=d;bi=j;}} if(best<=tol) p=bi; done=p>=n-1-Math.ceil(3/SP);}
    if(!done) return {ok:false,mistakes,stuckAt:p,of:n};
  } return {ok:true,mistakes};}
// skip check: a shortcut that jumps straight across should NOT complete
function shortcut(m,tol){ const s=m.strokes[0]; let p=0,n=s.pts.length; const a=s.pts[0], b=s.pts[n-1];
  for(let k=0;k<=60;k++){const pt=[a[0]+(b[0]-a[0])*k/60,a[1]+(b[1]-a[1])*k/60]; const maxJ=Math.min(n-1,p+Math.ceil(tol*2.4/SP)); let best=1e9,bi=p;
    for(let j=p;j<=maxJ;j++){const d=dist(s.pts[j],pt); if(d<best){best=d;bi=j;} else if(best<=tol&&d>best+6) break;} if(best<=tol&&bi>p)p=bi;}
  return p/(n-1); }
const bad=[];
for(const t of items){const m=model(t); for(const [tol,jit] of [[28,8],[20,6],[14,4]]){ const r=trace(m,tol,jit); if(!r.ok) bad.push(t+' tol'+tol+' '+JSON.stringify(r)); }}
console.log('letters that could not be finished:',bad.length?bad:'none');
console.log('shortcut progress (should be well below 1):',items.filter(t=>t.length===1&&!/[0-9]/.test(t)).map(t=>t+':'+shortcut(model(t),28).toFixed(2)).join(' '));
