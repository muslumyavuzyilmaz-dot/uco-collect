import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPA_URL = "https://hhjkawwknbmyjvemcwxq.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoamthd3drbmJteWp2ZW1jd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjE4NzUsImV4cCI6MjA5NDIzNzg3NX0.yDAC12BTUXYMSWVN4EhDxpiEQZQn5bTp87IA6LyFKNc";

// ─── HACHAGE MOT DE PASSE ─────────────────────────────────────────────────────
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
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
.header{padding:18px 20px 14px;border-bottom:1px solid ${G.border};display:flex;align-items:center;justify-content:space-between;background:${G.surface};position:sticky;top:0;z-index:100}
.logo{font-family:'DM Mono',monospace;font-size:18px;font-weight:500;color:${G.accent};letter-spacing:-0.5px}
.logo span{color:${G.textMuted}}
.ubadge{display:flex;align-items:center;gap:8px;background:${G.card};border:1px solid ${G.border};border-radius:20px;padding:6px 12px;font-size:12px;color:${G.textMuted};cursor:pointer;transition:border-color .2s}
.ubadge:hover{border-color:${G.accentDark}}
.rdot{width:7px;height:7px;border-radius:50%;background:${G.accent};box-shadow:0 0 6px ${G.accent}}
.rdot.client{background:${G.info};box-shadow:0 0 6px ${G.info}}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${G.surface};border-top:1px solid ${G.border};display:flex;padding:10px 0 20px;z-index:100}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;cursor:pointer;border:none;background:none;color:${G.textMuted};font-family:'Sora',sans-serif;font-size:10px;transition:all .2s;position:relative}
.ni.active{color:${G.accent}}
.ni svg{width:22px;height:22px}
.nbadge{position:absolute;top:2px;right:10px;background:${G.danger};color:white;font-size:9px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace}
.page{padding:20px 20px 100px}
.ptitle{font-size:22px;font-weight:700;margin-bottom:4px;letter-spacing:-0.5px}
.psub{font-size:13px;color:${G.textMuted};margin-bottom:24px}
.card{background:${G.card};border:1px solid ${G.border};border-radius:16px;padding:16px;margin-bottom:12px;transition:border-color .2s,transform .15s}
.card:hover{border-color:${G.accentDark};transform:translateY(-1px)}
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
.bp{background:${G.accent};color:#070c09;box-shadow:0 0 20px rgba(57,217,106,.25)}
.bp:hover{box-shadow:0 0 30px rgba(57,217,106,.4);transform:translateY(-1px)}
.bp:disabled{opacity:.5;cursor:not-allowed;transform:none}
.bo2{background:transparent;color:${G.text};border:1px solid ${G.border}}
.bo2:hover{border-color:${G.accentDark}}
.bdng{background:rgba(224,82,82,.15);color:${G.danger};border:1px solid rgba(224,82,82,.3)}
.bsuc{background:rgba(57,217,106,.12);color:${G.accent};border:1px solid rgba(57,217,106,.3)}
.bsm{padding:7px 14px;font-size:12px;border-radius:9px}
.bfull{width:100%}
.ar{display:flex;gap:8px;margin-top:12px}
.fg{margin-bottom:16px}
.fl{font-size:12px;color:${G.textMuted};margin-bottom:6px;display:block;font-family:'DM Mono',monospace;letter-spacing:.5px}
.fi,.fsel,.fta{width:100%;background:${G.surface};border:1px solid ${G.border};border-radius:10px;padding:12px 14px;font-family:'Sora',sans-serif;font-size:14px;color:${G.text};outline:none;transition:border-color .2s}
.fi:focus,.fsel:focus,.fta:focus{border-color:${G.accentDark};box-shadow:0 0 0 3px ${G.accentGlow}}
.fta{resize:none;height:80px}
.fsel option{background:${G.surface}}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.sc{background:${G.card};border:1px solid ${G.border};border-radius:14px;padding:14px}
.sv{font-family:'DM Mono',monospace;font-size:26px;font-weight:500;color:${G.accent}}
.sl{font-size:11px;color:${G.textMuted};margin-top:2px}
.lscreen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 24px;background:${G.bg}}
.llogo{font-family:'DM Mono',monospace;font-size:32px;color:${G.accent};margin-bottom:6px;letter-spacing:-1px}
.ltag{font-size:13px;color:${G.textMuted};margin-bottom:40px}
.lcard{width:100%;max-width:380px;background:${G.card};border:1px solid ${G.border};border-radius:20px;padding:28px 24px}
.tsw{display:flex;background:${G.surface};border-radius:10px;padding:3px;margin-bottom:24px}
.tbtn{flex:1;padding:8px;border-radius:8px;border:none;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;background:transparent;color:${G.textMuted}}
.tbtn.active{background:${G.accent};color:#070c09}
.div{height:1px;background:${G.border};margin:16px 0}
.empty{text-align:center;padding:50px 20px;color:${G.textMuted}}
.empty svg{width:48px;height:48px;margin-bottom:12px;opacity:.4}
.empty p{font-size:14px}
.moverlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.modal{background:${G.surface};border:1px solid ${G.border};border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:430px;max-height:90vh;overflow-y:auto;animation:su .25s ease}
@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mhandle{width:40px;height:4px;background:${G.border};border-radius:2px;margin:0 auto 20px}
.mtitle{font-size:18px;font-weight:700;margin-bottom:20px}
.stitle{font-family:'DM Mono',monospace;font-size:11px;color:${G.textMuted};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;margin-top:8px}
.alert{padding:12px 14px;border-radius:10px;font-size:13px;margin-bottom:16px}
.asuc{background:rgba(57,217,106,.1);color:${G.accent};border:1px solid rgba(57,217,106,.2)}
.aerr{background:rgba(224,82,82,.1);color:${G.danger};border:1px solid rgba(224,82,82,.2)}
.vpill{display:inline-flex;align-items:center;gap:4px;background:rgba(57,217,106,.08);border:1px solid rgba(57,217,106,.2);border-radius:20px;padding:3px 10px;font-family:'DM Mono',monospace;font-size:12px;color:${G.accent}}
.spinner{width:20px;height:20px;border:2px solid ${G.border};border-top-color:${G.accent};border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:${G.bg}}
.loading-screen .llogo{font-family:'DM Mono',monospace;font-size:32px;color:${G.accent};letter-spacing:-1px}
.setup-box{background:${G.card};border:1px solid ${G.border};border-radius:16px;padding:20px;margin-top:16px;max-width:380px;width:100%}
.setup-box pre{font-family:'DM Mono',monospace;font-size:11px;color:${G.accent};white-space:pre-wrap;word-break:break-all;line-height:1.6}
`;

const STATUTS = {
  en_attente: { label: "En attente", cls: "bw" },
  acceptée:   { label: "Acceptée",   cls: "bo" },
  collectée:  { label: "Collectée",  cls: "bd" },
  refusée:    { label: "Refusée",    cls: "br" },
};
const CRENEAUX = { matin: "Matin (8h–12h)", apres_midi: "Après-midi (13h–17h)", flexible: "Flexible" };
function fmtDate(d) { if (!d) return ""; return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }

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
};

function SBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut, cls: "bw" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

const SETUP_SQL = `-- À exécuter dans Supabase > SQL Editor

create table if not exists utilisateurs (
  id uuid primary key default gen_random_uuid(),
  role text not null default 'client',
  nom text not null,
  email text unique not null,
  password text not null,
  tel text,
  adresse text,
  secteur text,
  created_at timestamptz default now()
);

create table if not exists demandes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references utilisateurs(id),
  client_nom text,
  adresse text,
  date_souhaitee date,
  creneau text,
  volume_estime integer,
  remarque text,
  statut text default 'en_attente',
  created_at timestamptz default now()
);

-- Compte collecteur (toi)
insert into utilisateurs (role, nom, email, password, tel)
values ('collecteur', 'Muslum', 'muslum@amonenergy.fr', 'admin123', '06 00 00 00 00')
on conflict (email) do nothing;`;

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ email:"", password:"", nom:"", tel:"", adresse:"", secteur:"Restaurant" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const up = k => e => setF(p => ({...p, [k]: e.target.value}));

  async function login() {
    setLoading(true); setErr("");
    try {
      const hashed = await hashPassword(f.password);
      const users = await sbGet("utilisateurs", `email=eq.${encodeURIComponent(f.email)}&password=eq.${encodeURIComponent(hashed)}&limit=1`);
      if (!users.length) { setErr("Email ou mot de passe incorrect."); return; }
      onLogin(users[0]);
    } catch(e) {
      setErr("Erreur de connexion. Vérifie que les tables sont créées.");
      setShowSetup(true);
    } finally { setLoading(false); }
  }

  async function register() {
    if (!f.nom||!f.email||!f.password||!f.tel||!f.adresse) return setErr("Tous les champs sont obligatoires.");
    setLoading(true); setErr("");
    try {
      const existing = await sbGet("utilisateurs", `email=eq.${encodeURIComponent(f.email)}&limit=1`);
      if (existing.length) { setErr("Email déjà utilisé."); return; }
      const hashed = await hashPassword(f.password);
      const [u] = await sbPost("utilisateurs", { role:"client", nom:f.nom, email:f.email, password:hashed, tel:f.tel, adresse:f.adresse, secteur:f.secteur });
      onLogin(u);
    } catch(e) {
      setErr("Erreur. Vérifie que les tables sont créées.");
      setShowSetup(true);
    } finally { setLoading(false); }
  }

  return (
    <div className="lscreen">
      <style>{css}</style>
      <div className="llogo">UCO_</div>
      <p className="ltag">Collecte d'huiles usagées · Loiret</p>
      <div className="lcard">
        <div className="tsw">
          <button className={`tbtn ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setErr("");setShowSetup(false);}}>Connexion</button>
          <button className={`tbtn ${mode==="register"?"active":""}`} onClick={()=>{setMode("register");setErr("");setShowSetup(false);}}>S'inscrire</button>
        </div>
        {err && <div className="alert aerr">{err}</div>}

        {showSetup && (
          <div className="setup-box">
            <p style={{fontSize:12,color:G.warn,marginBottom:10,fontWeight:600}}>⚠️ Tables manquantes — exécute ce SQL dans Supabase :</p>
            <pre>{SETUP_SQL}</pre>
            <p style={{fontSize:11,color:G.textMuted,marginTop:10}}>
              👉 <a href="https://supabase.com/dashboard/project/hhjkawwknbmyjvemcwxq/sql/new" target="_blank" style={{color:G.accent}}>Ouvrir SQL Editor</a>
            </p>
          </div>
        )}

        {!showSetup && mode === "login" && (
          <>
            <div className="fg"><label className="fl">EMAIL</label><input className="fi" type="email" placeholder="votre@email.fr" value={f.email} onChange={up("email")} /></div>
            <div className="fg"><label className="fl">MOT DE PASSE</label><input className="fi" type="password" placeholder="••••••••" value={f.password} onChange={up("password")} onKeyDown={e=>e.key==="Enter"&&login()} /></div>
            <button className="btn bp bfull" onClick={login} disabled={loading}>{loading ? <span className="spinner"/> : "Se connecter"}</button>
          </>
        )}

        {!showSetup && mode === "register" && (
          <>
            <div className="fg"><label className="fl">NOM DE L'ÉTABLISSEMENT</label><input className="fi" placeholder="Restaurant du Port" value={f.nom} onChange={up("nom")} /></div>
            <div className="fg"><label className="fl">EMAIL</label><input className="fi" type="email" placeholder="contact@restaurant.fr" value={f.email} onChange={up("email")} /></div>
            <div className="fg"><label className="fl">MOT DE PASSE</label><input className="fi" type="password" placeholder="••••••••" value={f.password} onChange={up("password")} /></div>
            <div className="fg"><label className="fl">TÉLÉPHONE</label><input className="fi" placeholder="06 XX XX XX XX" value={f.tel} onChange={up("tel")} /></div>
            <div className="fg"><label className="fl">ADRESSE</label><input className="fi" placeholder="12 Rue Bannier, Orléans" value={f.adresse} onChange={up("adresse")} /></div>
            <div className="fg"><label className="fl">TYPE D'ÉTABLISSEMENT</label>
              <select className="fsel" value={f.secteur} onChange={up("secteur")}>
                {["Restaurant","Hôtel","Collectivité","Traiteur","Boulangerie","Autre"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn bp bfull" onClick={register} disabled={loading}>{loading ? <span className="spinner"/> : "Créer mon compte"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── CLIENT APP ─────────────────────────────────────────────────────────────────
function ClientApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [demandes, setDemandes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date_souhaitee:"", creneau:"matin", volume_estime:"", remarque:"" });
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sbGet("demandes", `client_id=eq.${user.id}&order=created_at.desc`);
      setDemandes(data);
    } finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function submit() {
    if (!form.date_souhaitee || !form.volume_estime) return;
    setSubmitting(true);
    try {
      const [d] = await sbPost("demandes", {
        client_id: user.id, client_nom: user.nom, adresse: user.adresse,
        date_souhaitee: form.date_souhaitee, creneau: form.creneau,
        volume_estime: parseInt(form.volume_estime), remarque: form.remarque, statut: "en_attente",
      });
      setDemandes(p => [d, ...p]);
      setForm({date_souhaitee:"",creneau:"matin",volume_estime:"",remarque:""});
      setModal(false); setOk(true); setTimeout(()=>setOk(false),3000);
    } finally { setSubmitting(false); }
  }

  const up = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const pending = demandes.filter(d=>d.statut==="en_attente").length;

  return (
    <div className="shell">
      <style>{css}</style>
      <div className="header">
        <div className="logo">UCO_<span>collect</span></div>
        <div className="ubadge" onClick={onLogout}><div className="rdot client"/><span>{user.nom.split(" ")[0]}</span>{Ic.logout}</div>
      </div>

      {tab==="home" && (
        <div className="page">
          <p className="ptitle">Bonjour 👋</p>
          <p className="psub">{user.nom}</p>
          {ok && <div className="alert asuc">✓ Demande envoyée ! Vous serez contacté sous 24h.</div>}
          <div className="sgrid">
            <div className="sc"><div className="sv">{demandes.length}</div><div className="sl">Demandes totales</div></div>
            <div className="sc"><div className="sv">{demandes.filter(d=>d.statut==="collectée").length}</div><div className="sl">Collectées</div></div>
          </div>
          <button className="btn bp bfull" style={{marginBottom:24}} onClick={()=>setModal(true)}>{Ic.plus} Demander une collecte</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p className="stitle" style={{margin:0}}>Dernières demandes</p>
            <button className="btn bo2 bsm" onClick={load} style={{padding:"4px 10px"}}>{Ic.refresh}</button>
          </div>
          <div style={{marginTop:12}}>
            {loading && <div style={{textAlign:"center",padding:20}}><span className="spinner"/></div>}
            {!loading && demandes.length===0 && <div className="empty">{Ic.drop}<p>Aucune demande pour l'instant</p></div>}
            {!loading && demandes.slice(0,5).map(d => (
              <div className="card" key={d.id}>
                <div className="ch"><div><div className="ct">{fmtDate(d.date_souhaitee)}</div><div className="cs">{CRENEAUX[d.creneau]}</div></div><SBadge statut={d.statut}/></div>
                <span className="vpill">{Ic.drop} {d.volume_estime} L estimés</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="demandes" && (
        <div className="page">
          <p className="ptitle">Mes demandes</p>
          <p className="psub">{demandes.length} demande{demandes.length>1?"s":""}</p>
          {loading && <div style={{textAlign:"center",padding:20}}><span className="spinner"/></div>}
          {!loading && demandes.length===0 && <div className="empty">{Ic.list}<p>Aucune demande</p></div>}
          {!loading && demandes.map(d => (
            <div className="card" key={d.id}>
              <div className="ch"><div><div className="ct">{fmtDate(d.date_souhaitee)}</div><div className="cs">{CRENEAUX[d.creneau]}</div></div><SBadge statut={d.statut}/></div>
              <span className="vpill" style={{marginBottom:8}}>{Ic.drop} {d.volume_estime} L</span>
              {d.remarque && <div className="ir">{Ic.bell}<span style={{color:G.text}}>{d.remarque}</span></div>}
              <div className="ir">{Ic.clock} Envoyée le {fmtDate(d.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {tab==="profil" && (
        <div className="page">
          <p className="ptitle">Mon profil</p>
          <p className="psub">Informations de l'établissement</p>
          <div className="card">
            <div style={{fontSize:15,fontWeight:600,marginBottom:12}}>{user.nom}</div>
            <div className="ir">{Ic.loc} {user.adresse}</div>
            <div className="ir" style={{marginTop:6}}>{Ic.user} {user.tel}</div>
            <div className="ir" style={{marginTop:6}}>{Ic.bell} {user.email}</div>
            <div className="div"/>
            <span className="badge bo">{user.secteur}</span>
          </div>
          <button className="btn bo2 bfull" onClick={onLogout} style={{marginTop:12}}>{Ic.logout} Se déconnecter</button>
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
            <div className="mtitle">Nouvelle demande de collecte</div>
            <div className="fg"><label className="fl">DATE SOUHAITÉE</label><input className="fi" type="date" value={form.date_souhaitee} min={new Date().toISOString().slice(0,10)} onChange={up("date_souhaitee")} /></div>
            <div className="fg"><label className="fl">CRÉNEAU</label>
              <select className="fsel" value={form.creneau} onChange={up("creneau")}>
                {Object.entries(CRENEAUX).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">VOLUME ESTIMÉ (litres)</label><input className="fi" type="number" placeholder="Ex: 40" value={form.volume_estime} onChange={up("volume_estime")} /></div>
            <div className="fg"><label className="fl">REMARQUE (optionnel)</label><textarea className="fta" placeholder="Accès, type de contenant..." value={form.remarque} onChange={up("remarque")} /></div>
            <div className="ir" style={{marginBottom:16}}>{Ic.loc} {user.adresse}</div>
            <div className="ar">
              <button className="btn bo2" style={{flex:1}} onClick={()=>setModal(false)}>Annuler</button>
              <button className="btn bp" style={{flex:2}} onClick={submit} disabled={submitting}>{submitting?<span className="spinner"/>:"Envoyer la demande"}</button>
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([
        sbGet("demandes", "order=created_at.desc"),
        sbGet("utilisateurs", "role=eq.client&order=created_at.desc"),
      ]);
      setDemandes(d); setClients(u);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 10000); return ()=>clearInterval(t); }, [load]);

  async function upd(id, statut) {
    setUpdating(true);
    try {
      await sbPatch("demandes", id, { statut });
      setDemandes(p => p.map(d => d.id===id ? {...d, statut} : d));
      setSel(prev => prev ? {...prev, statut} : null);
    } finally { setUpdating(false); }
  }

  const enAttente = demandes.filter(d=>d.statut==="en_attente");
  const acceptees  = demandes.filter(d=>d.statut==="acceptée");
  const totalVol   = demandes.filter(d=>d.statut==="collectée").reduce((s,d)=>s+(d.volume_estime||0),0);

  function DCard({ d }) {
    const client = clients.find(u=>u.id===d.client_id);
    return (
      <div className="card" onClick={()=>setSel(d)} style={{cursor:"pointer"}}>
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
          {loading && <div style={{textAlign:"center",padding:10}}><span className="spinner"/></div>}
          <div className="sgrid">
            <div className="sc"><div className="sv" style={{color:G.warn}}>{enAttente.length}</div><div className="sl">En attente</div></div>
            <div className="sc"><div className="sv">{acceptees.length}</div><div className="sl">Planifiées</div></div>
            <div className="sc"><div className="sv">{demandes.filter(d=>d.statut==="collectée").length}</div><div className="sl">Collectées</div></div>
            <div className="sc"><div className="sv">{totalVol}</div><div className="sl">Litres collectés</div></div>
          </div>
          {enAttente.length>0 && <><p className="stitle">⚡ À traiter</p>{enAttente.map(d=><DCard key={d.id} d={d}/>)}</>}
          {acceptees.length>0  && <><p className="stitle">📅 Planifiées</p>{acceptees.map(d=><DCard key={d.id} d={d}/>)}</>}
          {!loading && enAttente.length===0 && acceptees.length===0 && <div className="empty">{Ic.truck}<p>Aucune demande active</p></div>}
        </div>
      )}

      {tab==="demandes" && (
        <div className="page">
          <p className="ptitle">Toutes les demandes</p>
          <p className="psub">{demandes.length} au total</p>
          {loading && <div style={{textAlign:"center",padding:20}}><span className="spinner"/></div>}
          {!loading && demandes.length===0 && <div className="empty">{Ic.list}<p>Aucune demande</p></div>}
          {!loading && [...enAttente,...acceptees,...demandes.filter(d=>d.statut==="collectée"||d.statut==="refusée")].map(d=><DCard key={d.id} d={d}/>)}
        </div>
      )}

      {tab==="clients" && (
        <div className="page">
          <p className="ptitle">Clients</p>
          <p className="psub">{clients.length} établissements inscrits</p>
          {loading && <div style={{textAlign:"center",padding:20}}><span className="spinner"/></div>}
          {!loading && clients.length===0 && <div className="empty">{Ic.user}<p>Aucun client inscrit</p></div>}
          {!loading && clients.map(c => {
            const nb = demandes.filter(d=>d.client_id===c.id&&d.statut==="collectée").length;
            return (
              <div className="card" key={c.id}>
                <div className="ch"><div><div className="ct">{c.nom}</div><div className="cs">{c.secteur}</div></div>
                  <span className="badge bo">{nb} collecte{nb>1?"s":""}</span></div>
                <div className="ir">{Ic.loc} {c.adresse}</div>
                <div className="ir" style={{marginTop:4}}>{Ic.user} {c.tel}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bnav">
        <button className={`ni ${tab==="home"?"active":""}`} onClick={()=>setTab("home")} style={{position:"relative"}}>
          {Ic.home}{enAttente.length>0&&<span className="nbadge">{enAttente.length}</span>}<span>Dashboard</span>
        </button>
        <button className={`ni ${tab==="demandes"?"active":""}`} onClick={()=>setTab("demandes")}>{Ic.list}<span>Demandes</span></button>
        <button className={`ni ${tab==="clients"?"active":""}`} onClick={()=>setTab("clients")}>{Ic.user}<span>Clients</span></button>
      </div>

      {sel && (
        <div className="moverlay" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal">
            <div className="mhandle"/>
            <div className="mtitle">Demande de collecte</div>
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>{sel.client_nom}</div>
              <SBadge statut={sel.statut}/>
              <div className="div"/>
              <div className="ir">{Ic.loc} {sel.adresse}</div>
              <div className="ir" style={{marginTop:8}}>{Ic.clock} {fmtDate(sel.date_souhaitee)} · {CRENEAUX[sel.creneau]}</div>
              <div className="ir" style={{marginTop:8}}>{Ic.drop} <span className="vpill">{sel.volume_estime} litres estimés</span></div>
              {sel.remarque && <div className="ir" style={{marginTop:8,alignItems:"flex-start"}}>{Ic.bell} <span>{sel.remarque}</span></div>}
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

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [me, setMe] = useState(null);
  if (!me) return <Login onLogin={setMe} />;
  if (me.role==="collecteur") return <CollecteurApp user={me} onLogout={()=>setMe(null)} />;
  return <ClientApp user={me} onLogout={()=>setMe(null)} />;
}
