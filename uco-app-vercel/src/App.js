import { useState, useEffect, useCallback } from "react";

const SUPA_URL = "https://hhjkawwknbmyjvemcwxq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoamthd3drbmJteWp2ZW1jd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjE4NzUsImV4cCI6MjA5NDIzNzg3NX0.yDAC12BTUXYMSWVN4EhDxpiEQZQn5bTp87IA6LyFKNc";

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sendEmail(to, subject, html) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch(e) { console.error("Email error:", e); }
}

async function geocode(adresse, ville, code_postal) {
  try {
    const q = encodeURIComponent(`${adresse}, ${code_postal} ${ville}, France`);
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
    const data = await r.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch(e) {}
  return null;
}

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPA_KEY,
  "Authorization": `Bearer ${SUPA_KEY}`,
};

async function sbGet(table, params = "") {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbPost(table, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: "POST", headers: { ...headers, "Prefer": "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sbPatch(table, id, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH", headers: { ...headers, "Prefer": "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

const G = {
  bg: "#070c09", surface: "#0e1610", card: "#131f16", border: "#1c2e20",
  accent: "#39d96a", accentDark: "#1a7a3a", accentGlow: "rgba(57,217,106,0.15)",
  text: "#e8f5eb", textMuted: "#6b8f72", danger: "#e05252", warn: "#e0a040", info: "#4aabf0",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${G.bg};color:${G.text};font-family:'Sora',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${G.surface}}::-webkit-scrollbar-thumb{background:${G.accentDark};border-radius:2px}
.shell{max-width:430px;margin:0 auto;min-height:100vh;background:${G.bg};position:relative}
.header{padding:18px 20px 14px;border-bottom:1px solid ${G.border};display:flex;align-items:center;justify-content:space-between;background:${G.surface};position:sticky;top:0;z-index:100;backdrop-filter:blur(10px)}
.logo{font-family:'DM Mono',monospace;font-size:18px;font-weight:500;color:${G.accent};letter-spacing:-0.5px}
.logo span{color:${G.textMuted}}
.ubadge{display:flex;align-items:center;gap:8px;background:${G.card};border:1px solid ${G.border};border-radius:20px;padding:6px 12px;font-size:12px;color:${G.textMuted};cursor:pointer;transition:all .2s}
.ubadge:hover{border-color:${G.accentDark};transform:scale(1.02)}
.ubadge:active{transform:scale(0.98)}
.rdot{width:7px;height:7px;border-radius:50%;background:${G.accent};box-shadow:0 0 6px ${G.accent};animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 6px ${G.accent}}50%{box-shadow:0 0 12px ${G.accent},0 0 20px ${G.accentGlow}}}
.rdot.client{background:${G.info};box-shadow:0 0 6px ${G.info};animation:pulse-blue 2s infinite}
@keyframes pulse-blue{0%,100%{box-shadow:0 0 6px ${G.info}}50%{box-shadow:0 0 12px ${G.info}}}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${G.surface};border-top:1px solid ${G.border};display:flex;padding:10px 0 20px;z-index:100;backdrop-filter:blur(10px)}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;cursor:pointer;border:none;background:none;color:${G.textMuted};font-family:'Sora',sans-serif;font-size:10px;transition:all .2s;position:relative}
.ni.active{color:${G.accent}}
.ni:active{transform:scale(0.9)}
.ni svg{width:22px;height:22px;transition:transform .2s}
.ni.active svg{transform:scale(1.1)}
.nbadge{position:absolute;top:2px;right:10px;background:${G.danger};color:white;font-size:9px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;animation:badgePop .3s ease}
@keyframes badgePop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
.page{padding:20px 20px 100px;animation:fadeUp .3s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ptitle{font-size:22px;font-weight:700;margin-bottom:4px;letter-spacing:-0.5px}
.psub{font-size:13px;color:${G.textMuted};margin-bottom:24px}
.card{background:${G.card};border:1px solid ${G.border};border-radius:16px;padding:16px;margin-bottom:12px;transition:all .2s;animation:fadeUp .3s ease both}
.card:hover{border-color:${G.accentDark};transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
.card:active{transform:scale(0.99)}
.ch{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.ct{font-size:15px;font-weight:600}
.cs{font-size:12px;color:${G.textMuted};margin-top:2px}
.badge{font-family:'DM Mono',monospace;font-size:10px;padding:3px 8px;border-radius:6px;font-weight:500;white-space:nowrap}
.bw{background:rgba(224,160,64,.15);color:${G.warn};border:1px solid rgba(224,160,64,.3)}
.bo{background:rgba(57,217,106,.12);color:${G.accent};border:1px solid rgba(57,217,106,.25)}
.bd{background:rgba(74,171,240,.12);color:${G.info};border:1px solid rgba(74,171,240,.25)}
.br{background:rgba(224,82,82,.12);color:${G.danger};border:1px solid rgba(224,82,82,.3)}
.ir{display:flex;align-items:center;gap:6px;font-size:12px;color:${G.textMuted};margin-top:6px}
.ir svg{width:13px;height:13px;flex-shrink:0}
.btn{border:none;border-radius:12px;padding:12px 20px;font-family:'Sora',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
.btn:active{transform:scale(0.97)}
.bp{background:${G.accent};color:#070c09;box-shadow:0 0 20px rgba(57,217,106,.25)}
.bp:hover{box-shadow:0 0 30px rgba(57,217,106,.5);transform:translateY(-1px)}
.bp:active{transform:scale(0.97);box-shadow:0 0 10px rgba(57,217,106,.2)}
.bp:disabled{opacity:.5;cursor:not-allowed;transform:none}
.bo2{background:transparent;color:${G.text};border:1px solid ${G.border}}
.bo2:hover{border-color:${G.accentDark};background:rgba(57,217,106,.05)}
.bdng{background:rgba(224,82,82,.15);color:${G.danger};border:1px solid rgba(224,82,82,.3)}
.bdng:hover{background:rgba(224,82,82,.25)}
.bsuc{background:rgba(57,217,106,.12);color:${G.accent};border:1px solid rgba(57,217,106,.3)}
.bsuc:hover{background:rgba(57,217,106,.2)}
.bsm{padding:7px 14px;font-size:12px;border-radius:9px}
.bfull{width:100%}
.ar{display:flex;gap:8px;margin-top:12px}
.fg{margin-bottom:16px}
.fl{font-size:12px;color:${G.textMuted};margin-bottom:6px;display:block;font-family:'DM Mono',monospace;letter-spacing:.5px}
.fi,.fsel,.fta{width:100%;background:${G.surface};border:1px solid ${G.border};border-radius:10px;padding:12px 14px;font-family:'Sora',sans-serif;font-size:14px;color:${G.text};outline:none;transition:all .2s}
.fi:focus,.fsel:focus,.fta:focus{border-color:${G.accent};box-shadow:0 0 0 3px ${G.accentGlow};transform:scale(1.01)}
.fta{resize:none;height:80px}
.fsel option{background:${G.surface}}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.sc{background:${G.card};border:1px solid ${G.border};border-radius:14px;padding:14px;transition:all .2s;animation:fadeUp .4s ease both}
.sc:hover{border-color:${G.accentDark};transform:translateY(-2px)}
.sv{font-family:'DM Mono',monospace;font-size:26px;font-weight:500;color:${G.accent}}
.sl{font-size:11px;color:${G.textMuted};margin-top:2px}
.lscreen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 24px;background:${G.bg}}
.llogo{font-family:'DM Mono',monospace;font-size:32px;color:${G.accent};margin-bottom:6px;letter-spacing:-1px;animation:logoIn .6s ease}
@keyframes logoIn{from{opacity:0;transform:translateY(-20px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
.ltag{font-size:13px;color:${G.textMuted};margin-bottom:40px;animation:fadeUp .6s ease .1s both}
.lcard{width:100%;max-width:380px;background:${G.card};border:1px solid ${G.border};border-radius:20px;padding:28px 24px;animation:fadeUp .6s ease .2s both;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.tsw{display:flex;background:${G.surface};border-radius:10px;padding:3px;margin-bottom:24px}
.tbtn{flex:1;padding:8px;border-radius:8px;border:none;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;background:transparent;color:${G.textMuted}}
.tbtn.active{background:${G.accent};color:#070c09;box-shadow:0 2px 8px rgba(57,217,106,.3)}
.tbtn:active{transform:scale(0.97)}
.div{height:1px;background:${G.border};margin:16px 0}
.empty{text-align:center;padding:50px 20px;color:${G.textMuted};animation:fadeUp .4s ease}
.empty svg{width:48px;height:48px;margin-bottom:12px;opacity:.4}
.empty p{font-size:14px}
.moverlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:overlayIn .2s ease}
@keyframes overlayIn{from{opacity:0}to{opacity:1}}
.modal{background:${G.surface};border:1px solid ${G.border};border-top:2px solid ${G.accentDark};border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:430px;max-height:90vh;overflow-y:auto;animation:modalUp .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes modalUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mhandle{width:40px;height:4px;background:${G.border};border-radius:2px;margin:0 auto 20px}
.mtitle{font-size:18px;font-weight:700;margin-bottom:20px}
.stitle{font-family:'DM Mono',monospace;font-size:11px;color:${G.textMuted};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;margin-top:8px}
.alert{padding:12px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;animation:fadeUp .3s ease}
.asuc{background:rgba(57,217,106,.1);color:${G.accent};border:1px solid rgba(57,217,106,.2)}
.aerr{background:rgba(224,82,82,.1);color:${G.danger};border:1px solid rgba(224,82,82,.2)}
.vpill{display:inline-flex;align-items:center;gap:4px;background:rgba(57,217,106,.08);border:1px solid rgba(57,217,106,.2);border-radius:20px;padding:3px 10px;font-family:'DM Mono',monospace;font-size:12px;color:${G.accent};transition:all .2s}
.vpill:hover{background:rgba(57,217,106,.15)}
.spinner{width:20px;height:20px;border:2px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.skeleton{background:linear-gradient(90deg,${G.card} 25%,${G.surface} 50%,${G.card} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;height:80px;margin-bottom:12px}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.success-check{display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:rgba(57,217,106,.15);border:2px solid ${G.accent};margin:0 auto 16px;animation:checkIn .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes checkIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.stat-bar-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1}
.stat-bar{width:100%;background:${G.accentDark};border-radius:4px 4px 0 0;transition:height .5s cubic-bezier(.34,1.56,.64,1)}
.stat-bar-label{font-size:9px;color:${G.textMuted}}
.stat-bar-val{font-size:10px;font-weight:600;color:${G.accent};font-family:'DM Mono',monospace}
.progress-track{height:6px;background:${G.border};border-radius:99px;overflow:hidden;margin-top:6px}
.progress-fill{height:100%;background:${G.accent};border-radius:99px;transition:width .8s cubic-bezier(.34,1.56,.64,1)}
.map-container{width:100%;height:400px;border-radius:16px;overflow:hidden;border:1px solid ${G.border};margin-bottom:12px}
.legal-page{padding:20px 20px 100px}
.legal-page h2{font-size:18px;font-weight:700;color:${G.accent};margin:20px 0 8px}
.legal-page h3{font-size:14px;font-weight:600;margin:16px 0 6px}
.legal-page p{font-size:13px;color:${G.textMuted};line-height:1.6;margin-bottom:8px}
.checkbox-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:16px;cursor:pointer}
.checkbox-row input{margin-top:3px;accent-color:${G.accent};width:16px;height:16px;flex-shrink:0}
.checkbox-row span{font-size:12px;color:${G.textMuted};line-height:1.5}
.checkbox-row a{color:${G.accent};text-decoration:none}
.toast{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${G.card};border:1px solid ${G.accent};border-radius:12px;padding:12px 20px;font-size:13px;color:${G.accent};z-index:300;animation:toastIn .3s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.4)}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-20px) scale(0.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
.onboarding{padding:40px 24px;text-align:center;animation:fadeUp .4s ease}
.onboarding-icon{font-size:64px;margin-bottom:20px}
.onboarding h2{font-size:24px;font-weight:700;margin-bottom:8px}
.onboarding p{font-size:14px;color:${G.textMuted};line-height:1.6;margin-bottom:32px}
`;

const STATUTS = {
  en_attente: { label: "En attente", cls: "bw" },
  acceptée:   { label: "Acceptée",   cls: "bo" },
  collectée:  { label: "Collectée",  cls: "bd" },
  refusée:    { label: "Refusée",    cls: "br" },
};
const CRENEAUX = { matin: "Matin (8h–12h)", apres_midi: "Après-midi (13h–17h)", flexible: "Flexible" };
function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

const Ic = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  drop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  loc: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

function SBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut, cls: "bw" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ── PAGES LÉGALES ─────────────────────────────────────────────────────────────
function CGUPage({ onBack }) {
  return (
    <div className="lscreen" style={{justifyContent:"flex-start",paddingTop:20}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:430}}>
        <button className="btn bo2 bsm" onClick={onBack} style={{marginBottom:16}}>← Retour</button>
        <div className="legal-page">
          <div className="llogo" style={{fontSize:22}}>UCO_</div>
          <h2>Conditions Générales d'Utilisation</h2>
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          <h3>1. Objet</h3>
          <p>Les présentes CGU régissent l'utilisation de l'application UCO Collect, éditée par Amon Energy (Turkey Amon Enerji), pour la gestion de la collecte d'huiles usagées dans le département du Loiret (France).</p>
          <h3>2. Accès au service</h3>
          <p>L'accès à UCO Collect est réservé aux établissements professionnels situés dans le Loiret. L'inscription est gratuite et nécessite des informations valides.</p>
          <h3>3. Utilisation du service</h3>
          <p>L'utilisateur s'engage à fournir des informations exactes et à utiliser l'application uniquement pour des demandes de collecte légitimes.</p>
          <h3>4. Responsabilités</h3>
          <p>Amon Energy s'engage à traiter les demandes dans les meilleurs délais. L'acceptation reste soumise aux disponibilités du collecteur.</p>
          <h3>5. Propriété intellectuelle</h3>
          <p>L'application UCO Collect est la propriété exclusive d'Amon Energy. Toute reproduction est interdite sans autorisation écrite.</p>
          <h3>6. Droit applicable</h3>
          <p>Les présentes CGU sont soumises au droit français.</p>
          <h3>7. Contact</h3>
          <p>contact@amonenergy.fr</p>
        </div>
      </div>
    </div>
  );
}

function RGPDPage({ onBack }) {
  return (
    <div className="lscreen" style={{justifyContent:"flex-start",paddingTop:20}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:430}}>
        <button className="btn bo2 bsm" onClick={onBack} style={{marginBottom:16}}>← Retour</button>
        <div className="legal-page">
          <div className="llogo" style={{fontSize:22}}>UCO_</div>
          <h2>Politique de Confidentialité & RGPD</h2>
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          <h3>1. Responsable du traitement</h3>
          <p>Amon Energy (Turkey Amon Enerji) — contact@amonenergy.fr</p>
          <h3>2. Données collectées</h3>
          <p>Nom, adresse, email, téléphone, type d'établissement.</p>
          <h3>3. Finalités</h3>
          <p>Gestion des demandes de collecte, notifications, planification des tournées.</p>
          <h3>4. Base légale</h3>
          <p>Exécution d'un contrat (Art. 6.1.b RGPD) et consentement explicite (Art. 6.1.a RGPD).</p>
          <h3>5. Durée de conservation</h3>
          <p>3 ans après la dernière activité.</p>
          <h3>6. Vos droits</h3>
          <p>Accès, rectification, effacement, portabilité, opposition. Contact : contact@amonenergy.fr</p>
          <h3>7. Sécurité</h3>
          <p>Données hébergées sur Supabase EU (Frankfurt). Mots de passe hashés.</p>
          <h3>8. Cookies</h3>
          <p>Aucun cookie de tracking. Uniquement des cookies techniques.</p>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ email:"", password:"", nom:"", tel:"", adresse:"", ville:"", code_postal:"", secteur:"Restaurant" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [cgu, setCgu] = useState(false);
  const up = k => e => setF(p => ({...p, [k]: e.target.value}));

  async function login() {
    setLoading(true); setErr("");
    try {
      const hashed = await hashPassword(f.password);
      const users = await sbGet("utilisateurs", `email=eq.${encodeURIComponent(f.email)}&password=eq.${encodeURIComponent(hashed)}&limit=1`);
      if (!users.length) { setErr("Email ou mot de passe incorrect."); return; }
      onLogin(users[0]);
    } catch(e) { setErr("Erreur de connexion."); }
    finally { setLoading(false); }
  }

  async function register() {
    if (!f.nom||!f.email||!f.password||!f.tel||!f.adresse||!f.ville||!f.code_postal) return setErr("Tous les champs sont obligatoires.");
    if (!cgu) return setErr("Vous devez accepter les CGU et la politique de confidentialité.");
    setLoading(true); setErr("");
    try {
      const existing = await sbGet("utilisateurs", `email=eq.${encodeURIComponent(f.email)}&limit=1`);
      if (existing.length) { setErr("Email déjà utilisé."); return; }
      const hashed = await hashPassword(f.password);
      const [u] = await sbPost("utilisateurs", { role:"client", nom:f.nom, email:f.email, password:hashed, tel:f.tel, adresse:f.adresse, ville:f.ville, code_postal:f.code_postal, secteur:f.secteur });
      onLogin(u);
    } catch(e) { setErr("Erreur. Réessaie."); }
    finally { setLoading(false); }
  }

  if (mode === "cgu") return <CGUPage onBack={()=>setMode("register")} />;
  if (mode === "rgpd") return <RGPDPage onBack={()=>setMode("register")} />;
  if (mode === "forgot") return (
    <div className="lscreen">
      <style>{css}</style>
      <div className="llogo">UCO_</div>
      <p className="ltag">Collecte d'huiles usagées · Loiret</p>
      <div className="lcard"><ForgotPassword onBack={()=>setMode("login")} /></div>
    </div>
  );

  return (
    <div className="lscreen">
      <style>{css}</style>
      <div className="llogo">UCO_</div>
      <p className="ltag">Collecte d'huiles usagées · Loiret</p>
      <div className="lcard">
        <div className="tsw">
          <button className={`tbtn ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setErr("");}}>Connexion</button>
          <button className={`tbtn ${mode==="register"?"active":""}`} onClick={()=>{setMode("register");setErr("");}}>S'inscrire</button>
        </div>
        {err && <div className="alert aerr">⚠️ {err}</div>}
        {mode === "login" && (
          <>
            <div className="fg"><label className="fl">EMAIL</label><input className="fi" type="email" placeholder="votre@email.fr" value={f.email} onChange={up("email")} /></div>
            <div className="fg"><label className="fl">MOT DE PASSE</label><input className="fi" type="password" placeholder="••••••••" value={f.password} onChange={up("password")} onKeyDown={e=>e.key==="Enter"&&login()} /></div>
            <button className="btn bp bfull" onClick={login} disabled={loading}>{loading?<span className="spinner"/>:"Se connecter"}</button>
            <p style={{textAlign:"center",marginTop:12,fontSize:12,color:G.textMuted,cursor:"pointer"}} onClick={()=>setMode("forgot")}>Mot de passe oublié ?</p>
          </>
        )}
        {mode === "register" && (
          <>
            <div className="fg"><label className="fl">NOM DE L'ÉTABLISSEMENT</label><input className="fi" placeholder="Restaurant du Port" value={f.nom} onChange={up("nom")} /></div>
            <div className="fg"><label className="fl">EMAIL</label><input className="fi" type="email" placeholder="contact@restaurant.fr" value={f.email} onChange={up("email")} /></div>
            <div className="fg"><label className="fl">MOT DE PASSE</label><input className="fi" type="password" placeholder="••••••••" value={f.password} onChange={up("password")} /></div>
            <div className="fg"><label className="fl">TÉLÉPHONE</label><input className="fi" placeholder="06 XX XX XX XX" value={f.tel} onChange={up("tel")} /></div>
            <div className="fg"><label className="fl">ADRESSE</label><input className="fi" placeholder="12 Rue Bannier" value={f.adresse} onChange={up("adresse")} /></div>
            <div className="fg"><label className="fl">CODE POSTAL</label><input className="fi" placeholder="45000" value={f.code_postal} onChange={up("code_postal")} /></div>
            <div className="fg"><label className="fl">VILLE</label><input className="fi" placeholder="Orléans" value={f.ville} onChange={up("ville")} /></div>
            <div className="fg"><label className="fl">TYPE D'ÉTABLISSEMENT</label>
              <select className="fsel" value={f.secteur} onChange={up("secteur")}>
                {["Restaurant","Hôtel","Collectivité","Traiteur","Boulangerie","Autre"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={cgu} onChange={e=>setCgu(e.target.checked)} />
              <span>J'accepte les <a onClick={()=>setMode("cgu")}>CGU</a> et la <a onClick={()=>setMode("rgpd")}>Politique de confidentialité</a> d'Amon Energy.</span>
            </label>
            <button className="btn bp bfull" onClick={register} disabled={loading||!cgu} style={{opacity:cgu?1:0.5}}>{loading?<span className="spinner"/>:"Créer mon compte"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── MOT DE PASSE OUBLIÉ ────────────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    if (!email) return setErr("Entre ton email.");
    setLoading(true); setErr("");
    try {
      const users = await sbGet("utilisateurs", `email=eq.${encodeURIComponent(email)}&limit=1`);
      if (!users.length) { setErr("Aucun compte trouvé."); return; }
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await sbPatch("utilisateurs", users[0].id, { reset_token: token });
      const resetLink = `${window.location.origin}?reset=${token}`;
      await sendEmail(email, "Réinitialisation de votre mot de passe UCO Collect",
        `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:30px">
          <h2 style="color:#39d96a">UCO Collect</h2>
          <p>Bonjour, vous avez demandé la réinitialisation de votre mot de passe.</p>
          <a href="${resetLink}" style="display:inline-block;background:#39d96a;color:#070c09;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Réinitialiser mon mot de passe</a>
        </div>`
      );
      setSent(true);
    } catch(e) { setErr("Erreur, réessaie."); }
    finally { setLoading(false); }
  }

  if (sent) return (
    <div>
      <div className="success-check">{Ic.check}</div>
      <div className="alert asuc" style={{textAlign:"center"}}>Email envoyé ! Vérifie ta boîte mail.</div>
      <button className="btn bo2 bfull" onClick={onBack}>Retour à la connexion</button>
    </div>
  );

  return (
    <div>
      <p style={{fontSize:14,color:G.textMuted,marginBottom:16}}>Entre ton email pour recevoir un lien de réinitialisation.</p>
      {err && <div className="alert aerr">⚠️ {err}</div>}
      <div className="fg"><label className="fl">EMAIL</label><input className="fi" type="email" placeholder="votre@email.fr" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div className="ar">
        <button className="btn bo2" style={{flex:1}} onClick={onBack}>Retour</button>
        <button className="btn bp" style={{flex:2}} onClick={send} disabled={loading}>{loading?<span className="spinner"/>:"Envoyer le lien"}</button>
      </div>
    </div>
  );
}

// ── CARTE TAB ─────────────────────────────────────────────────────────────────
function CarteTab({ clients, demandes }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMap() {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        await new Promise(resolve => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      const results = [];
      for (const c of clients) {
        if (c.adresse && c.ville && c.code_postal) {
          const coords = await geocode(c.adresse, c.ville, c.code_postal);
          if (coords) results.push({ ...c, ...coords });
        }
      }
      setMarkers(results);
      setLoading(false);
      const mapEl = document.getElementById("leaflet-map");
      if (!mapEl || mapEl._leaflet_id) return;
      const map = window.L.map("leaflet-map", {zoomControl:true}).setView([47.9029, 1.9093], 10);
      setTimeout(() => map.invalidateSize(), 300);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
      const icon = window.L.divIcon({
        html: `<div style="background:#39d96a;width:14px;height:14px;border-radius:50%;border:2px solid #070c09;box-shadow:0 0 8px #39d96a"></div>`,
        className: "", iconSize: [14, 14], iconAnchor: [7, 7],
      });
      results.forEach(c => {
        const nb = demandes.filter(d=>d.client_id===c.id&&d.statut==="collectée").length;
        window.L.marker([c.lat, c.lng], { icon }).addTo(map)
          .bindPopup(`<b>${c.nom}</b><br>${c.adresse}<br>${c.code_postal} ${c.ville}<br>${nb} collecte${nb>1?"s":""}`);
      });
    }
    loadMap();
  }, [clients]);

  return (
    <div className="page">
      <p className="ptitle">Carte des clients</p>
      <p className="psub">{clients.length} établissements</p>
      {loading && <><div className="skeleton"/><div className="skeleton" style={{height:60}}/><div className="skeleton" style={{height:60}}/></>}
      <div id="leaflet-map" className="map-container" style={{display:loading?"none":"block"}}/>
      {!loading && markers.length === 0 && <div className="empty">{Ic.map}<p>Aucun client géolocalisable</p></div>}
      {!loading && markers.map((c,i) => (
        <div className="card" key={c.id} style={{animationDelay:`${i*0.05}s`}}>
          <div className="ch">
            <div><div className="ct">{c.nom}</div><div className="cs">{c.secteur}</div></div>
            <span className="vpill">{Ic.loc} {c.ville}</span>
          </div>
          <div className="ir">{Ic.loc} {c.adresse}, {c.code_postal} {c.ville}</div>
        </div>
      ))}
    </div>
  );
}

// ── STATS TAB ─────────────────────────────────────────────────────────────────
function StatsTab({ demandes, clients }) {
  const totalVol = demandes.filter(d=>d.statut==="collectée").reduce((s,d)=>s+(d.volume_estime||0),0);
  const totalCA = (totalVol * 0.5).toFixed(0);
  const collectees = demandes.filter(d=>d.statut==="collectée").length;
  const now = new Date();
  const mois = Array.from({length:6}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    return { label: d.toLocaleDateString("fr-FR",{month:"short"}), year: d.getFullYear(), month: d.getMonth() };
  });
  const volParMois = mois.map(m => {
    const vol = demandes.filter(d=>d.statut==="collectée"&&d.date_souhaitee)
      .filter(d=>{ const dd=new Date(d.date_souhaitee); return dd.getMonth()===m.month&&dd.getFullYear()===m.year; })
      .reduce((s,d)=>s+(d.volume_estime||0),0);
    return {...m, vol};
  });
  const maxVol = Math.max(...volParMois.map(m=>m.vol), 1);
  const topClients = clients.map(c=>({
    ...c,
    vol: demandes.filter(d=>d.client_id===c.id&&d.statut==="collectée").reduce((s,d)=>s+(d.volume_estime||0),0),
    nb: demandes.filter(d=>d.client_id===c.id&&d.statut==="collectée").length,
  })).sort((a,b)=>b.vol-a.vol).slice(0,5);

  return (
    <div className="page">
      <p className="ptitle">Statistiques</p>
      <p className="psub">Vue d'ensemble de l'activité</p>
      <div className="sgrid">
        {[
          {v:clients.length, l:"Clients inscrits"},
          {v:collectees, l:"Collectes réalisées"},
          {v:`${totalVol} L`, l:"Volume total"},
          {v:`${totalCA} €`, l:"CA estimé"},
        ].map((s,i)=>(
          <div className="sc" key={i} style={{animationDelay:`${i*0.1}s`}}>
            <div className="sv">{s.v}</div><div className="sl">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="stitle" style={{margin:"0 0 12px"}}>Volume collecté / mois (L)</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
          {volParMois.map((m,i)=>(
            <div key={i} className="stat-bar-wrap">
              <div className="stat-bar-val">{m.vol>0?m.vol:""}</div>
              <div className="stat-bar" style={{height:m.vol>0?`${Math.round((m.vol/maxVol)*60)+10}px`:"4px",opacity:m.vol>0?1:0.3}}/>
              <div className="stat-bar-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <p className="stitle" style={{margin:"0 0 12px"}}>Objectifs</p>
        {[
          {label:"Volume collecté",val:totalVol,max:20000,unit:"L"},
          {label:"Clients actifs",val:clients.length,max:200,unit:""},
          {label:"Collectes réalisées",val:collectees,max:150,unit:""},
        ].map((o,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{color:G.text}}>{o.label}</span>
              <span style={{color:G.textMuted,fontFamily:"DM Mono"}}>{o.val}{o.unit} / {o.max}{o.unit}</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{width:`${Math.min((o.val/o.max)*100,100)}%`}}/></div>
          </div>
        ))}
      </div>
      <p className="stitle" style={{marginTop:16}}>Top clients par volume</p>
      {topClients.length===0&&<div className="empty">{Ic.drop}<p>Aucune collecte réalisée</p></div>}
      {topClients.map((c,i)=>(
        <div className="card" key={c.id} style={{animationDelay:`${i*0.05}s`}}>
          <div className="ch">
            <div><div className="ct">{i+1}. {c.nom}</div><div className="cs">{c.secteur} · {c.nb} collecte{c.nb>1?"s":""}</div></div>
            <span className="vpill">{Ic.drop} {c.vol} L</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CLIENT APP ─────────────────────────────────────────────────────────────────
function ClientApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [demandes, setDemandes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date_souhaitee:"", creneau:"matin", volume_estime:"", remarque:"" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [legalPage, setLegalPage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sbGet("demandes", `client_id=eq.${user.id}&order=created_at.desc`);
      setDemandes(data);
    } finally { setLoading(false); }
  }, [user.id]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const t=setInterval(load,15000);return()=>clearInterval(t);},[load]);

  if (legalPage === "cgu") return <CGUPage onBack={()=>setLegalPage(null)} />;
  if (legalPage === "rgpd") return <RGPDPage onBack={()=>setLegalPage(null)} />;

  async function submit() {
    if (!form.date_souhaitee||!form.volume_estime) return;
    setSubmitting(true);
    try {
      const adresseComplete = `${user.adresse}${user.ville?", "+user.ville:""}${user.code_postal?" "+user.code_postal:""}`;
      const [d] = await sbPost("demandes", {
        client_id:user.id, client_nom:user.nom, adresse:adresseComplete,
        date_souhaitee:form.date_souhaitee, creneau:form.creneau,
        volume_estime:parseInt(form.volume_estime), remarque:form.remarque, statut:"en_attente",
      });
      setDemandes(p=>[d,...p]);
      setForm({date_souhaitee:"",creneau:"matin",volume_estime:"",remarque:""});
      setModal(false);
      setToast("Demande envoyée ! Vous serez contacté sous 24h.");
      await sendEmail("muslum@amonenergy.fr", `🛢️ Nouvelle demande — ${user.nom}`,
        `<div style="font-family:sans-serif;padding:30px;background:#070c09;color:#e8f5eb;border-radius:12px">
          <h2 style="color:#39d96a">UCO Collect</h2>
          <p><b>Client :</b> ${user.nom}</p>
          <p><b>Adresse :</b> ${adresseComplete}</p>
          <p><b>Date :</b> ${form.date_souhaitee} · ${form.creneau}</p>
          <p><b>Volume :</b> ${form.volume_estime} L</p>
          ${form.remarque?`<p><b>Remarque :</b> ${form.remarque}</p>`:""}
          <a href="https://uco-collect.vercel.app" style="display:inline-block;background:#39d96a;color:#070c09;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Voir dans l'app</a>
        </div>`
      );
    } finally { setSubmitting(false); }
  }

  const up = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const pending = demandes.filter(d=>d.statut==="en_attente").length;
  const firstTime = demandes.length === 0 && !loading;

  return (
    <div className="shell">
      <style>{css}</style>
      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
      <div className="header">
        <div className="logo">UCO_<span>collect</span></div>
        <div className="ubadge" onClick={onLogout}><div className="rdot client"/><span>{user.nom.split(" ")[0]}</span>{Ic.logout}</div>
      </div>

      {tab==="home" && (
        <div className="page">
          <p className="ptitle">Bonjour 👋</p>
          <p className="psub">{user.nom}</p>
          <div className="sgrid">
            <div className="sc"><div className="sv">{demandes.length}</div><div className="sl">Demandes totales</div></div>
            <div className="sc"><div className="sv">{demandes.filter(d=>d.statut==="collectée").length}</div><div className="sl">Collectées</div></div>
          </div>
          <button className="btn bp bfull" style={{marginBottom:24}} onClick={()=>setModal(true)}>{Ic.plus} Demander une collecte</button>

          {firstTime ? (
            <div className="onboarding">
              <div className="onboarding-icon">🛢️</div>
              <h2>Bienvenue sur UCO Collect !</h2>
              <p>Faites votre première demande de collecte d'huiles usagées en quelques secondes. Notre collecteur viendra directement à votre établissement.</p>
              <button className="btn bp" onClick={()=>setModal(true)}>{Ic.plus} Ma première demande</button>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <p className="stitle" style={{margin:0}}>Dernières demandes</p>
                <button className="btn bo2 bsm" onClick={load} style={{padding:"4px 10px"}}>{Ic.refresh}</button>
              </div>
              <div style={{marginTop:12}}>
                {loading && <><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></>}
                {!loading && demandes.slice(0,5).map((d,i)=>(
                  <div className="card" key={d.id} style={{animationDelay:`${i*0.05}s`}}>
                    <div className="ch"><div><div className="ct">{fmtDate(d.date_souhaitee)}</div><div className="cs">{CRENEAUX[d.creneau]}</div></div><SBadge statut={d.statut}/></div>
                    <span className="vpill">{Ic.drop} {d.volume_estime} L estimés</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab==="demandes" && (
        <div className="page">
          <p className="ptitle">Mes demandes</p>
          <p className="psub">{demandes.length} demande{demandes.length>1?"s":""}</p>
          {loading && <><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></>}
          {!loading && demandes.length===0 && (
            <div className="empty">{Ic.list}<p>Aucune demande pour l'instant</p>
              <button className="btn bp" style={{margin:"16px auto 0"}} onClick={()=>setTab("home")}>{Ic.plus} Faire une demande</button>
            </div>
          )}
          {!loading && demandes.map((d,i)=>(
            <div className="card" key={d.id} style={{animationDelay:`${i*0.05}s`}}>
              <div className="ch"><div><div className="ct">{fmtDate(d.date_souhaitee)}</div><div className="cs">{CRENEAUX[d.creneau]}</div></div><SBadge statut={d.statut}/></div>
              <span className="vpill" style={{marginBottom:8}}>{Ic.drop} {d.volume_estime} L</span>
              {d.remarque&&<div className="ir">{Ic.bell}<span style={{color:G.text}}>{d.remarque}</span></div>}
              <div className="ir">{Ic.clock} Envoyée le {fmtDate(d.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="profil" && (
        <div className="page">
          <p className="ptitle">Mon profil</p>
          <p className="psub">Informations de l'établissement</p>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:G.accentGlow,border:`2px solid ${G.accent}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontSize:24}}>
              {user.nom[0].toUpperCase()}
            </div>
            <div style={{fontSize:16,fontWeight:700}}>{user.nom}</div>
            <span className="badge bo" style={{marginTop:4,display:"inline-block"}}>{user.secteur}</span>
          </div>
          <div className="card">
            <div className="ir">{Ic.loc} {user.adresse}{user.ville?`, ${user.ville}`:""}{user.code_postal?` ${user.code_postal}`:""}</div>
            <div className="ir" style={{marginTop:6}}>{Ic.user} {user.tel}</div>
            <div className="ir" style={{marginTop:6}}>{Ic.bell} {user.email}</div>
          </div>
          <div className="card">
            <p className="stitle" style={{margin:"0 0 10px"}}>Informations légales</p>
            <button className="btn bo2 bfull bsm" style={{marginBottom:8}} onClick={()=>setLegalPage("cgu")}>📄 Conditions d'utilisation</button>
            <button className="btn bo2 bfull bsm" onClick={()=>setLegalPage("rgpd")}>{Ic.shield} Politique de confidentialité & RGPD</button>
          </div>
          <button className="btn bdng bfull" onClick={onLogout} style={{marginTop:8}}>{Ic.logout} Se déconnecter</button>
        </div>
      )}

      <div className="bnav">
        <button className={`ni ${tab==="home"?"active":""}`} onClick={()=>setTab("home")}>{Ic.home}<span>Accueil</span></button>
        <button className={`ni ${tab==="demandes"?"active":""}`} onClick={()=>setTab("demandes")} style={{position:"relative"}}>
          {Ic.list}{pending>0&&<span className="nbadge">{pending}</span>}<span>Demandes</span>
        </button>
        <button className={`ni ${tab==="profil"?"active":""}`} onClick={()=>setTab("profil")}>{Ic.user}<span>Profil</span></button>
      </div>

      {modal && (
        <div className="moverlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="mhandle"/>
            <div className="mtitle">🛢️ Nouvelle demande de collecte</div>
            <div className="fg"><label className="fl">DATE SOUHAITÉE</label><input className="fi" type="date" value={form.date_souhaitee} min={new Date().toISOString().slice(0,10)} onChange={up("date_souhaitee")} /></div>
            <div className="fg"><label className="fl">CRÉNEAU</label>
              <select className="fsel" value={form.creneau} onChange={up("creneau")}>
                {Object.entries(CRENEAUX).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">VOLUME ESTIMÉ (litres)</label><input className="fi" type="number" placeholder="Ex: 40" value={form.volume_estime} onChange={up("volume_estime")} /></div>
            <div className="fg"><label className="fl">REMARQUE (optionnel)</label><textarea className="fta" placeholder="Accès difficile, type de contenant..." value={form.remarque} onChange={up("remarque")} /></div>
            <div className="ir" style={{marginBottom:16,padding:"8px 12px",background:G.card,borderRadius:8}}>{Ic.loc} {user.adresse}{user.ville?`, ${user.ville}`:""}</div>
            <div className="ar">
              <button className="btn bo2" style={{flex:1}} onClick={()=>setModal(false)}>Annuler</button>
              <button className="btn bp" style={{flex:2}} onClick={submit} disabled={submitting||!form.date_souhaitee||!form.volume_estime}>{submitting?<span className="spinner"/>:<>{Ic.check} Envoyer</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COLLECTEUR APP ─────────────────────────────────────────────────────────────
function CollecteurApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [demandes, setDemandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [legalPage, setLegalPage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([
        sbGet("demandes","order=created_at.desc"),
        sbGet("utilisateurs","role=eq.client&order=created_at.desc"),
      ]);
      setDemandes(d); setClients(u);
    } finally { setLoading(false); }
  }, []);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const t=setInterval(load,10000);return()=>clearInterval(t);},[load]);

  if (legalPage === "cgu") return <CGUPage onBack={()=>setLegalPage(null)} />;
  if (legalPage === "rgpd") return <RGPDPage onBack={()=>setLegalPage(null)} />;

  async function upd(id, statut) {
    setUpdating(true);
    try {
      await sbPatch("demandes", id, { statut });
      setDemandes(p=>p.map(d=>d.id===id?{...d,statut}:d));
      const demande = demandes.find(d=>d.id===id);
      const client = clients.find(c=>c.id===demande?.client_id);
      setToast(`Demande ${statut} ✓`);
      if (client && (statut==="acceptée"||statut==="refusée")) {
        const isOk = statut==="acceptée";
        await sendEmail("muslum@amonenergy.fr",
          `${isOk?"✅":"❌"} Demande ${statut} — ${client.nom}`,
          `<div style="font-family:sans-serif;padding:30px;background:#070c09;color:#e8f5eb;border-radius:12px">
            <h2 style="color:#39d96a">UCO Collect</h2>
            <p>Bonjour <b>${client.nom}</b>,</p>
            <p>Votre demande du <b>${fmtDate(demande.date_souhaitee)}</b> a été <b style="color:${isOk?"#39d96a":"#e05252"}">${statut}</b>.</p>
            ${isOk?`<p>Nous passerons le <b>${fmtDate(demande.date_souhaitee)}</b> · ${CRENEAUX[demande.creneau]}.</p>`:"<p>N'hésitez pas à soumettre une nouvelle demande.</p>"}
            <a href="https://uco-collect.vercel.app" style="display:inline-block;background:#39d96a;color:#070c09;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Voir dans l'app</a>
          </div>`
        );
      }
      setSel(prev=>prev?{...prev,statut}:null);
    } finally { setUpdating(false); }
  }

  const enAttente = demandes.filter(d=>d.statut==="en_attente");
  const acceptees  = demandes.filter(d=>d.statut==="acceptée");
  const totalVol   = demandes.filter(d=>d.statut==="collectée").reduce((s,d)=>s+(d.volume_estime||0),0);

  function DCard({ d, i }) {
    const client = clients.find(u=>u.id===d.client_id);
    return (
      <div className="card" onClick={()=>setSel(d)} style={{cursor:"pointer",animationDelay:`${i*0.05}s`}}>
        <div className="ch">
          <div><div className="ct">{d.client_nom}</div><div className="cs">{client?.secteur||""} · {fmtDate(d.date_souhaitee)}</div></div>
          <SBadge statut={d.statut}/>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
          <span className="vpill">{Ic.drop} {d.volume_estime} L</span>
          <span className="ir">{Ic.clock} {CRENEAUX[d.creneau]}</span>
        </div>
        <div className="ir" style={{marginTop:6}}>{Ic.loc} {d.adresse}</div>
      </div>
    );
  }

  return (
    <div className="shell">
      <style>{css}</style>
      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
      <div className="header">
        <div className="logo">UCO_<span>admin</span></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="btn bo2 bsm" onClick={load} style={{padding:"6px 10px"}}>{Ic.refresh}</button>
          <div className="ubadge" onClick={onLogout}><div className="rdot"/><span>Collecteur</span>{Ic.logout}</div>
        </div>
      </div>

      {tab==="home" && (
        <div className="page">
          <p className="ptitle">Tableau de bord</p>
          <p className="psub">Bonjour, {user.nom} 👋</p>
          {loading && <><div className="skeleton"/><div className="skeleton"/></>}
          {!loading && (
            <div className="sgrid">
              {[
                {v:enAttente.length, l:"En attente", c:G.warn},
                {v:acceptees.length, l:"Planifiées", c:G.accent},
                {v:demandes.filter(d=>d.statut==="collectée").length, l:"Collectées", c:G.info},
                {v:`${totalVol} L`, l:"Litres collectés", c:G.accent},
              ].map((s,i)=>(
                <div className="sc" key={i} style={{animationDelay:`${i*0.1}s`}}>
                  <div className="sv" style={{color:s.c}}>{s.v}</div>
                  <div className="sl">{s.l}</div>
                </div>
              ))}
            </div>
          )}
          {enAttente.length>0&&<><p className="stitle">⚡ À traiter</p>{enAttente.map((d,i)=><DCard key={d.id} d={d} i={i}/>)}</>}
          {acceptees.length>0&&<><p className="stitle">📅 Planifiées</p>{acceptees.map((d,i)=><DCard key={d.id} d={d} i={i}/>)}</>}
          {!loading&&enAttente.length===0&&acceptees.length===0&&(
            <div className="empty">{Ic.truck}<p>Aucune demande active 🎉</p></div>
          )}
        </div>
      )}

      {tab==="demandes" && (
        <div className="page">
          <p className="ptitle">Toutes les demandes</p>
          <p className="psub">{demandes.length} au total</p>
          {loading && <><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></>}
          {!loading&&demandes.length===0&&<div className="empty">{Ic.list}<p>Aucune demande</p></div>}
          {!loading&&[...enAttente,...acceptees,...demandes.filter(d=>d.statut==="collectée"||d.statut==="refusée")].map((d,i)=><DCard key={d.id} d={d} i={i}/>)}
        </div>
      )}

      {tab==="clients" && (
        <div className="page">
          <p className="ptitle">Clients</p>
          <p className="psub">{clients.length} établissements inscrits</p>
          {loading && <><div className="skeleton"/><div className="skeleton"/></>}
          {!loading&&clients.length===0&&<div className="empty">{Ic.user}<p>Aucun client inscrit</p></div>}
          {!loading&&clients.map((c,i)=>{
            const nb=demandes.filter(d=>d.client_id===c.id&&d.statut==="collectée").length;
            return (
              <div className="card" key={c.id} style={{animationDelay:`${i*0.05}s`}}>
                <div className="ch">
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:G.accentGlow,border:`1px solid ${G.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:G.accent}}>
                        {c.nom[0].toUpperCase()}
                      </div>
                      <div><div className="ct">{c.nom}</div><div className="cs">{c.secteur}</div></div>
                    </div>
                  </div>
                  <span className="badge bo">{nb} collecte{nb>1?"s":""}</span>
                </div>
                <div className="ir">{Ic.loc} {c.adresse}{c.ville?`, ${c.ville}`:""}</div>
                <div className="ir" style={{marginTop:4}}>{Ic.user} {c.tel}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab==="stats" && <StatsTab demandes={demandes} clients={clients} />}
      {tab==="carte" && <CarteTab clients={clients} demandes={demandes} />}

      <div className="bnav">
        <button className={`ni ${tab==="home"?"active":""}`} onClick={()=>setTab("home")} style={{position:"relative"}}>
          {Ic.home}{enAttente.length>0&&<span className="nbadge">{enAttente.length}</span>}<span>Dashboard</span>
        </button>
        <button className={`ni ${tab==="demandes"?"active":""}`} onClick={()=>setTab("demandes")}>{Ic.list}<span>Demandes</span></button>
        <button className={`ni ${tab==="clients"?"active":""}`} onClick={()=>setTab("clients")}>{Ic.user}<span>Clients</span></button>
        <button className={`ni ${tab==="stats"?"active":""}`} onClick={()=>setTab("stats")}>{Ic.chart}<span>Stats</span></button>
        <button className={`ni ${tab==="carte"?"active":""}`} onClick={()=>setTab("carte")}>{Ic.map}<span>Carte</span></button>
      </div>

      {sel && (
        <div className="moverlay" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal">
            <div className="mhandle"/>
            <div className="mtitle">Demande de collecte</div>
            <div className="card" style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:G.accentGlow,border:`1px solid ${G.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:G.accent}}>
                  {sel.client_nom[0].toUpperCase()}
                </div>
                <div><div style={{fontSize:15,fontWeight:600}}>{sel.client_nom}</div><SBadge statut={sel.statut}/></div>
              </div>
              <div className="div"/>
              <div className="ir">{Ic.loc} {sel.adresse}</div>
              <div className="ir" style={{marginTop:8}}>{Ic.clock} {fmtDate(sel.date_souhaitee)} · {CRENEAUX[sel.creneau]}</div>
              <div className="ir" style={{marginTop:8}}>{Ic.drop} <span className="vpill">{sel.volume_estime} litres estimés</span></div>
              {sel.remarque&&<div className="ir" style={{marginTop:8,alignItems:"flex-start"}}>{Ic.bell} <span>{sel.remarque}</span></div>}
            </div>
            {sel.statut==="en_attente" && (
              <div className="ar">
                <button className="btn bdng bsm" style={{flex:1}} onClick={()=>upd(sel.id,"refusée")} disabled={updating}>{updating?<span className="spinner"/>:<>{Ic.x} Refuser</>}</button>
                <button className="btn bsuc" style={{flex:2}} onClick={()=>upd(sel.id,"acceptée")} disabled={updating}>{updating?<span className="spinner"/>:<>{Ic.check} Accepter</>}</button>
              </div>
            )}
            {sel.statut==="acceptée" && (
              <div className="ar">
                <button className="btn bo2 bsm" style={{flex:1}} onClick={()=>setSel(null)}>Fermer</button>
                <button className="btn bp" style={{flex:2}} onClick={()=>upd(sel.id,"collectée")} disabled={updating}>{updating?<span className="spinner"/>:<>{Ic.truck} Marquer collectée</>}</button>
              </div>
            )}
            {(sel.statut==="collectée"||sel.statut==="refusée") && (
              <button className="btn bo2 bfull" onClick={()=>setSel(null)}>Fermer</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState(null);
  if (!me) return <Login onLogin={setMe} />;
  if (me.role==="collecteur") return <CollecteurApp user={me} onLogout={()=>setMe(null)} />;
  return <ClientApp user={me} onLogout={()=>setMe(null)} />;
}
