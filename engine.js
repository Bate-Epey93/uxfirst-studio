/* ═══════════════════════════════════════════════════════════════
   UX-FIRST STUDIO — ENGINE
   ───────────────────────────────────────────────────────────────
   State, rendering, navigation, export, toasts. No user-facing
   copy or station definitions live here (that's content.js) and
   no IndexedDB internals (that's storage.js).
   ═══════════════════════════════════════════════════════════════ */

/* ---------- STATE & PERSISTENCE ---------- */
let store = { projects:{}, activeId:null, view:"learn", activeStation:"foundation" };

// Dirty tracking: field input marks its project dirty and the write
// piggybacks on the 650ms UI debounce — one saveProject per pause,
// not per keystroke. Rare click-driven changes flush immediately.
const dirtyProjects = new Set();
let metaDirty = false;
let realWorkSaved = false;   // gates the one-time persistence request

function markProject(id){ dirtyProjects.add(id); }
function markMeta(){ metaDirty = true; }

// Projects that already got their once-per-session auto-snapshot.
const sessionSnapshotted = new Set();

async function flushSaves(){
  const ids = [...dirtyProjects];
  dirtyProjects.clear();
  const hadMeta = metaDirty;
  try{
    for(const id of ids){
      const p = store.projects[id];
      if(!p) continue;
      if(!p.demo) realWorkSaved = true;
      if(!sessionSnapshotted.has(id)){
        // capture the pre-session state before the first overwrite
        sessionSnapshotted.add(id);
        await Store.snapshotFromDb(id, "auto", "Session start");
      }
      await Store.saveProject(id, p);
    }
    if(metaDirty){
      metaDirty = false;
      await Store.saveMeta({
        activeId: store.activeId, view: store.view, activeStation: store.activeStation,
        demoSeeded: store.demoSeeded, lastBackup: store.lastBackup
      });
    }
    maybeRequestPersistence();
    if(ids.length || hadMeta) writeLiveBackup();   // fire-and-forget; no-op unless connected
  }catch(e){ console.warn("save failed", e); }
}
function save(){ markMeta(); flushSaves(); }

function maybeRequestPersistence(){
  // After the first save of real (non-demo) content, ask the browser to
  // protect our storage from eviction. Once, and never nag about the result.
  if(!realWorkSaved || store.persistAsked) return;
  store.persistAsked = true;
  Store.saveMeta({ persistAsked:true });
  Store.requestPersistence();
}

// Switching apps on a phone must never lose the last sentence.
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") flushSaves(); });
window.addEventListener("pagehide", ()=>{ flushSaves(); });

// Mirrors the original load()'s normalization, run after boot and restore.
function normalizeState(){
  if(!store.projects) store.projects = {};
  if(!store.demoSeeded){
    const id = "demo_"+Date.now();
    store.projects[id] = { name:DEMO_PROJECT.name, created:Date.now(), demo:true, data:JSON.parse(JSON.stringify(DEMO_PROJECT.data)) };
    store.demoSeeded = true;
    if(!store.activeId) store.activeId = id;
    markProject(id); markMeta();
  }
  if(Object.keys(store.projects).length === 0){
    const id = "p"+Date.now();
    store.projects[id] = { name:"My First Project", created:Date.now(), data:{} };
    store.activeId = id;
    markProject(id); markMeta();
  }
  if(!store.activeId || !store.projects[store.activeId]){
    store.activeId = Object.keys(store.projects)[0];
    markMeta();
  }
  if(!store.view){ store.view = "learn"; markMeta(); }
  if(!store.activeStation){ store.activeStation = "foundation"; markMeta(); }
}

function applyConfig(){
  document.title = CONFIG.toolName.replace(/·/g,"") + " — " + CONFIG.tagline;
  document.getElementById("brandName").innerHTML = esc(CONFIG.toolName).replace(/·/g,"<span>·</span>");
  document.getElementById("brandSub").textContent = CONFIG.tagline;
  // A style tag, not inline styles — inline custom properties would override
  // the dark-mode media query. Dark variants derive from the fork's accent.
  let accentStyle = document.getElementById("accentStyle");
  if(!accentStyle){
    accentStyle = document.createElement("style");
    accentStyle.id = "accentStyle";
    document.head.appendChild(accentStyle);
  }
  accentStyle.textContent =
    `:root{--accent:${CONFIG.accent};--accent-deep:${CONFIG.accentDeep};--accent-wash:${CONFIG.accentWash};}` +
    `@media (prefers-color-scheme: dark){:root{` +
      `--accent:${CONFIG.accent};` +
      `--accent-deep:color-mix(in srgb, ${CONFIG.accent} 55%, #ffffff);` +
      `--accent-wash:color-mix(in srgb, ${CONFIG.accent} 16%, #16161c);}}`;
  document.getElementById("versionNote").textContent =
    "v" + (CONFIG.appVersion || "1.0.0") + " · offline · zero network requests · no accounts, no analytics";
}
function activeProject(){ return store.projects[store.activeId]; }
function fieldVal(stationId, fieldId){
  const p = activeProject();
  return (p && p.data[stationId] && p.data[stationId][fieldId]) || "";
}
function setFieldVal(stationId, fieldId, val){
  const p = activeProject();
  if(!p.data[stationId]) p.data[stationId] = {};
  p.data[stationId][fieldId] = val;
  markProject(store.activeId);   // written by the debounced flush
}

/* ---------- PROGRESS ---------- */
function stationFillState(st){
  if(!st.fields || st.fields.length===0) return "none";
  let filled = 0, total = st.fields.length;
  st.fields.forEach(f=>{ if(fieldVal(st.id,f.id).trim()) filled++; });
  if(st.ethics){ total++; if(fieldVal(st.id,"_ethics").trim()) filled++; }
  if(filled===0) return "none";
  if(filled>=total) return "full";
  return "partial";
}
function overallProgress(){
  let filled=0,total=0;
  STATIONS.forEach(st=>{
    if(!st.fields) return;
    st.fields.forEach(f=>{ total++; if(fieldVal(st.id,f.id).trim()) filled++; });
    if(st.ethics){ total++; if(fieldVal(st.id,"_ethics").trim()) filled++; }
  });
  return total ? Math.round(filled/total*100) : 0;
}

/* ---------- RENDER: SIDEBAR ---------- */
function renderProjects(){
  const sel = document.getElementById("projSelect");
  sel.innerHTML = "";
  Object.entries(store.projects).forEach(([id,p])=>{
    const o = document.createElement("option");
    o.value = id; o.textContent = p.name;
    if(id===store.activeId) o.selected = true;
    sel.appendChild(o);
  });
  const del = document.createElement("option");
  del.value = "__delete__"; del.textContent = "⌫ Delete current project…";
  sel.appendChild(del);
}
function renderNav(){
  const nav = document.getElementById("stationNav");
  nav.innerHTML = "";
  STATIONS.forEach(st=>{
    const a = document.createElement("div");
    a.className = "station-link"+(st.foundation?" foundation":"")+(st.id===store.activeStation?" active":"");
    const dotState = stationFillState(st);
    a.innerHTML = `
      <span class="sl-num">${st.num}</span>
      <span class="sl-title">${st.title}</span>
      ${st.fields && st.fields.length ? `<span class="sl-dot ${dotState}"></span>` : ""}
    `;
    a.onclick = ()=>{ store.activeStation = st.id; save(); renderAll(); closeSidebar(); document.getElementById("work").scrollTop=0; };
    nav.appendChild(a);
  });
}
function renderProgress(){
  const pct = overallProgress();
  document.getElementById("progFill").style.width = pct+"%";
  document.getElementById("progPct").textContent = pct+"%";
  // nudge a backup when real work has accumulated and none is recent
  const stale = pct >= 15 && (!store.lastBackup || Date.now() - store.lastBackup > 7*864e5);
  const bb = document.getElementById("backupBtn");
  bb.classList.toggle("nudge", stale);
  bb.title = stale ? "You have unsaved-to-file work — back up your data" : "";
}

/* ---------- RENDER: WORK AREA ---------- */
function esc(s){ return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function renderWork(){
  const st = STATIONS.find(s=>s.id===store.activeStation);
  const inner = document.getElementById("workInner");
  const sources = st.sources.map(s=>`<span class="src-chip"><b>${s[0]}</b> · ${s[1]}</span>`).join("");
  const hasApply = st.fields && st.fields.length>0;

  let html = `
    <div class="st-head">
      <div class="st-eyebrow">
        <span class="st-bignum">${st.num}</span>
        <span class="st-kicker">${st.kicker}</span>
      </div>
      <div class="st-title">${st.title}</div>
      <div class="st-sub">${st.sub}</div>
      <div class="st-sources">${sources}</div>
    </div>
  `;

  if(hasApply){
    html += `
      <div class="face-toggle">
        <button id="faceLearn" class="${store.view==='learn'?'on':''}">Learn</button>
        <button id="faceApply" class="${store.view==='apply'?'on':''}">Apply</button>
      </div>
    `;
  } else {
    store.view = "learn";
  }

  if(store.view==="learn" || !hasApply){
    html += `<div class="face learn">${st.learn}`;
    if(st.ai){
      html += `<div class="ai-overlay"><div class="ai-label">AI Collaborator Check · Design of Future Things</div><h4>For products that contain AI</h4><p>${st.ai}</p></div>`;
    }
    html += `</div>`;
  } else {
    html += `<div class="face">
      <div class="apply-intro"><p>Answer for <b>${esc(activeProject().name)}</b>. Everything saves as you type. When you've worked through the stations, hit <b>Export Brief</b> to compile your answers into a spec and ready-to-paste AI build prompts.</p></div>`;
    st.fields.forEach((f,i)=>{
      const v = esc(fieldVal(st.id,f.id));
      html += `
        <div class="field">
          <div class="field-head">
            <span class="field-label">${f.label}</span>
            <span class="fh-right"><button class="think-btn" data-station="${st.id}" data-field="${f.id}" title="Copy a thinking prompt for this question — paste it into Claude to pressure-test your answer">✦ Think with AI</button><span class="field-num">${st.num}.${i+1}</span></span>
          </div>
          <div class="field-hint">${f.hint}</div>
          <textarea class="field-input ${f.rows<=1?'short':''}" data-station="${st.id}" data-field="${f.id}" rows="${f.rows||2}" placeholder="Type here…">${v}</textarea>
        </div>`;
    });
    if(st.ethics){
      const ev = esc(fieldVal(st.id,"_ethics"));
      html += `
        <div class="ethics-gate">
          <div class="eg-label">Ethics Gate · required before shipping engagement mechanics</div>
          <p>${st.ethics}</p>
          <textarea class="field-input" data-station="${st.id}" data-field="_ethics" rows="2" placeholder="Would you use it yourself? Does it improve the user's life?">${ev}</textarea>
        </div>`;
    }
    if(st.ai){
      html += `<div class="ai-check-apply"><div class="aca-label">AI Collaborator Check</div><p>${st.ai}</p></div>`;
    }
    html += `</div>`;
  }

  html += flowNavHtml(st);
  inner.innerHTML = html;

  // wire toggle
  if(hasApply){
    document.getElementById("faceLearn").onclick = ()=>{ store.view="learn"; save(); renderWork(); };
    document.getElementById("faceApply").onclick = ()=>{ store.view="apply"; save(); renderWork(); };
  }
  // wire flow nav
  const idx = STATIONS.findIndex(s=>s.id===st.id);
  const fp = document.getElementById("flowPrev"); if(fp) fp.onclick = ()=>gotoStation(STATIONS[idx-1].id);
  const fn = document.getElementById("flowNext"); if(fn) fn.onclick = ()=>gotoStation(STATIONS[idx+1].id);
  const fe = document.getElementById("flowExport"); if(fe) fe.onclick = ()=>{ exportTab="brief"; renderExport(); document.getElementById("modalScrim").classList.add("open"); };
  // wire think buttons
  inner.querySelectorAll(".think-btn").forEach(btn=>{
    btn.onclick = ()=>{
      const s2 = STATIONS.find(x=>x.id===btn.dataset.station);
      const f2 = s2.fields.find(x=>x.id===btn.dataset.field);
      copyText(thinkPrompt(s2,f2), ()=>flashToast("Thinking prompt copied ✦ paste into Claude"));
    };
  });
  // wire inputs: autosize + save + debounced UI refresh
  inner.querySelectorAll("textarea.field-input").forEach(ta=>{
    autosize(ta);
    ta.addEventListener("input", e=>{
      setFieldVal(e.target.dataset.station, e.target.dataset.field, e.target.value);
      autosize(e.target);
      queueUiRefresh();
    });
  });
}

function gotoStation(id){
  store.activeStation = id; save(); renderAll();
  document.getElementById("work").scrollTop = 0;
}

function flowNavHtml(st){
  const idx = STATIONS.findIndex(s=>s.id===st.id);
  const prev = STATIONS[idx-1], next = STATIONS[idx+1];
  const left = prev
    ? `<button class="flow-btn" id="flowPrev">← ${prev.num} · ${prev.title}</button>`
    : `<button class="flow-btn ghost" tabindex="-1">·</button>`;
  const right = next
    ? `<button class="flow-btn next" id="flowNext">${st.foundation ? "Begin" : "Next"}: ${next.num} · ${next.title} →</button>`
    : `<button class="flow-btn next" id="flowExport">Compile: Export Brief ↧</button>`;
  return `<div class="flow-nav">${left}${right}</div>`;
}

function autosize(ta){
  ta.style.height = "auto";
  ta.style.height = Math.max(ta.scrollHeight + 2, 46) + "px";
}

let uiTimer = null;
function queueUiRefresh(){
  clearTimeout(uiTimer);
  uiTimer = setTimeout(()=>{ flushSaves(); flashToast("Saved"); renderNav(); renderProgress(); }, 650);
}

let toastTimer=null;
function flashToast(msg){
  const t = document.getElementById("saveToast");
  t.textContent = msg || "Saved";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), msg && msg.length>10 ? 2200 : 1100);
}

function stripTags(s){ return s.replace(/<[^>]+>/g,""); }

function thinkPrompt(st, f){
  const p = activeProject();
  const draft = fieldVal(st.id, f.id).trim();
  const who = fieldVal("whoWhy","who").trim(), job = fieldVal("whoWhy","job").trim();
  let s = `I'm working through a UX-first design process for my project "${p.name}". I'm on the "${st.title}" stage, grounded in ${st.sources.map(x=>x[0]).join(" and ")}.\n\n`;
  s += `The question I'm thinking through: ${f.label}\n`;
  s += `Guidance attached to it: ${stripTags(f.hint)}\n`;
  if(st.id !== "whoWhy" && (who || job)){
    s += `\nProject context:\n`;
    if(who) s += `- User: ${who}\n`;
    if(job) s += `- Job to be done: ${job}\n`;
  }
  s += draft ? `\nMy current draft answer:\n"${draft}"\n` : `\nI haven't drafted an answer yet.\n`;
  s += `\nDon't write the answer for me. First, challenge my thinking: ask me 2–3 probing questions and flag any fuzzy definitions or unexamined assumptions. Then, as I respond, help me sharpen my answer until it's specific, concrete, and testable.`;
  return s;
}

function copyText(txt, onDone){
  navigator.clipboard.writeText(txt).then(onDone).catch(()=>{
    const ta = document.createElement("textarea");
    ta.value = txt; ta.style.position="fixed"; ta.style.opacity="0";
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy"); }catch(e){}
    document.body.removeChild(ta);
    onDone();
  });
}

function renderAll(){ renderProjects(); renderNav(); renderProgress(); renderWork(); }

/* ---------- LENS ---------- */
document.getElementById("lensBody").innerHTML = LENS_HTML;
function openLens(){ document.getElementById("lens").classList.add("open"); document.getElementById("lensScrim").classList.add("open"); }
function closeLens(){ document.getElementById("lens").classList.remove("open"); document.getElementById("lensScrim").classList.remove("open"); }
document.getElementById("lensBtn").onclick = openLens;
document.getElementById("lensClose").onclick = closeLens;
document.getElementById("lensScrim").onclick = closeLens;

/* ---------- SIDEBAR DRAWER (mobile) ---------- */
function openSidebar(){ document.getElementById("sidebar").classList.add("open"); document.getElementById("sideScrim").classList.add("open"); }
function closeSidebar(){ document.getElementById("sidebar").classList.remove("open"); document.getElementById("sideScrim").classList.remove("open"); }
document.getElementById("menuBtn").onclick = ()=>{
  document.getElementById("sidebar").classList.contains("open") ? closeSidebar() : openSidebar();
};
document.getElementById("sideScrim").onclick = closeSidebar;

/* ---------- ON-SCREEN KEYBOARD (installed/mobile context — §8) ---------- */
// Keep the focused field visible above the keyboard: while a field has
// focus, any visualViewport resize re-centers it.
document.addEventListener("focusin", e=>{
  const el = e.target;
  if(!(el instanceof HTMLElement) || !el.classList.contains("field-input")) return;
  if(!window.visualViewport) return;
  const onResize = ()=> el.scrollIntoView({ block:"center", behavior:"smooth" });
  window.visualViewport.addEventListener("resize", onResize);
  el.addEventListener("focusout", ()=> window.visualViewport.removeEventListener("resize", onResize), { once:true });
});

/* ---------- PROJECT CONTROLS ---------- */
document.getElementById("newProjBtn").onclick = ()=>{
  const inp = document.getElementById("newProjInput");
  const name = inp.value.trim();
  if(!name) { inp.focus(); return; }
  const id = "p"+Date.now();
  store.projects[id] = { name, created:Date.now(), data:{} };
  store.activeId = id; store.activeStation="whoWhy"; store.view="apply";
  inp.value=""; markProject(id); save(); renderAll(); closeSidebar();
};
document.getElementById("newProjInput").addEventListener("keydown",e=>{ if(e.key==="Enter") document.getElementById("newProjBtn").click(); });

document.getElementById("dupeBtn").onclick = ()=>{
  const src = activeProject();
  const id = "p"+Date.now();
  store.projects[id] = {
    name: src.name.replace(/ \(copy( \d+)?\)$/,"") + " (copy)",
    created: Date.now(),
    data: JSON.parse(JSON.stringify(src.data))
  };
  store.activeId = id; markProject(id); save(); renderAll(); closeSidebar(); flashToast("Project duplicated ⧉");
};

document.getElementById("projSelect").onchange = (e)=>{
  const v = e.target.value;
  if(v==="__delete__"){
    if(Object.keys(store.projects).length<=1){
      alert("This is your only project — create another before deleting this one.");
      renderProjects(); return;
    }
    if(confirm(`Delete project "${activeProject().name}"? This can't be undone.`)){
      const deadId = store.activeId;
      delete store.projects[deadId];
      store.activeId = Object.keys(store.projects)[0];
      Store.deleteProject(deadId).catch(err=>console.warn("delete failed", err));
      Store.deleteSnapshotsFor(deadId).catch(err=>console.warn("snapshot cleanup failed", err));
      save(); renderAll();
    } else { renderProjects(); }
    return;
  }
  store.activeId = v; save(); renderAll();
};

/* ---------- BACKUP / RESTORE ---------- */
// On devices that can share files (iOS/Android), downloads become the
// native share sheet — this is how data moves phone → laptop (§10).
function canShareFiles(){
  try{
    return !!(navigator.canShare && navigator.canShare({ files:[new File(["x"],"x.txt",{type:"text/plain"})] }));
  }catch(e){ return false; }
}
async function shareOrDownload(text, filename, type, title){
  if(canShareFiles()){
    try{
      await navigator.share({ files:[new File([text], filename, { type })], title });
      return;
    }catch(e){
      if(e && e.name==="AbortError") return;   // user closed the sheet
      // fall through to download on any real failure
    }
  }
  downloadBlob(new Blob([text],{type}), filename);
}

document.getElementById("backupBtn").onclick = async ()=>{
  await flushSaves();
  const state = await Store.exportAll();
  await shareOrDownload(JSON.stringify(state,null,2), "uxfirst-studio-backup.json", "application/json", "UX-First Studio backup");
  store.lastBackup = Date.now(); save(); renderProgress();
};
document.getElementById("restoreBtn").onclick = ()=> document.getElementById("restoreFile").click();
document.getElementById("restoreFile").onchange = (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev=>{
    try{
      const data = JSON.parse(ev.target.result);
      await Store.importAll(data);   // accepts v1 (no schemaVersion) and v2 files
      store = await Store.getState();
      normalizeState();
      await flushSaves();
      renderAll(); alert("Restored ✓");
    }catch(err){ alert("Couldn't read that file — is it a Studio backup?"); }
  };
  reader.readAsText(file);
  e.target.value="";
};
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}

/* ---------- EXPORT ---------- */
function buildBrief(){
  const p = activeProject();
  let out = `UX-FIRST PROJECT BRIEF\n${"=".repeat(56)}\nProject: ${p.name}\nGenerated: ${new Date().toLocaleString()}\n\n`;
  STATIONS.forEach(st=>{
    if(!st.fields || !st.fields.length) return;
    let any = st.fields.some(f=>fieldVal(st.id,f.id).trim()) || (st.ethics && fieldVal(st.id,"_ethics").trim());
    if(!any) return;
    out += `\n${st.num} · ${st.title.toUpperCase()}\n${"-".repeat(56)}\n`;
    st.fields.forEach(f=>{
      const v = fieldVal(st.id,f.id).trim();
      if(v) out += `\n• ${f.label}\n  ${v.replace(/\n/g,"\n  ")}\n`;
    });
    if(st.ethics){
      const v = fieldVal(st.id,"_ethics").trim();
      if(v) out += `\n• Ethics gate (Hooked)\n  ${v.replace(/\n/g,"\n  ")}\n`;
    }
  });
  return out.trim()+"\n";
}
function g(s,f){ return fieldVal(s,f).trim(); }
function buildPrompts(){
  const p = activeProject();
  const blocks = [];
  PROMPTS.forEach(pr=>{
    const lines = pr.lines
      .map(([s,f,label])=>{ const v = g(s,f); return v ? `${label}: ${v}` : null; })
      .filter(Boolean);
    if(!lines.length) return; // skip prompts with nothing behind them
    let b = `--- ${pr.title} ---\n`;
    if(pr.intro) b += pr.intro.replace("{project}", p.name) + "\n";
    b += lines.join("\n") + "\n";
    if(pr.outro) b += pr.outro + "\n";
    blocks.push(b);
  });
  let out = `AI BUILD PROMPTS — ${p.name}\n${"=".repeat(56)}\n`;
  if(!blocks.length){
    out += `\nNothing to compile yet — work through the Apply faces of the stations first.\nEvery prompt here is generated from your own answers; empty stations are skipped.\n`;
    return out;
  }
  out += `Paste these into your AI coding tool, in order. Each builds on a stage you've already thought through.\n\n`;
  out += blocks.join("\n");
  return out;
}

// Compiles the project into a standing context file for AI coding agents
// (CLAUDE.md / AGENTS.md), from the AGENT_CONTEXT mapping in the content layer.
function buildAgentContext(){
  const p = activeProject();
  let out = AGENT_CONTEXT.intro
    .replace("{project}", p.name)
    .replace("{date}", new Date().toLocaleDateString());
  let any = false;
  AGENT_CONTEXT.sections.forEach(sec=>{
    const lines = sec.lines
      .map(([s,f,label])=>{ const v = g(s,f); return v ? `- **${label}:** ${v.replace(/\n/g,"\n  ")}` : null; })
      .filter(Boolean);
    if(!lines.length) return;
    any = true;
    out += `\n## ${sec.title}\n\n` + lines.join("\n") + "\n";
    if(sec.note) out += `\n${sec.note}\n`;
  });
  if(!any){
    return `# ${p.name}\n\nNothing to compile yet — work through the Apply faces of the stations first.\nThis file is generated from your own answers; empty stations are skipped.\n`;
  }
  out += AGENT_CONTEXT.outro;
  return out;
}

let exportTab = "brief";
const EXPORT_TABS = {
  brief:   { title:"UX-First Project Brief", build: ()=>buildBrief() },
  prompts: { title:"AI Build Prompts",       build: ()=>buildPrompts() },
  agent:   { title:"Agent Context · CLAUDE.md", build: ()=>buildAgentContext() }
};
function renderExport(){
  const p = activeProject();
  document.getElementById("exTitle").textContent = EXPORT_TABS[exportTab].title;
  document.getElementById("exSub").textContent = p.name;
  document.getElementById("tabBrief").classList.toggle("on", exportTab==="brief");
  document.getElementById("tabPrompts").classList.toggle("on", exportTab==="prompts");
  document.getElementById("tabAgent").classList.toggle("on", exportTab==="agent");
  document.getElementById("exportPre").textContent = EXPORT_TABS[exportTab].build();
}
document.getElementById("exportBtn").onclick = ()=>{ exportTab="brief"; renderExport(); document.getElementById("modalScrim").classList.add("open"); };
document.getElementById("modalClose").onclick = ()=> document.getElementById("modalScrim").classList.remove("open");
document.getElementById("modalScrim").onclick = (e)=>{ if(e.target.id==="modalScrim") document.getElementById("modalScrim").classList.remove("open"); };
document.getElementById("tabBrief").onclick = ()=>{ exportTab="brief"; renderExport(); };
document.getElementById("tabPrompts").onclick = ()=>{ exportTab="prompts"; renderExport(); };
document.getElementById("tabAgent").onclick = ()=>{ exportTab="agent"; renderExport(); };
document.getElementById("printBtn").onclick = ()=>{
  document.body.classList.add("print-export");
  const done = ()=>document.body.classList.remove("print-export");
  window.addEventListener("afterprint", done, { once:true });
  window.print();
};
document.getElementById("copyBtn").onclick = ()=>{
  const txt = document.getElementById("exportPre").textContent;
  navigator.clipboard.writeText(txt).then(()=>{
    const b=document.getElementById("copyBtn"); const o=b.textContent; b.textContent="Copied ✓";
    setTimeout(()=>b.textContent=o,1200);
  }).catch(()=>{ /* offline fallback */
    const r=document.createRange(); r.selectNode(document.getElementById("exportPre"));
    window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
    try{document.execCommand("copy");}catch(e){}
    window.getSelection().removeAllRanges();
    const b=document.getElementById("copyBtn"); b.textContent="Copied ✓"; setTimeout(()=>b.textContent="Copy",1200);
  });
};
document.getElementById("downloadBtn").onclick = ()=>{
  const txt = document.getElementById("exportPre").textContent;
  const name = activeProject().name.replace(/[^a-z0-9]+/gi,"-").toLowerCase();
  // the agent context keeps its canonical filename so it drops straight into a repo
  const filename = exportTab==="agent"
    ? (AGENT_CONTEXT.filename || "CLAUDE.md")
    : `${name}-${exportTab==="brief" ? "ux-brief" : "ai-prompts"}.md`;
  shareOrDownload(txt, filename, "text/markdown", `${EXPORT_TABS[exportTab].title} — ${activeProject().name}`);
};

/* keyboard: esc closes overlays */
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    closeLens(); closeSidebar();
    ["modalScrim","historyScrim","compareScrim"].forEach(id=>document.getElementById(id).classList.remove("open"));
  }
});

/* ---------- LIVE BACKUP (File System Access API, desktop Chromium) ----------
   Holds a handle to a .json in a folder the user's cloud drive syncs,
   and rewrites it on the same debounced flush that writes IndexedDB. */
let liveBackupHandle = null;
let liveBackupState = "off";   // off | on | stale (permission lapsed) | error

function liveBackupSupported(){ return "showSaveFilePicker" in window; }

function updateLiveBackupUi(){
  const btn = document.getElementById("liveBackupBtn");
  const note = document.getElementById("liveBackupNote");
  if(!liveBackupSupported()){ btn.hidden = true; note.hidden = true; return; }
  btn.hidden = false;
  if(liveBackupState==="on"){
    btn.textContent = "⛁ Live backup: on";
    note.hidden = false;
    note.textContent = `Mirroring to “${liveBackupHandle.name}” as you type. Click to turn off.`;
  }else if(liveBackupState==="stale"){
    btn.textContent = "⛁ Re-enable live backup";
    note.hidden = false;
    note.textContent = `Permission for “${liveBackupHandle.name}” lapsed — click to re-grant.`;
  }else if(liveBackupState==="error"){
    btn.textContent = "⛁ Live backup: file unreachable";
    note.hidden = false;
    note.textContent = "Couldn't write the backup file — click to pick a new one.";
  }else{
    btn.textContent = "⛁ Set up live backup";
    note.hidden = true;
  }
}

async function writeLiveBackup(){
  if(!liveBackupHandle || liveBackupState==="stale") return;
  try{
    if(liveBackupHandle.queryPermission &&
       await liveBackupHandle.queryPermission({ mode:"readwrite" }) !== "granted"){
      liveBackupState = "stale"; updateLiveBackupUi(); return;
    }
    const state = await Store.exportAll();
    const w = await liveBackupHandle.createWritable();
    await w.write(JSON.stringify(state, null, 2));
    await w.close();
    if(liveBackupState!=="on"){ liveBackupState = "on"; updateLiveBackupUi(); }
    store.lastBackup = Date.now();
    Store.saveMeta({ lastBackup: store.lastBackup });
    renderProgress();   // clears the amber nudge
  }catch(e){
    console.warn("live backup write failed", e);
    liveBackupState = "error"; updateLiveBackupUi();
  }
}

async function initLiveBackup(){
  if(!liveBackupSupported()) return updateLiveBackupUi();
  liveBackupHandle = store.liveBackupHandle || null;
  if(liveBackupHandle){
    const perm = liveBackupHandle.queryPermission
      ? await liveBackupHandle.queryPermission({ mode:"readwrite" }) : "granted";
    liveBackupState = perm==="granted" ? "on" : "stale";
  }
  updateLiveBackupUi();
}

document.getElementById("liveBackupBtn").onclick = async ()=>{
  try{
    if(liveBackupState==="on"){
      if(!confirm(`Live backup is mirroring to “${liveBackupHandle.name}”. Turn it off?`)) return;
      liveBackupHandle = null; liveBackupState = "off";
      await Store.saveMeta({ liveBackupHandle: null });
      updateLiveBackupUi(); return;
    }
    if(liveBackupState==="stale" && liveBackupHandle && liveBackupHandle.requestPermission){
      if(await liveBackupHandle.requestPermission({ mode:"readwrite" }) === "granted"){
        liveBackupState = "on"; updateLiveBackupUi();
        await writeLiveBackup(); flashToast("Live backup re-enabled ⛁");
        return;
      }
      return;   // user declined; stay stale
    }
    liveBackupHandle = await window.showSaveFilePicker({
      suggestedName: "uxfirst-studio-live-backup.json",
      types: [{ description:"UX-First Studio backup", accept:{ "application/json":[".json"] } }]
    });
    liveBackupState = "on";
    await Store.saveMeta({ liveBackupHandle });
    await writeLiveBackup();
    updateLiveBackupUi();
    flashToast("Live backup on ⛁ pick a cloud-synced folder for free sync");
  }catch(e){
    if(e && e.name==="AbortError") return;   // user closed the picker
    console.warn("live backup setup failed", e);
  }
};

/* ---------- HISTORY (snapshots of the active project) ---------- */
function fmtSnapTime(ts){
  return new Date(ts).toLocaleString(undefined, { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}
function snapProgress(project){
  let filled=0,total=0;
  STATIONS.forEach(st=>{
    if(!st.fields) return;
    st.fields.forEach(f=>{ total++; if(((project.data[st.id]||{})[f.id]||"").trim()) filled++; });
    if(st.ethics){ total++; if(((project.data[st.id]||{})["_ethics"]||"").trim()) filled++; }
  });
  return total ? Math.round(filled/total*100) : 0;
}
const SNAP_KIND_LABEL = { auto:"session", milestone:"✦ milestone", prerestore:"before restore" };

async function renderHistory(){
  const p = activeProject();
  document.getElementById("histSub").textContent = p.name;
  const body = document.getElementById("historyBody");
  const snaps = await Store.getSnapshots(store.activeId);
  if(!snaps.length){
    body.innerHTML = `<p class="empty-note">No snapshots yet. One is taken automatically the first time you edit this project in a session — or save a milestone below.</p>`;
    return;
  }
  body.innerHTML = snaps.map(s=>`
    <div class="snap-row" data-id="${s.id}">
      <div class="snap-info">
        <span class="snap-kind ${s.kind}">${SNAP_KIND_LABEL[s.kind]||s.kind}</span>
        <span class="snap-time">${fmtSnapTime(s.ts)}</span>
        <span class="snap-pct">${snapProgress(s.project)}% filled</span>
        ${s.label && s.label!=="Session start" ? `<span class="snap-label">${esc(s.label)}</span>` : ""}
      </div>
      <div class="snap-actions">
        <button class="mbtn snap-restore">Restore</button>
        <button class="mbtn snap-delete" title="Delete snapshot">✕</button>
      </div>
    </div>`).join("");
  body.querySelectorAll(".snap-row").forEach(row=>{
    const id = Number(row.dataset.id);
    const snap = snaps.find(s=>s.id===id);
    row.querySelector(".snap-restore").onclick = async ()=>{
      if(!confirm(`Restore "${p.name}" to its ${fmtSnapTime(snap.ts)} state? The current state is snapshotted first.`)) return;
      await Store.addSnapshot(store.activeId, activeProject(), "prerestore", "Before restore");
      store.projects[store.activeId] = JSON.parse(JSON.stringify(snap.project));
      sessionSnapshotted.add(store.activeId);   // don't auto-snapshot the restored state over the trail
      markProject(store.activeId); markMeta();
      await flushSaves();
      renderAll(); closeHistory(); flashToast("Snapshot restored ⏱");
    };
    row.querySelector(".snap-delete").onclick = async ()=>{
      await Store.deleteSnapshot(id);
      renderHistory();
    };
  });
}
function openHistory(){ document.getElementById("historyScrim").classList.add("open"); renderHistory(); }
function closeHistory(){ document.getElementById("historyScrim").classList.remove("open"); }
document.getElementById("historyBtn").onclick = ()=>{ openHistory(); closeSidebar(); };
document.getElementById("historyClose").onclick = closeHistory;
document.getElementById("historyScrim").onclick = (e)=>{ if(e.target.id==="historyScrim") closeHistory(); };
document.getElementById("milestoneBtn").onclick = async ()=>{
  const label = prompt("Label this milestone (optional):") ;
  if(label===null) return;
  await Store.addSnapshot(store.activeId, activeProject(), "milestone", label.trim());
  renderHistory(); flashToast("Milestone saved ✦");
};

/* ---------- COMPARE (design it twice — side by side) ---------- */
let cmpA = null, cmpB = null;
function pv(p, stationId, fieldId){
  return (p && p.data[stationId] && p.data[stationId][fieldId]) || "";
}
function renderCompare(){
  const ids = Object.keys(store.projects);
  const selA = document.getElementById("cmpSelA"), selB = document.getElementById("cmpSelB");
  [selA, selB].forEach((sel, i)=>{
    sel.innerHTML = "";
    ids.forEach(id=>{
      const o = document.createElement("option");
      o.value = id; o.textContent = store.projects[id].name;
      if(id === (i===0?cmpA:cmpB)) o.selected = true;
      sel.appendChild(o);
    });
  });
  const a = store.projects[cmpA], b = store.projects[cmpB];
  let html = "";
  STATIONS.forEach(st=>{
    if(!st.fields || !st.fields.length) return;
    const fields = [...st.fields];
    if(st.ethics) fields.push({ id:"_ethics", label:"Ethics gate" });
    let rows = "";
    fields.forEach(f=>{
      const va = pv(a, st.id, f.id).trim(), vb = pv(b, st.id, f.id).trim();
      if(!va && !vb) return;
      const diff = va !== vb;
      rows += `
        <div class="cmp-field${diff?" diff":""}">
          <div class="cmp-label">${f.label}${diff?`<span class="cmp-flag">differs</span>`:""}</div>
          <div class="cmp-pair">
            <div class="cmp-val">${va?esc(va):"<span class='empty-note'>—</span>"}</div>
            <div class="cmp-val">${vb?esc(vb):"<span class='empty-note'>—</span>"}</div>
          </div>
        </div>`;
    });
    if(rows) html += `<div class="cmp-station"><div class="cmp-st-head">${st.num} · ${st.title}</div>${rows}</div>`;
  });
  document.getElementById("compareBody").innerHTML =
    html || `<p class="empty-note">Neither project has answers yet — work through some Apply faces first.</p>`;
}
function openCompare(){
  const ids = Object.keys(store.projects);
  if(ids.length < 2){
    alert("You need two projects to compare. Duplicate the current one, take a different angle in the copy, then compare.");
    return;
  }
  cmpA = store.activeId;
  cmpB = ids.find(id=>id!==cmpA);
  document.getElementById("compareScrim").classList.add("open");
  renderCompare();
}
function closeCompare(){ document.getElementById("compareScrim").classList.remove("open"); }
document.getElementById("compareBtn").onclick = ()=>{ openCompare(); closeSidebar(); };
document.getElementById("compareClose").onclick = closeCompare;
document.getElementById("compareScrim").onclick = (e)=>{ if(e.target.id==="compareScrim") closeCompare(); };
document.getElementById("cmpSelA").onchange = (e)=>{ cmpA = e.target.value; renderCompare(); };
document.getElementById("cmpSelB").onchange = (e)=>{ cmpB = e.target.value; renderCompare(); };

/* ---------- CONTENT PACKS (fork without deploying) ----------
   A pack is a .json of the content layer: stations, lens, prompts,
   agent-context mapping, and branding (never storageKey). It's stored
   in meta and applied over the built-ins at boot. Project data is
   untouched; fields keyed to stations a pack doesn't define lie dormant. */
const PACK_VERSION = 1;

function applyContentPack(pack){
  if(!pack || pack.packVersion !== PACK_VERSION || !Array.isArray(pack.stations)) return false;
  STATIONS = pack.stations;
  if(pack.lensHtml) LENS_HTML = pack.lensHtml;
  if(pack.prompts) PROMPTS = pack.prompts;
  if(pack.agentContext) AGENT_CONTEXT = pack.agentContext;
  if(pack.config){
    ["toolName","tagline","accent","accentDeep","accentWash"].forEach(k=>{
      if(pack.config[k]) CONFIG[k] = pack.config[k];
    });
  }
  document.getElementById("lensBody").innerHTML = LENS_HTML;
  return true;
}

function updatePackUi(){
  const active = !!store.contentPack;
  document.getElementById("packRemoveBtn").hidden = !active;
  const note = document.getElementById("packNote");
  note.hidden = !active;
  if(active) note.textContent = `Content pack active: ${store.contentPack.name || "unnamed"}. Projects and data are untouched.`;
}

document.getElementById("packExportBtn").onclick = ()=>{
  const pack = {
    packVersion: PACK_VERSION,
    name: CONFIG.toolName,
    config: { toolName:CONFIG.toolName, tagline:CONFIG.tagline, accent:CONFIG.accent, accentDeep:CONFIG.accentDeep, accentWash:CONFIG.accentWash },
    stations: STATIONS,
    lensHtml: LENS_HTML,
    prompts: PROMPTS,
    agentContext: AGENT_CONTEXT
  };
  const name = CONFIG.toolName.replace(/[^a-z0-9]+/gi,"-").toLowerCase();
  shareOrDownload(JSON.stringify(pack,null,2), `${name}-content-pack.json`, "application/json", "UX-First Studio content pack");
};
document.getElementById("packImportBtn").onclick = ()=> document.getElementById("packFile").click();
document.getElementById("packFile").onchange = (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev=>{
    try{
      const pack = JSON.parse(ev.target.result);
      if(pack.packVersion !== PACK_VERSION || !Array.isArray(pack.stations) || !pack.stations.every(s=>s.id && s.num && s.title))
        throw new Error("bad pack");
      if(!confirm(`Apply content pack "${pack.name || "unnamed"}"? The app reloads with its stations. Your projects and data are untouched.`)) return;
      await Store.saveMeta({ contentPack: pack });
      location.reload();
    }catch(err){ alert("Couldn't read that file — is it a Studio content pack?"); }
  };
  reader.readAsText(file);
  e.target.value = "";
};
document.getElementById("packRemoveBtn").onclick = async ()=>{
  if(!confirm("Remove the content pack and return to the built-in stations? The app reloads; your data is untouched.")) return;
  await Store.saveMeta({ contentPack: null });
  location.reload();
};

/* ---------- BOOT ---------- */
(async function boot(){
  try{
    await Store.init();
    store = await Store.getState();
  }catch(e){
    console.warn("storage init failed — running on in-memory state", e);
  }
  if(store.contentPack) applyContentPack(store.contentPack);
  updatePackUi();
  normalizeState();
  await flushSaves();
  applyConfig();
  if(canShareFiles()) document.getElementById("downloadBtn").textContent = "Share";
  await initLiveBackup();
  renderAll();
  window.dispatchEvent(new CustomEvent("uxfs:ready"));
})();
