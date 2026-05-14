import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE BAĞLANTISI ───────────────────────────────────────
// Supabase kurulumundan sonra buraya kendi bilgilerinizi girin
const SUPABASE_URL = "https://pfguxmffclwpjtunablp.supabase.co";
const SUPABASE_KEY = "sb_publishable_Oi6H33RJ-n-ezrn0tm5vRQ_pYgAM7H8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── RENK PALETİ ───────────────────────────────────────────────
const C = {
  bg:"#0c0b09", s1:"#161410", s2:"#1f1c16", s3:"#2a261d",
  border:"#332e22", border2:"#44402f",
  gold:"#d4a843", gold2:"#f0cc76", gold3:"#7a5e1e",
  green:"#52b788", green2:"#1a4731",
  red:"#e07070", red2:"#4a1e1e",
  blue:"#6aaed6", blue2:"#1a3347",
  amber:"#e09b4a", amber2:"#4a2e10",
  purple:"#a78bfa", purple2:"#2d1f5e",
  text:"#ede8dd", text2:"#9e9480", text3:"#5c5545",
  g1:"#52b788", g2:"#6aaed6", g3:"#e09b4a", gh:"#e07070",
};
const GC = { "Grade 1":C.g1, "Grade 2":C.g2, "Grade 3":C.g3, "Hurda":C.gh };
const GRADES = ["Grade 1","Grade 2","Grade 3","Hurda"];

// ── YARDIMCI FONKSİYONLAR ────────────────────────────────────
const fmt = (n,d=2) => isNaN(n)||n==null?"—": (+n).toLocaleString("tr-TR",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtK = n => fmt(n,1)+" kg";
const fmtTL = n => "₺"+fmt(n,2);
const today = () => new Date().toISOString().split("T")[0];
const thisMonth = () => new Date().toISOString().slice(0,7);
const daysDiff = d => Math.floor((new Date()-new Date(d))/86400000);

// ── CSS GLOBAL ────────────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;overflow:hidden;background:${C.bg};color:${C.text};font-family:'Sora',sans-serif;font-size:14px}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:${C.bg}}
::-webkit-scrollbar-thumb{background:${C.border2};border-radius:2px}
input,select,textarea{font-family:'Sora',sans-serif}
@media print{body>*:not(#print-area){display:none!important}#print-area{display:block!important}}
`;

// ── BASE COMPONENTS ───────────────────────────────────────────
const s = {
  // Layout
  app: { display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" },
  main: { flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch",
          paddingBottom:"calc(68px + env(safe-area-inset-bottom,0px))" },
  page: { padding:16 },

  // Topbar
  topbar: { background:C.s1, borderBottom:`1px solid ${C.border}`, padding:"12px 16px",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, zIndex:50 },
  brand: { display:"flex", alignItems:"center", gap:10 },
  logo: { width:34, height:34, background:`linear-gradient(135deg,${C.gold},${C.gold3})`,
          borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },

  // Nav
  bnav: { position:"fixed", bottom:0, left:0, right:0,
          height:"calc(64px + env(safe-area-inset-bottom,0px))",
          paddingBottom:"env(safe-area-inset-bottom,0px)",
          background:C.s1, borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100 },
  ni: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:3, cursor:"pointer", color:C.text3, padding:"8px 4px", transition:"color 0.2s" },

  // Cards
  card: { background:C.s1, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:12 },
  cardTitle: { fontSize:13, fontWeight:600, color:C.gold2, marginBottom:14, display:"flex", alignItems:"center", gap:8 },

  // Form
  field: { display:"flex", flexDirection:"column", gap:5, marginBottom:12 },
  label: { fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:"0.7px",
           fontFamily:"'JetBrains Mono',monospace" },
  input: { background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px",
           color:C.text, fontSize:14, outline:"none", width:"100%", WebkitAppearance:"none" },
  select: { background:C.s2, border:`1px solid ${C.border}`, borderRadius:8, padding:"11px 13px",
            color:C.text, fontSize:14, outline:"none", width:"100%", WebkitAppearance:"none" },

  // Buttons
  btnGold: { background:C.gold, color:"#0c0b09", border:"none", borderRadius:8, padding:"12px 18px",
             fontSize:13, fontWeight:600, cursor:"pointer", width:"100%", display:"flex",
             alignItems:"center", justifyContent:"center", gap:7 },
  btnOutline: { background:"transparent", border:`1px solid ${C.border2}`, borderRadius:8,
                padding:"10px 16px", color:C.text2, fontSize:13, fontWeight:600, cursor:"pointer" },
  btnGreen: { background:C.green2, border:`1px solid rgba(82,183,136,.2)`, borderRadius:8,
              padding:"10px 16px", color:C.green, fontSize:13, fontWeight:600, cursor:"pointer" },
  btnBlue: { background:C.blue2, border:`1px solid rgba(106,174,214,.2)`, borderRadius:8,
             padding:"10px 16px", color:C.blue, fontSize:13, fontWeight:600, cursor:"pointer" },
  btnRed: { background:C.red2, border:`1px solid rgba(224,112,112,.2)`, borderRadius:8,
            padding:"8px 12px", color:C.red, fontSize:11, fontWeight:600, cursor:"pointer" },
  btnPurple: { background:C.purple2, border:`1px solid rgba(167,139,250,.2)`, borderRadius:8,
               padding:"12px 18px", color:C.purple, fontSize:13, fontWeight:600, cursor:"pointer", width:"100%" },

  // Tags
  lotTag: { display:"inline-block", padding:"3px 8px", background:"rgba(212,168,67,.12)",
            color:C.gold, border:"1px solid rgba(212,168,67,.25)", borderRadius:5,
            fontFamily:"'JetBrains Mono',monospace", fontSize:10 },
  mono: { fontFamily:"'JetBrains Mono',monospace" },

  // Table
  tscroll: { overflowX:"auto", WebkitOverflowScrolling:"touch" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:500 },
  th: { background:C.s2, padding:"8px 11px", textAlign:"left", fontSize:10, color:C.text3,
        textTransform:"uppercase", letterSpacing:"0.7px", fontFamily:"'JetBrains Mono',monospace",
        borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" },
  td: { padding:"10px 11px", borderBottom:`1px solid ${C.border}`, fontSize:12, verticalAlign:"middle" },

  // KPI
  kpiRow: { display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:12 },
  kpi: { flexShrink:0, background:C.s2, border:`1px solid ${C.border}`, borderRadius:8,
         padding:"12px 14px", minWidth:110 },

  // Alert
  alertOk: { background:C.green2, border:`1px solid rgba(82,183,136,.3)`, borderRadius:8,
              padding:"11px 12px", fontSize:12, color:C.green, display:"flex", gap:10, marginBottom:8 },
  alertWarn: { background:C.amber2, border:`1px solid rgba(224,155,74,.3)`, borderRadius:8,
               padding:"11px 12px", fontSize:12, color:C.amber, display:"flex", gap:10, marginBottom:8 },
  alertErr: { background:C.red2, border:`1px solid rgba(224,112,112,.3)`, borderRadius:8,
              padding:"11px 12px", fontSize:12, color:C.red, display:"flex", gap:10, marginBottom:8 },
  alertInfo: { background:C.purple2, border:`1px solid rgba(167,139,250,.3)`, borderRadius:8,
               padding:"11px 12px", fontSize:12, color:C.purple, display:"flex", gap:10, marginBottom:8 },
};

// Grade pill
function GradePill({ grade }) {
  const colors = { "Grade 1":[C.g1,"rgba(82,183,136,.15)","rgba(82,183,136,.3)"],
                   "Grade 2":[C.g2,"rgba(106,174,214,.15)","rgba(106,174,214,.3)"],
                   "Grade 3":[C.g3,"rgba(224,155,74,.15)","rgba(224,155,74,.3)"],
                   "Hurda":  [C.gh,"rgba(224,112,112,.15)","rgba(224,112,112,.3)"] };
  const [fg,bg,br] = colors[grade]||[C.text3,C.s2,C.border];
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:20,
    fontSize:11,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",
    color:fg,background:bg,border:`1px solid ${br}`}}>{grade}</span>;
}

// Status badge
function StatusBadge({ durum }) {
  const map = { bekliyor:[C.amber,"rgba(224,155,74,.15)","rgba(224,155,74,.3)","⏳ Bekliyor"],
                tamam:   [C.green,"rgba(82,183,136,.15)","rgba(82,183,136,.3)","✓ Tamam"],
                uretimde:[C.blue,"rgba(106,174,214,.15)","rgba(106,174,214,.3)","⚙ Üretimde"],
                tamamlandi:[C.green,"rgba(82,183,136,.15)","rgba(82,183,136,.3)","✓ Tamamlandı"],
                iptal:   [C.red,"rgba(224,112,112,.15)","rgba(224,112,112,.3)","✕ İptal"] };
  const [fg,bg,br,label] = map[durum]||[C.text3,C.s2,C.border,durum];
  return <span style={{display:"inline-block",padding:"3px 9px",borderRadius:20,fontSize:10,
    fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:fg,background:bg,border:`1px solid ${br}`}}>{label}</span>;
}

// Field wrapper
function Field({ label, children, hint }) {
  return <div style={s.field}>
    {label && <label style={s.label}>{label}</label>}
    {children}
    {hint && <span style={{fontSize:10,color:C.text3}}>{hint}</span>}
  </div>;
}

// Toast
function Toast({ msg, color }) {
  return <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",
    background:C.s2,border:`1px solid ${C.border2}`,borderRadius:20,padding:"10px 18px",
    fontSize:13,fontWeight:500,color:color||C.green,zIndex:300,whiteSpace:"nowrap",
    animation:"fadeInUp 0.25s ease"}}>{msg}</div>;
}

// ═══════════════════════════════════════════════════════════════
// ANA UYGULAMA
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dash");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Veri state'leri
  const [ciftciler,     setCiftciler]     = useState([]);
  const [girisler,      setGirisler]      = useState([]);
  const [ayristirmalar, setAyristirmalar] = useState([]);
  const [cikislar,      setCikislar]      = useState([]);
  const [urunTanimlari, setUrunTanimlari] = useState([]);
  const [uretimEmirleri,setUretimEmirleri]= useState([]);
  const [uretimKayitlari,setUretimKayitlari]=useState([]);
  const [nihalStok,       setNihaiStok]       = useState([]);
  const [giderler,        setGiderler]        = useState([]);
  const [hamStokOzet,     setHamStokOzet]     = useState([]);
  const [siparisler,      setSiparisler]      = useState([]);
  const [satisTem,        setSatisTem]        = useState([]);

  const showToast = (msg, color=C.green) => {
    setToast({msg,color});
    setTimeout(()=>setToast(null), 2800);
  };

  // Tüm veriyi yükle
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c,g,a,ck,ut,ue,uk,ns,gd,hs,sp,st] = await Promise.all([
        supabase.from("ciftciler").select("*").eq("aktif",true).order("ad"),
        supabase.from("girisler").select("*").order("tarih",{ascending:false}).order("created_at",{ascending:false}),
        supabase.from("ayristirmalar").select("*").order("tarih",{ascending:false}),
        supabase.from("cikislar").select("*").order("tarih",{ascending:false}),
        supabase.from("urun_tanimlari").select("*").eq("aktif",true).order("grade").order("paket_gr"),
        supabase.from("uretim_emirleri").select("*").order("created_at",{ascending:false}),
        supabase.from("uretim_kayitlari").select("*").order("uretim_tarihi",{ascending:false}),
        supabase.from("nihai_stok").select("*").order("created_at",{ascending:false}),
        supabase.from("giderler").select("*").order("ay",{ascending:false}),
        supabase.from("ham_stok_ozet").select("*"),
        supabase.from("siparisler").select("*").order("created_at",{ascending:false}),
        supabase.from("satis_temsilcileri").select("*").eq("aktif",true).order("ad"),
      ]);
      setCiftciler(c.data||[]);
      setGirisler(g.data||[]);
      setAyristirmalar(a.data||[]);
      setCikislar(ck.data||[]);
      setUrunTanimlari(ut.data||[]);
      setUretimEmirleri(ue.data||[]);
      setUretimKayitlari(uk.data||[]);
      setNihaiStok(ns.data||[]);
      setGiderler(gd.data||[]);
      setHamStokOzet(hs.data||[]);
      setSiparisler(sp.data||[]);
      setSatisTem(st.data||[]);
    } catch(e) { showToast("Bağlantı hatası: "+e.message, C.red); }
    setLoading(false);
  }, []);

  useEffect(()=>{ loadAll(); }, [loadAll]);

  // Realtime aboneliği
  useEffect(()=>{
    const ch = supabase.channel("changes")
      .on("postgres_changes",{event:"*",schema:"public"},()=>loadAll())
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[loadAll]);

  // Sonraki sevk no
  const nextSevkNo = () => {
    const max = girisler.reduce((a,g)=>{
      const n = parseInt(g.sevk_no?.replace("SVK-",""))||0;
      return Math.max(a,n);
    },0);
    return "SVK-"+String(max+1).padStart(4,"0");
  };

  const nextEmiNo = () => {
    const max = uretimEmirleri.reduce((a,e)=>{
      const n = parseInt(e.emir_no?.replace("URE-",""))||0;
      return Math.max(a,n);
    },0);
    return "URE-"+String(max+1).padStart(4,"0");
  };

  const nextSiparisNo = () => {
    const max = siparisler.reduce((a,s)=>{
      const n = parseInt(s.siparis_no?.replace("SIP-",""))||0;
      return Math.max(a,n);
    },0);
    return "SIP-"+String(max+1).padStart(4,"0");
  };

  // Ham stok hesabı
  const hamStok = (grade) => {
    const row = hamStokOzet.find(r=>r.grade===grade);
    return row ? (row.net_stok||0) : 0;
  };

  // Nihai ürün stok
  const nihaiStokAdet = (urunAd) => {
    const girisAdet = nihalStok.filter(r=>r.urun_ad===urunAd&&r.hareket_tipi==="giris").reduce((s,r)=>s+r.adet,0);
    const cikisAdet = nihalStok.filter(r=>r.urun_ad===urunAd&&r.hareket_tipi==="cikis").reduce((s,r)=>s+r.adet,0);
    return girisAdet - cikisAdet;
  };

  const props = { ciftciler, girisler, ayristirmalar, cikislar, urunTanimlari,
                  uretimEmirleri, uretimKayitlari, nihalStok, giderler, hamStokOzet,
                  siparisler, satisTem,
                  hamStok, nihaiStokAdet, nextSevkNo, nextEmiNo, nextSiparisNo,
                  showToast, loadAll, supabase, setPage, loading };

  const navItems = [
    {id:"dash",   icon:"📊", label:"Özet"},
    {id:"giris",  icon:"🚪", label:"Giriş"},
    {id:"ayrist", icon:"⚖️", label:"Ayırt"},
    {id:"uretim", icon:"🏭", label:"Üretim"},
    {id:"stok",    icon:"📦", label:"Stok"},
    {id:"siparis", icon:"🛒", label:"Sipariş"},
    {id:"rapor",   icon:"📈", label:"Rapor"},
  ];

  return <>
    <style>{globalCSS}</style>
    <div style={s.app}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.brand}>
          <div style={s.logo}>🌿</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:C.gold2}}>İncir Fabrikası</div>
            <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace"}}>
              {loading?"Yükleniyor...":new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",weekday:"short"})}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:loading?C.amber:C.green,
            boxShadow:`0 0 6px ${loading?C.amber:C.green}`}}/>
          <span style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace"}}>
            {loading?"Senkronize":"Bağlı"}
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main} id="mainScroll">
        <div style={s.page}>
          {page==="dash"   && <DashPage   {...props}/>}
          {page==="giris"  && <GirisPage  {...props}/>}
          {page==="ayrist" && <AyristPage {...props}/>}
          {page==="uretim" && <UretimPage {...props}/>}
          {page==="stok"    && <StokPage    {...props}/>}
          {page==="siparis" && <SiparisPage {...props}/>}
          {page==="rapor"   && <RaporPage   {...props}/>}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav style={s.bnav}>
        {navItems.map(n=>(
          <div key={n.id} style={{...s.ni,color:page===n.id?C.gold:C.text3}}
               onClick={()=>setPage(n.id)}>
            <div style={{fontSize:20,lineHeight:1}}>{n.icon}</div>
            <div style={{fontSize:10,fontWeight:500}}>{n.label}</div>
          </div>
        ))}
      </nav>

      {toast && <Toast msg={toast.msg} color={toast.color}/>}
    </div>
  </>;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashPage({ hamStok, hamStokOzet, uretimEmirleri, nihalStok, nihaiStokAdet,
                    girisler, ayristirmalar, giderler, urunTanimlari, setPage }) {
  const topHamStok = GRADES.reduce((a,g)=>a+hamStok(g),0);
  const bekleyenAyrist = girisler.filter(g=>g.durum==="bekliyor").length;
  const bekleyenUretim = uretimEmirleri.filter(e=>e.durum==="bekliyor").length;
  const ayGider = giderler.filter(g=>g.ay===thisMonth()).reduce((a,x)=>a+x.tutar,0);

  return <>
    {/* KPI Satırı */}
    <div style={s.kpiRow}>
      {[
        {l:"Ham Stok", v:fmt(topHamStok,1), u:"kg"},
        {l:"Ayırt Bekleyen", v:bekleyenAyrist, u:"sevk"},
        {l:"Üretim Bekleyen", v:bekleyenUretim, u:"emir"},
        {l:"Bu Ay Gider", v:fmtTL(ayGider), u:""},
      ].map(k=>(
        <div key={k.l} style={s.kpi}>
          <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{k.l}</div>
          <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>{k.v}</div>
          <div style={{fontSize:10,color:C.text3,marginTop:2}}>{k.u}</div>
        </div>
      ))}
    </div>

    {/* Uyarılar */}
    {bekleyenAyrist>0 && <div style={s.alertInfo}>
      <span>⚖️</span>
      <div><strong>{bekleyenAyrist} sevkiyat ayrıştırma bekliyor</strong>
        <div style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setPage("ayrist")}>Ayrıştırmaya git →</div>
      </div>
    </div>}
    {bekleyenUretim>0 && <div style={s.alertWarn}>
      <span>🏭</span>
      <div><strong>{bekleyenUretim} üretim emri onay bekliyor</strong>
        <div style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setPage("uretim")}>Üretime git →</div>
      </div>
    </div>}

    {/* Ham Stok Grade Barları */}
    <div style={{...s.card}}>
      <div style={s.cardTitle}>📦 Ham Stok (Ayrıştırılmış)</div>
      {GRADES.map(g=>{
        const net = hamStok(g);
        const max = Math.max(...GRADES.map(x=>hamStok(x)),1);
        return <div key={g} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,fontWeight:600,color:GC[g]}}>{g}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.text2}}>{fmt(net,1)} kg</span>
          </div>
          <div style={{height:7,background:C.s3,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.max(0,net/max*100)}%`,background:GC[g],
              borderRadius:4,transition:"width 0.6s"}}/>
          </div>
        </div>;
      })}
    </div>

    {/* Nihai Ürün Özeti */}
    <div style={s.card}>
      <div style={s.cardTitle}>📦 Nihai Ürün Stoku</div>
      {urunTanimlari.length===0
        ? <div style={{fontSize:12,color:C.text3,textAlign:"center",padding:16}}>Henüz üretim yok</div>
        : <div style={{display:"grid",gap:6}}>
            {urunTanimlari.map(u=>{
              const adet = nihaiStokAdet(u.ad);
              if(adet<=0 && nihaiStokAdet(u.ad)===0) return null;
              return <div key={u.id} style={{display:"flex",justifyContent:"space-between",
                padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                <div>
                  <span style={{fontWeight:600,color:GC[u.grade]}}>{u.ad}</span>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,
                  color:adet>0?C.gold2:C.red}}>{adet} adet</span>
              </div>;
            }).filter(Boolean)}
          </div>
      }
    </div>
  </>;
}

// ═══════════════════════════════════════════════════════════════
// ANA GİRİŞ
// ═══════════════════════════════════════════════════════════════
function GirisPage({ ciftciler, girisler, nextSevkNo, showToast, loadAll, supabase }) {
  const [form, setForm] = useState({ ciftci_ad:"", tarih:today(), plaka:"", kg:"", fiyat:"", notlar:"" });
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toplam = (parseFloat(form.kg)||0) * (parseFloat(form.fiyat)||0);

  const kaydet = async () => {
    if(!form.ciftci_ad||!form.tarih||!form.kg){ showToast("Çiftçi, tarih ve KG zorunlu","#e07070"); return; }
    setSaving(true);
    const sevk_no = nextSevkNo();
    const ciftci = ciftciler.find(c=>c.ad===form.ciftci_ad);

    // Çiftçi yoksa ekle
    if(!ciftci && form.ciftci_ad){
      await supabase.from("ciftciler").insert({ad:form.ciftci_ad, plaka:form.plaka});
    }

    const { error } = await supabase.from("girisler").insert({
      sevk_no, ciftci_id: ciftci?.id||null,
      ciftci_ad: form.ciftci_ad, tarih: form.tarih,
      plaka: form.plaka||null,
      kg: parseFloat(form.kg), fiyat: parseFloat(form.fiyat)||0,
      toplam, notlar: form.notlar||null, durum:"bekliyor"
    });

    if(error){ showToast("Hata: "+error.message,"#e07070"); }
    else {
      showToast(`✓ ${sevk_no} kaydedildi`);
      setForm({ciftci_ad:"",tarih:today(),plaka:"",kg:"",fiyat:"",notlar:""});
      loadAll();
    }
    setSaving(false);
  };

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:16}}>🚪 Ana Giriş</div>

    <div style={s.card}>
      <div style={s.cardTitle}>➕ Yeni Sevkiyat</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Çiftçi">
          <input style={s.input} value={form.ciftci_ad} list="ciftciList"
            onChange={e=>set("ciftci_ad",e.target.value)} placeholder="Ad Soyad..."/>
          <datalist id="ciftciList">{ciftciler.map(c=><option key={c.id} value={c.ad}/>)}</datalist>
        </Field>
        <Field label="Tarih">
          <input style={s.input} type="date" value={form.tarih} onChange={e=>set("tarih",e.target.value)}/>
        </Field>
        <Field label="Plaka">
          <input style={s.input} value={form.plaka} onChange={e=>set("plaka",e.target.value.toUpperCase())} placeholder="34 AB 1234"/>
        </Field>
        <Field label="Toplam KG">
          <input style={s.input} type="number" value={form.kg} onChange={e=>set("kg",e.target.value)} placeholder="0.0" inputMode="decimal"/>
        </Field>
        <Field label="₺/KG">
          <input style={s.input} type="number" value={form.fiyat} onChange={e=>set("fiyat",e.target.value)} placeholder="0.00" inputMode="decimal"/>
        </Field>
        <Field label="Toplam ₺">
          <input style={{...s.input,color:C.text2}} value={toplam>0?fmtTL(toplam):""} readOnly placeholder="Otomatik"/>
        </Field>
      </div>
      <Field label="Not"><input style={s.input} value={form.notlar} onChange={e=>set("notlar",e.target.value)} placeholder="Opsiyonel..."/></Field>
      <button style={s.btnGold} onClick={kaydet} disabled={saving}>
        {saving?"Kaydediliyor...":"✓ Kaydet & Fiş Yaz"}
      </button>
    </div>

    <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
      textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Kayıtlar</div>
    <div style={s.card}>
      <div style={s.tscroll}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Sevk No</th><th style={s.th}>Çiftçi</th>
            <th style={s.th}>Tarih</th><th style={s.th}>KG</th>
            <th style={s.th}>Tutar</th><th style={s.th}>Durum</th>
          </tr></thead>
          <tbody>
            {girisler.length===0
              ? <tr><td style={{...s.td,textAlign:"center",color:C.text3}} colSpan={6}>Kayıt yok</td></tr>
              : girisler.map(g=><tr key={g.id}>
                  <td style={s.td}><span style={s.lotTag}>{g.sevk_no}</span></td>
                  <td style={{...s.td,fontSize:12}}>{g.ciftci_ad}</td>
                  <td style={{...s.td,...s.mono,fontSize:11}}>{g.tarih}</td>
                  <td style={{...s.td,...s.mono}}>{fmt(g.kg,1)}</td>
                  <td style={{...s.td,...s.mono,fontSize:11}}>{fmtTL(g.toplam)}</td>
                  <td style={s.td}><StatusBadge durum={g.durum}/></td>
                </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  </>;
}

// ═══════════════════════════════════════════════════════════════
// KALİTE AYRIŞTIRMA
// ═══════════════════════════════════════════════════════════════
function AyristPage({ girisler, ayristirmalar, showToast, loadAll, supabase }) {
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({g1:"",g2:"",g3:"",gh:"",fire:"",fire_not:""});

  const bekleyenler = girisler.filter(g=>g.durum==="bekliyor");
  const tamamlananlar = ayristirmalar.slice(0,20);

  const activeGiris = girisler.find(g=>g.id===activeId);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const g1=parseFloat(form.g1)||0, g2=parseFloat(form.g2)||0;
  const g3=parseFloat(form.g3)||0, gh=parseFloat(form.gh)||0;
  const fire=parseFloat(form.fire)||0;
  const toplam = g1+g2+g3+gh+fire;
  const hedef = activeGiris?.kg||0;
  const fark = hedef-toplam;
  const dengeOk = Math.abs(fark)<0.01;

  const kaydet = async () => {
    if(!activeGiris) return;
    if(!dengeOk){ showToast(`Toplam eşleşmiyor! Fark: ${fmt(fark,2)} kg`,"#e07070"); return; }

    const { error: e1 } = await supabase.from("ayristirmalar").insert({
      giris_id: activeGiris.id, sevk_no: activeGiris.sevk_no,
      ciftci_ad: activeGiris.ciftci_ad, tarih: activeGiris.tarih,
      toplam_kg: activeGiris.kg, g1, g2, g3, gh, fire,
      fire_not: form.fire_not||null
    });
    if(e1){ showToast("Hata: "+e1.message,"#e07070"); return; }

    const { error: e2 } = await supabase.from("girisler").update({durum:"tamam"}).eq("id",activeGiris.id);
    if(e2){ showToast("Hata: "+e2.message,"#e07070"); return; }

    showToast(`✓ ${activeGiris.sevk_no} ayrıştırıldı`);
    setActiveId(null);
    setForm({g1:"",g2:"",g3:"",gh:"",fire:"",fire_not:""});
    loadAll();
  };

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:16}}>⚖️ Kalite Ayrıştırma</div>

    {/* Bekleyenler */}
    <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
      textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>
      Ayrıştırma Bekleyenler ({bekleyenler.length})
    </div>
    {bekleyenler.length===0
      ? <div style={{...s.alertOk,marginBottom:12}}><span>✅</span><div>Tüm sevkiyatlar ayrıştırıldı!</div></div>
      : bekleyenler.map(g=>(
          <div key={g.id} style={{...s.card, borderColor: activeId===g.id?C.gold3:C.border,
            cursor:"pointer"}} onClick={()=>{ setActiveId(g.id); setForm({g1:"",g2:"",g3:"",gh:"",fire:"",fire_not:""}); }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={s.lotTag}>{g.sevk_no}</span>
                <span style={{fontWeight:700,fontSize:13}}>{g.ciftci_ad}</span>
              </div>
              <StatusBadge durum="bekliyor"/>
            </div>
            <div style={{display:"flex",gap:16,fontSize:12,color:C.text2}}>
              <span>📅 {g.tarih}</span>
              <span style={s.mono}>⚖️ {fmt(g.kg,1)} kg</span>
              {g.plaka&&<span>🚛 {g.plaka}</span>}
            </div>
            {activeId===g.id&&<div style={{marginTop:8,fontSize:11,color:C.gold}}>▼ Aşağıda formu doldurun</div>}
          </div>
        ))
    }

    {/* Ayrıştırma Formu */}
    {activeGiris && <div style={{...s.card,borderColor:C.gold3}}>
      <div style={s.cardTitle}>⚖️ {activeGiris.sevk_no} — {activeGiris.ciftci_ad} — {fmt(activeGiris.kg,1)} kg</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[["Grade 1",C.g1,"g1"],["Grade 2",C.g2,"g2"],["Grade 3",C.g3,"g3"],["Hurda",C.gh,"gh"]].map(([lbl,col,key])=>(
          <div key={key} style={{borderRadius:8,padding:12,border:`2px solid ${col}30`,background:`${col}08`}}>
            <label style={{fontSize:10,fontWeight:700,color:col,display:"block",marginBottom:6}}>{lbl}</label>
            <input style={{...s.input,textAlign:"center",fontSize:18,fontWeight:700,color:col,
              fontFamily:"'JetBrains Mono',monospace"}} type="number" placeholder="0.0"
              value={form[key]} onChange={e=>set(key,e.target.value)} inputMode="decimal" step="0.1"/>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:8,marginBottom:12}}>
        <Field label="🔥 Fire (kg)">
          <input style={s.input} type="number" value={form.fire} onChange={e=>set("fire",e.target.value)} placeholder="0" inputMode="decimal"/>
        </Field>
        <Field label="Fire Notu">
          <input style={s.input} value={form.fire_not} onChange={e=>set("fire_not",e.target.value)} placeholder="nem, çürük..."/>
        </Field>
      </div>

      {/* Denge Checker */}
      <div style={{borderRadius:8,padding:"10px 14px",marginBottom:14,display:"flex",
        justifyContent:"space-between",alignItems:"center",fontSize:13,fontWeight:600,
        background: dengeOk?C.green2:fark>0?C.amber2:C.red2,
        border:`1px solid ${dengeOk?"rgba(82,183,136,.3)":fark>0?"rgba(224,155,74,.3)":"rgba(224,112,112,.3)"}`,
        color: dengeOk?C.green:fark>0?C.amber:C.red}}>
        <span>Toplam</span>
        <span style={s.mono}>{fmt(toplam,1)} / {fmt(hedef,1)} kg
          {!dengeOk&&<span style={{marginLeft:8}}>({fark>0?"+":""}{fmt(fark,1)} kg)</span>}
        </span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button style={s.btnOutline} onClick={()=>setActiveId(null)}>İptal</button>
        <button style={{...s.btnGold,opacity:dengeOk?1:0.5}} onClick={kaydet} disabled={!dengeOk}>✓ Kaydet</button>
      </div>
    </div>}

    {/* Tamamlananlar */}
    <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
      textTransform:"uppercase",letterSpacing:"0.7px",margin:"16px 0 8px"}}>
      Tamamlananlar (Son 20)
    </div>
    <div style={s.card}>
      <div style={s.tscroll}>
        <table style={{...s.table,minWidth:700}}>
          <thead><tr>
            <th style={s.th}>Sevk No</th><th style={s.th}>Çiftçi</th>
            <th style={s.th}>Giriş KG</th><th style={s.th}>G1</th>
            <th style={s.th}>G2</th><th style={s.th}>G3</th>
            <th style={s.th}>Hurda</th><th style={s.th}>Fire</th><th style={s.th}>✓</th>
          </tr></thead>
          <tbody>
            {tamamlananlar.map(a=>{
              const ayristTop=(a.g1||0)+(a.g2||0)+(a.g3||0)+(a.gh||0);
              const ok=Math.abs(a.toplam_kg-ayristTop-(a.fire||0))<0.01;
              return <tr key={a.id}>
                <td style={s.td}><span style={s.lotTag}>{a.sevk_no}</span></td>
                <td style={{...s.td,fontSize:11}}>{a.ciftci_ad}</td>
                <td style={{...s.td,...s.mono}}>{fmt(a.toplam_kg,1)}</td>
                <td style={{...s.td,...s.mono,color:C.g1}}>{fmt(a.g1,1)}</td>
                <td style={{...s.td,...s.mono,color:C.g2}}>{fmt(a.g2,1)}</td>
                <td style={{...s.td,...s.mono,color:C.g3}}>{fmt(a.g3,1)}</td>
                <td style={{...s.td,...s.mono,color:C.gh}}>{fmt(a.gh,1)}</td>
                <td style={{...s.td,...s.mono,color:a.fire>0?C.red:C.text3}}>{a.fire>0?fmt(a.fire,1):"—"}</td>
                <td style={s.td}><span style={{color:ok?C.green:C.red,fontSize:14}}>{ok?"✓":"⚠"}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}

// ═══════════════════════════════════════════════════════════════
// ÜRETİM SAYFASI
// ═══════════════════════════════════════════════════════════════
function UretimPage({ urunTanimlari, uretimEmirleri, uretimKayitlari, nihalStok,
                      hamStok, nihaiStokAdet, nextEmiNo, showToast, loadAll, supabase }) {
  const [tab, setTab] = useState("emirler"); // emirler | kayitlar | urunler
  const [emirForm, setEmirForm] = useState({
    urun_tanim_id:"", hammadde_kg:"", notlar:"", talep_tarihi:today()
  });
  const [kayitForm, setKayitForm] = useState({
    uretim_emri_id:"", kullanilan_kg:"", uretilen_adet:"", fire_kg:"0",
    uretim_tarihi:today(), notlar:""
  });
  const [saving, setSaving] = useState(false);

  // Seçili ürün tanımı
  const seciliUrun = urunTanimlari.find(u=>u.id===emirForm.urun_tanim_id);
  const hedefAdet = seciliUrun && emirForm.hammadde_kg
    ? Math.floor((parseFloat(emirForm.hammadde_kg)||0)*1000/(seciliUrun.paket_gr||1))
    : 0;

  // Seçili üretim emri (kayıt için)
  const seciliEmir = uretimEmirleri.find(e=>e.id===kayitForm.uretim_emri_id);
  const uretimNet = kayitForm.uretilen_adet && seciliEmir
    ? (parseInt(kayitForm.uretilen_adet)||0)*seciliEmir.paket_gr/1000
    : 0;

  const emirKaydet = async () => {
    if(!emirForm.urun_tanim_id||!emirForm.hammadde_kg){
      showToast("Ürün ve hammadde zorunlu","#e07070"); return;
    }
    const urun = urunTanimlari.find(u=>u.id===emirForm.urun_tanim_id);
    const stok = hamStok(urun?.grade||"");
    if((parseFloat(emirForm.hammadde_kg)||0)>stok){
      showToast(`Yetersiz stok! ${urun?.grade}: ${fmt(stok,1)} kg mevcut`,"#e07070"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("uretim_emirleri").insert({
      emir_no: nextEmiNo(),
      urun_tanim_id: emirForm.urun_tanim_id,
      urun_ad: urun?.ad||"",
      grade: urun?.grade||"",
      paket_gr: urun?.paket_gr||0,
      hammadde_kg: parseFloat(emirForm.hammadde_kg),
      hedef_adet: hedefAdet,
      durum:"bekliyor",
      talep_tarihi: emirForm.talep_tarihi,
      notlar: emirForm.notlar||null
    });
    if(error){ showToast("Hata: "+error.message,"#e07070"); }
    else {
      showToast("✓ Üretim emri oluşturuldu");
      setEmirForm({urun_tanim_id:"",hammadde_kg:"",notlar:"",talep_tarihi:today()});
      loadAll();
    }
    setSaving(false);
  };

  const uretimKaydet = async () => {
    if(!kayitForm.uretim_emri_id||!kayitForm.kullanilan_kg||!kayitForm.uretilen_adet){
      showToast("Tüm alanlar zorunlu","#e07070"); return;
    }
    const emir = uretimEmirleri.find(e=>e.id===kayitForm.uretim_emri_id);
    if(!emir){ showToast("Emir bulunamadı","#e07070"); return; }

    setSaving(true);
    const kulKg = parseFloat(kayitForm.kullanilan_kg);
    const uretAdet = parseInt(kayitForm.uretilen_adet);
    const fireKg = parseFloat(kayitForm.fire_kg)||0;
    const uretKg = uretAdet*emir.paket_gr/1000;
    const partiNo = emir.emir_no+"-P"+(uretimKayitlari.filter(k=>k.uretim_emri_id===emir.id).length+1);

    // 1. Üretim kaydı oluştur
    const { data: ukData, error: e1 } = await supabase.from("uretim_kayitlari").insert({
      uretim_emri_id: emir.id, emir_no: emir.emir_no,
      urun_ad: emir.urun_ad, grade: emir.grade, paket_gr: emir.paket_gr,
      kullanilan_kg: kulKg, uretilen_adet: uretAdet,
      uretilen_kg: uretKg, fire_kg: fireKg,
      uretim_tarihi: kayitForm.uretim_tarihi,
      parti_no: partiNo, notlar: kayitForm.notlar||null
    }).select().single();
    if(e1){ showToast("Hata: "+e1.message,"#e07070"); setSaving(false); return; }

    // 2. Ham stoktan çıkış
    await supabase.from("cikislar").insert({
      grade: emir.grade, kg: kulKg, tarih: kayitForm.uretim_tarihi,
      sebep:"Üretime Gönderildi", notlar:`${emir.emir_no} — ${emir.urun_ad}`,
      uretim_emri_id: emir.id
    });

    // 3. Nihai ürün stoğuna giriş
    await supabase.from("nihai_stok").insert({
      urun_tanim_id: emir.urun_tanim_id, urun_ad: emir.urun_ad,
      grade: emir.grade, paket_gr: emir.paket_gr,
      hareket_tipi:"giris", adet: uretAdet, kg: uretKg,
      tarih: kayitForm.uretim_tarihi, sebep:"Üretim",
      referans_id: ukData.id, notlar: partiNo
    });

    // 4. Emri tamamlandı olarak işaretle
    await supabase.from("uretim_emirleri").update({durum:"tamamlandi"}).eq("id",emir.id);

    showToast(`✓ ${partiNo} üretim tamamlandı — ${uretAdet} adet`);
    setKayitForm({uretim_emri_id:"",kullanilan_kg:"",uretilen_adet:"",fire_kg:"0",uretim_tarihi:today(),notlar:""});
    loadAll();
    setSaving(false);
  };

  const emirOnayla = async (id) => {
    await supabase.from("uretim_emirleri").update({durum:"uretimde"}).eq("id",id);
    showToast("✓ Emir üretime alındı");
    loadAll();
  };

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:16}}>🏭 Üretim</div>

    {/* Tab Bar */}
    <div style={{display:"flex",gap:4,marginBottom:16,background:C.s2,padding:4,borderRadius:8,width:"fit-content"}}>
      {[["emirler","📋 Emirler"],["kayitlar","⚙️ Üret"],["urunler","📦 Ürünler"]].map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 14px",background:tab===id?C.s1:"transparent",
          border:"none",borderRadius:6,color:tab===id?C.gold2:C.text3,fontFamily:"'Sora',sans-serif",
          fontSize:12,fontWeight:500,cursor:"pointer"}}>{lbl}</button>
      ))}
    </div>

    {/* ── TAB: ÜRETİM EMİRLERİ ── */}
    {tab==="emirler" && <>
      <div style={s.card}>
        <div style={s.cardTitle}>➕ Yeni Üretim Emri</div>
        <Field label="Ürün Seç">
          <select style={s.select} value={emirForm.urun_tanim_id}
            onChange={e=>setEmirForm(f=>({...f,urun_tanim_id:e.target.value,hammadde_kg:""}))}>
            <option value="">-- Ürün Seçin --</option>
            {urunTanimlari.map(u=>(
              <option key={u.id} value={u.id}>
                {u.ad} ({u.grade}) — Stok: {fmt(hamStok(u.grade),1)} kg
              </option>
            ))}
          </select>
        </Field>
        {seciliUrun && <>
          <div style={{...s.card,background:C.s2,borderColor:C.border2,marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
              <div><span style={{color:C.text3}}>Grade: </span><GradePill grade={seciliUrun.grade}/></div>
              <div><span style={{color:C.text3}}>Paket: </span><span style={s.mono}>{seciliUrun.paket_gr} gr</span></div>
              <div><span style={{color:C.text3}}>Mevcut Stok: </span>
                <span style={{...s.mono,color:C.green}}>{fmt(hamStok(seciliUrun.grade),1)} kg</span></div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Kullanılacak KG">
              <input style={s.input} type="number" value={emirForm.hammadde_kg}
                onChange={e=>setEmirForm(f=>({...f,hammadde_kg:e.target.value}))}
                placeholder="0.0" inputMode="decimal" step="0.1"/>
            </Field>
            <Field label={`Hedef Adet (${seciliUrun.paket_gr}gr)`}>
              <input style={{...s.input,color:C.gold2,fontFamily:"'JetBrains Mono',monospace",
                fontSize:18,fontWeight:700,textAlign:"center"}} value={hedefAdet||""} readOnly placeholder="—"/>
            </Field>
          </div>
          <Field label="Talep Tarihi">
            <input style={s.input} type="date" value={emirForm.talep_tarihi}
              onChange={e=>setEmirForm(f=>({...f,talep_tarihi:e.target.value}))}/>
          </Field>
        </>}
        <Field label="Not"><input style={s.input} value={emirForm.notlar}
          onChange={e=>setEmirForm(f=>({...f,notlar:e.target.value}))} placeholder="Opsiyonel..."/></Field>
        <button style={s.btnGold} onClick={emirKaydet} disabled={saving||!seciliUrun}>
          {saving?"Oluşturuluyor...":"📋 Üretim Emri Oluştur"}
        </button>
      </div>

      <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
        textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Emirler</div>
      {uretimEmirleri.map(e=>(
        <div key={e.id} style={{...s.card,borderColor:e.durum==="bekliyor"?C.amber3:
          e.durum==="uretimde"?C.blue2:C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <span style={s.lotTag}>{e.emir_no}</span>
              <span style={{marginLeft:8,fontWeight:700,fontSize:13,color:GC[e.grade]}}>{e.urun_ad}</span>
            </div>
            <StatusBadge durum={e.durum}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,fontSize:11,color:C.text2,marginBottom:10}}>
            <div><span style={{color:C.text3}}>Hammadde: </span><span style={s.mono}>{fmt(e.hammadde_kg,1)} kg</span></div>
            <div><span style={{color:C.text3}}>Hedef: </span><span style={s.mono}>{e.hedef_adet} adet</span></div>
            <div><span style={{color:C.text3}}>Tarih: </span><span style={s.mono}>{e.talep_tarihi}</span></div>
          </div>
          {e.durum==="bekliyor" && (
            <button style={{...s.btnBlue,width:"100%"}} onClick={()=>emirOnayla(e.id)}>
              ▶ Üretime Al
            </button>
          )}
        </div>
      ))}
    </>}

    {/* ── TAB: ÜRETİM KAYDI ── */}
    {tab==="kayitlar" && <>
      <div style={s.card}>
        <div style={s.cardTitle}>⚙️ Üretim Gerçekleştir</div>
        <Field label="Üretim Emri Seç">
          <select style={s.select} value={kayitForm.uretim_emri_id}
            onChange={e=>setKayitForm(f=>({...f,uretim_emri_id:e.target.value,kullanilan_kg:"",uretilen_adet:""}))}>
            <option value="">-- Emir Seçin --</option>
            {uretimEmirleri.filter(e=>e.durum==="uretimde").map(e=>(
              <option key={e.id} value={e.id}>{e.emir_no} — {e.urun_ad} ({e.hedef_adet} adet hedef)</option>
            ))}
          </select>
        </Field>
        {seciliEmir && <>
          <div style={{...s.card,background:C.s2,borderColor:GC[seciliEmir.grade]+"40",marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12}}>
              <div><span style={{color:C.text3}}>Ürün: </span><span style={{fontWeight:600,color:GC[seciliEmir.grade]}}>{seciliEmir.urun_ad}</span></div>
              <div><span style={{color:C.text3}}>Paket: </span><span style={s.mono}>{seciliEmir.paket_gr} gr</span></div>
              <div><span style={{color:C.text3}}>Planlanan KG: </span><span style={s.mono}>{fmt(seciliEmir.hammadde_kg,1)}</span></div>
              <div><span style={{color:C.text3}}>Hedef Adet: </span><span style={s.mono}>{seciliEmir.hedef_adet}</span></div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Kullanılan KG (Ham)">
              <input style={s.input} type="number" value={kayitForm.kullanilan_kg}
                onChange={e=>setKayitForm(f=>({...f,kullanilan_kg:e.target.value}))}
                placeholder={fmt(seciliEmir.hammadde_kg,1)} inputMode="decimal" step="0.1"/>
            </Field>
            <Field label="Üretilen Adet">
              <input style={s.input} type="number" value={kayitForm.uretilen_adet}
                onChange={e=>setKayitForm(f=>({...f,uretilen_adet:e.target.value}))}
                placeholder={seciliEmir.hedef_adet} inputMode="numeric"/>
            </Field>
            <Field label="Fire KG">
              <input style={s.input} type="number" value={kayitForm.fire_kg}
                onChange={e=>setKayitForm(f=>({...f,fire_kg:e.target.value}))} placeholder="0" inputMode="decimal"/>
            </Field>
            <Field label="Üretim Tarihi">
              <input style={s.input} type="date" value={kayitForm.uretim_tarihi}
                onChange={e=>setKayitForm(f=>({...f,uretim_tarihi:e.target.value}))}/>
            </Field>
          </div>
          {kayitForm.uretilen_adet && <div style={{...s.card,background:C.green2,
            borderColor:"rgba(82,183,136,.3)",marginBottom:12}}>
            <div style={{fontSize:12,color:C.green}}>
              <div>✓ Üretilecek: <strong style={s.mono}>{kayitForm.uretilen_adet} adet × {seciliEmir.paket_gr}gr = {fmt(uretimNet,2)} kg</strong></div>
              {parseFloat(kayitForm.fire_kg)>0 &&
                <div>🔥 Fire: <strong style={{...s.mono,color:C.red}}>{kayitForm.fire_kg} kg</strong></div>}
            </div>
          </div>}
        </>}
        <Field label="Not"><input style={s.input} value={kayitForm.notlar}
          onChange={e=>setKayitForm(f=>({...f,notlar:e.target.value}))} placeholder="Opsiyonel..."/></Field>
        <button style={s.btnGold} onClick={uretimKaydet} disabled={saving||!seciliEmir}>
          {saving?"Kaydediliyor...":"✓ Üretimi Tamamla"}
        </button>
      </div>

      <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
        textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Geçmiş Üretimler</div>
      <div style={s.card}>
        <div style={s.tscroll}>
          <table style={{...s.table,minWidth:600}}>
            <thead><tr>
              <th style={s.th}>Parti No</th><th style={s.th}>Ürün</th>
              <th style={s.th}>Kull. KG</th><th style={s.th}>Üretilen</th>
              <th style={s.th}>Net KG</th><th style={s.th}>Fire</th><th style={s.th}>Tarih</th>
            </tr></thead>
            <tbody>
              {uretimKayitlari.length===0
                ? <tr><td style={{...s.td,textAlign:"center",color:C.text3}} colSpan={7}>Üretim kaydı yok</td></tr>
                : uretimKayitlari.map(k=><tr key={k.id}>
                    <td style={s.td}><span style={s.lotTag}>{k.parti_no}</span></td>
                    <td style={{...s.td,fontSize:11}}><GradePill grade={k.grade}/> {k.urun_ad}</td>
                    <td style={{...s.td,...s.mono}}>{fmt(k.kullanilan_kg,1)}</td>
                    <td style={{...s.td,...s.mono,color:C.gold2}}>{k.uretilen_adet} adet</td>
                    <td style={{...s.td,...s.mono,color:C.green}}>{fmt(k.uretilen_kg,2)}</td>
                    <td style={{...s.td,...s.mono,color:k.fire_kg>0?C.red:C.text3}}>{k.fire_kg>0?fmt(k.fire_kg,1):"—"}</td>
                    <td style={{...s.td,...s.mono,fontSize:11}}>{k.uretim_tarihi}</td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
      </div>
    </>}

    {/* ── TAB: NİHAİ ÜRÜN STOĞU ── */}
    {tab==="urunler" && <>
      <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
        textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Nihai Ürün Stoku</div>
      {urunTanimlari.map(u=>{
        const adet = nihaiStokAdet(u.ad);
        const kg = adet*u.paket_gr/1000;
        return <div key={u.id} style={{...s.card,borderColor:adet>0?GC[u.grade]+"40":C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <GradePill grade={u.grade}/>
              <span style={{marginLeft:8,fontWeight:700,fontSize:13}}>{u.ad}</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
                color:adet>0?C.gold2:C.red}}>{adet}</div>
              <div style={{fontSize:10,color:C.text3}}>adet / {fmt(kg,2)} kg</div>
            </div>
          </div>
        </div>;
      })}
    </>}

    {/* BİLDİRİM MODALI */}
    {bildirim && <BildirimModal bildirim={bildirim} onClose={()=>{setBildirim(null);setTab("liste");}}/>}
  </>;
}

// ═══════════════════════════════════════════════════════════════
// BİLDİRİM MODALI
// ═══════════════════════════════════════════════════════════════
function BildirimModal({ bildirim, onClose }) {
  const { sipNo, musteriAd, urunAd, adet, tahmini, tel, email } = bildirim;

  const mesaj = `Sayın ${musteriAd},\n\nSiparişiniz alınmıştır.\nSipariş No: ${sipNo}\nÜrün: ${urunAd}\nAdet: ${adet}\nTahmini Hazırlık Tarihi: ${tahmini}\n\nSiparişiniz hazırlandığında tekrar bilgilendirileceğiz.\nİyi günler dileriz.`;

  const waLink = tel
    ? "https://wa.me/90"+tel.replace(/\D/g,"").replace(/^0/,"")+`?text=${encodeURIComponent(mesaj)}`
    : `https://web.whatsapp.com/send?text=${encodeURIComponent(mesaj)}`;

  const mailLink = email
    ? `mailto:${email}?subject=Sipariş Bilgilendirme - ${sipNo}&body=${encodeURIComponent(mesaj)}`
    : `mailto:?subject=Sipariş Bilgilendirme - ${sipNo}&body=${encodeURIComponent(mesaj)}`;

  const kopyala = () => {
    navigator.clipboard.writeText(mesaj).catch(()=>{});
  };

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,
    display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div style={{background:C.s1,borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:480,
      border:`1px solid ${C.border}`,borderBottom:"none",maxHeight:"85vh",overflowY:"auto"}}>

      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:36}}>🏭</div>
        <div style={{fontSize:16,fontWeight:700,color:C.gold2,marginTop:8}}>Üretim Emri Oluşturuldu</div>
        <div style={{fontSize:12,color:C.text3,marginTop:4}}>Stok yetersiz — sipariş üretim bekliyor</div>
      </div>

      <div style={{...C.card,background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:16}}>
        <div style={{display:"grid",gap:6,fontSize:12}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:C.text3}}>Sipariş No</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.gold2}}>{sipNo}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:C.text3}}>Müşteri</span>
            <span style={{fontWeight:600}}>{musteriAd}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:C.text3}}>Ürün</span>
            <span>{urunAd} × {adet} adet</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:`1px solid ${C.border}`}}>
            <span style={{color:C.text3}}>⏰ Tahmini Tarih</span>
            <span style={{fontWeight:700,color:C.amber}}>{tahmini}</span>
          </div>
        </div>
      </div>

      <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,padding:12,
        fontSize:11,color:C.text2,fontFamily:"'JetBrains Mono',monospace",
        whiteSpace:"pre-line",marginBottom:16,lineHeight:1.6}}>{mesaj}</div>

      <div style={{display:"grid",gap:8,marginBottom:12}}>
        <a href={waLink} target="_blank" rel="noreferrer" style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          padding:"12px 16px",background:"#25D366",borderRadius:10,
          color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>
          <span style={{fontSize:18}}>💬</span> WhatsApp ile Gönder
        </a>
        <a href={mailLink} style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          padding:"12px 16px",background:C.blue2,border:`1px solid rgba(106,174,214,.3)`,
          borderRadius:10,color:C.blue,fontWeight:700,fontSize:13,textDecoration:"none"}}>
          <span style={{fontSize:18}}>📧</span> E-posta ile Gönder
        </a>
        <button onClick={kopyala} style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          padding:"12px 16px",background:C.s3,border:`1px solid ${C.border2}`,
          borderRadius:10,color:C.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          <span style={{fontSize:18}}>📋</span> Mesajı Kopyala
        </button>
      </div>

      <button onClick={onClose} style={{width:"100%",padding:"12px",background:"transparent",
        border:`1px solid ${C.border2}`,borderRadius:10,color:C.text2,
        fontWeight:600,fontSize:13,cursor:"pointer"}}>Kapat</button>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// STOK SAYFASI
// ═══════════════════════════════════════════════════════════════
function StokPage({ hamStokOzet, hamStok, ayristirmalar, cikislar, urunTanimlari,
                    nihaiStokAdet, showToast, loadAll, supabase }) {
  const [tab, setTab] = useState("ham");
  const [form, setForm] = useState({grade:"Grade 1",kg:"",tarih:today(),sebep:"Satış",notlar:""});

  const cikisKaydet = async () => {
    if(!form.kg||!form.tarih){ showToast("KG ve tarih zorunlu","#e07070"); return; }
    const stok = hamStok(form.grade);
    if((parseFloat(form.kg)||0)>stok){
      showToast(`Yetersiz stok! ${form.grade}: ${fmt(stok,1)} kg`,"#e07070"); return;
    }
    const { error } = await supabase.from("cikislar").insert({
      grade:form.grade, kg:parseFloat(form.kg), tarih:form.tarih,
      sebep:form.sebep, notlar:form.notlar||null
    });
    if(error){ showToast("Hata: "+error.message,"#e07070"); return; }
    showToast("✓ Çıkış kaydedildi");
    setForm(f=>({...f,kg:"",notlar:""}));
    loadAll();
  };

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:16}}>📦 Stok</div>

    {/* Tab Bar */}
    <div style={{display:"flex",gap:4,marginBottom:16,background:C.s2,padding:4,borderRadius:8,width:"fit-content"}}>
      {[["ham","🌿 Ham Stok"],["nihai","📦 Hazır Ürün"]].map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 14px",background:tab===id?C.s1:"transparent",
          border:"none",borderRadius:6,color:tab===id?C.gold2:C.text3,fontFamily:"'Sora',sans-serif",
          fontSize:12,fontWeight:500,cursor:"pointer"}}>{lbl}</button>
      ))}
    </div>

    {/* Nihai Ürün Stoku */}
    {tab==="nihai" && <>
      <div style={{display:"grid",gap:8}}>
        {urunTanimlari.length===0
          ? <div style={{...s.alertInfo}}><span>ℹ️</span><div>Henüz ürün tanımı yok.</div></div>
          : urunTanimlari.map(u=>{
              const adet = nihaiStokAdet(u.ad);
              const kg = adet*u.paket_gr/1000;
              return <div key={u.id} style={{...s.card,borderColor:adet>0?GC[u.grade]+"50":C.border,marginBottom:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <GradePill grade={u.grade}/>
                    <span style={{marginLeft:8,fontWeight:700,fontSize:13}}>{u.ad}</span>
                    <div style={{fontSize:10,color:C.text3,marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>{u.paket_gr}gr / paket</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:adet>0?C.gold2:C.red}}>{adet}</div>
                    <div style={{fontSize:10,color:C.text3}}>adet</div>
                    <div style={{fontSize:11,color:C.text2,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(kg,2)} kg</div>
                  </div>
                </div>
              </div>;
            })
        }
      </div>
      {urunTanimlari.length>0&&<div style={{...s.card,marginTop:12,background:C.s2}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
          <span style={{color:C.text3}}>Toplam Adet</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.gold2}}>
            {urunTanimlari.reduce((a,u)=>a+nihaiStokAdet(u.ad),0)} adet
          </span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
          <span style={{color:C.text3}}>Toplam KG</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.green}}>
            {fmt(urunTanimlari.reduce((a,u)=>a+nihaiStokAdet(u.ad)*u.paket_gr/1000,0),2)} kg
          </span>
        </div>
      </div>}
    </>}

    {tab==="ham" && <>
    {/* Grade bazlı stok kutuları */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      {GRADES.map(g=>{
        const net = hamStok(g);
        const row = hamStokOzet.find(r=>r.grade===g)||{};
        return <div key={g} style={{...s.card,borderColor:GC[g]+"40",marginBottom:0}}>
          <div style={{fontSize:11,fontWeight:700,color:GC[g],marginBottom:4}}>{g}</div>
          <div style={{fontSize:26,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GC[g]}}>{fmt(net,1)}</div>
          <div style={{fontSize:10,color:C.text3}}>kg net</div>
          <div style={{fontSize:10,color:C.text3,marginTop:4}}>
            ↑{fmt(row.toplam_giris,1)} ↓{fmt(row.toplam_cikis,1)}
          </div>
        </div>;
      })}
    </div>

    {/* Çıkış formu */}
    <div style={s.card}>
      <div style={s.cardTitle}>📤 Stoktan Çıkış</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Grade">
          <select style={s.select} value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value}))}>
            {GRADES.map(g=><option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Mevcut Stok">
          <input style={{...s.input,color:GC[form.grade],fontWeight:700}} value={fmt(hamStok(form.grade),1)+" kg"} readOnly/>
        </Field>
        <Field label="KG">
          <input style={s.input} type="number" value={form.kg}
            onChange={e=>setForm(f=>({...f,kg:e.target.value}))} placeholder="0.0" inputMode="decimal"/>
        </Field>
        <Field label="Sebep">
          <select style={s.select} value={form.sebep} onChange={e=>setForm(f=>({...f,sebep:e.target.value}))}>
            {["Satış","İşleme","Fire","Diğer"].map(s=><option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Tarih"><input style={s.input} type="date" value={form.tarih} onChange={e=>setForm(f=>({...f,tarih:e.target.value}))}/></Field>
      <Field label="Not"><input style={s.input} value={form.notlar} onChange={e=>setForm(f=>({...f,notlar:e.target.value}))} placeholder="..."/></Field>
      <button style={s.btnGold} onClick={cikisKaydet}>📤 Çıkış Kaydet</button>
    </div>

    {/* Son çıkışlar */}
    <div style={{fontSize:11,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
      textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Son Çıkışlar</div>
    <div style={s.card}>
      <div style={s.tscroll}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Tarih</th><th style={s.th}>Grade</th>
            <th style={s.th}>KG</th><th style={s.th}>Sebep</th><th style={s.th}>Not</th>
          </tr></thead>
          <tbody>
            {cikislar.slice(0,20).map(c=><tr key={c.id}>
              <td style={{...s.td,...s.mono,fontSize:11}}>{c.tarih}</td>
              <td style={s.td}><GradePill grade={c.grade}/></td>
              <td style={{...s.td,...s.mono}}>{fmt(c.kg,1)}</td>
              <td style={{...s.td,fontSize:11}}>{c.sebep}</td>
              <td style={{...s.td,fontSize:11,color:C.text3}}>{c.notlar||"—"}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    </>}
  </>;
}

// ═══════════════════════════════════════════════════════════════
// RAPOR SAYFASI
// ═══════════════════════════════════════════════════════════════
function RaporPage({ girisler, ayristirmalar, giderler, uretimKayitlari, nihalStok,
                     hamStokOzet, nihaiStokAdet, urunTanimlari }) {
  const [tab, setTab] = useState("ozet");

  const topAlimKg  = girisler.reduce((a,g)=>a+g.kg,0);
  const topAlimTL  = girisler.reduce((a,g)=>a+g.toplam,0);
  const topGider   = giderler.reduce((a,g)=>a+g.tutar,0);
  const topAyrist  = ayristirmalar.reduce((a,x)=>a+(x.g1||0)+(x.g2||0)+(x.g3||0)+(x.gh||0),0);
  const topFire    = ayristirmalar.reduce((a,x)=>a+(x.fire||0),0);
  const kgBasi     = topAyrist>0?(topAlimTL+topGider)/topAyrist:0;
  const topUretim  = uretimKayitlari.reduce((a,k)=>a+k.uretilen_adet,0);

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:16}}>📊 Raporlar</div>

    <div style={{display:"flex",gap:4,marginBottom:16,background:C.s2,padding:4,
      borderRadius:8,overflowX:"auto"}}>
      {[["ozet","Özet"],["uretim","Üretim"],["maliyet","Maliyet"]].map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 14px",whiteSpace:"nowrap",
          background:tab===id?C.s1:"transparent",border:"none",borderRadius:6,
          color:tab===id?C.gold2:C.text3,fontFamily:"'Sora',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>
          {lbl}
        </button>
      ))}
    </div>

    {tab==="ozet" && <>
      <div style={s.card}>
        <div style={s.cardTitle}>📦 Genel Özet</div>
        {[
          ["Toplam Alım",`${fmt(topAlimKg,1)} kg`,C.gold2],
          ["Ayrıştırılan",`${fmt(topAyrist,1)} kg`,C.green],
          ["Toplam Fire",`${fmt(topFire,1)} kg`,C.red],
          ["Fire Oranı",`%${fmt(topAlimKg>0?topFire/topAlimKg*100:0,2)}`,C.amber],
          ["Toplam Alım Bedeli",fmtTL(topAlimTL),C.gold2],
          ["Toplam Gider",fmtTL(topGider),C.amber],
          ["KG Başına Maliyet",fmtTL(kgBasi),C.green],
          ["Toplam Üretim",`${topUretim} adet`,C.purple],
        ].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
            borderBottom:`1px solid ${C.border}`,fontSize:13}}>
            <span style={{color:C.text2}}>{l}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:c}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>🥧 Grade Dağılımı</div>
        {GRADES.map(g=>{
          const row = hamStokOzet.find(r=>r.grade===g)||{};
          const giris = row.toplam_giris||0;
          const max = Math.max(...GRADES.map(x=>(hamStokOzet.find(r=>r.grade===x)||{}).toplam_giris||0),1);
          return <div key={g} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:600,color:GC[g]}}>{g}</span>
              <span style={{...s.mono,fontSize:11,color:C.text2}}>{fmt(giris,1)} kg
                {topAyrist>0&&<span style={{color:C.text3}}> (%{fmt(giris/topAyrist*100,1)})</span>}
              </span>
            </div>
            <div style={{height:7,background:C.s3,borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.max(0,giris/max*100)}%`,
                background:GC[g],borderRadius:4}}/>
            </div>
          </div>;
        })}
      </div>
    </>}

    {tab==="uretim" && <>
      <div style={s.card}>
        <div style={s.cardTitle}>🏭 Üretim Özeti</div>
        {uretimKayitlari.length===0
          ? <div style={{textAlign:"center",padding:24,color:C.text3}}>Henüz üretim yok</div>
          : <>
            {[...new Set(uretimKayitlari.map(k=>k.urun_ad))].map(urun=>{
              const list = uretimKayitlari.filter(k=>k.urun_ad===urun);
              const adet = list.reduce((a,k)=>a+k.uretilen_adet,0);
              const kg   = list.reduce((a,k)=>a+k.uretilen_kg,0);
              const fire = list.reduce((a,k)=>a+k.fire_kg,0);
              const grade= list[0]?.grade||"";
              return <div key={urun} style={{...s.card,background:C.s2,borderColor:GC[grade]+"40",marginBottom:8}}>
                <div style={{fontWeight:700,color:GC[grade],marginBottom:8}}>{urun}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,fontSize:12}}>
                  <div><span style={{color:C.text3}}>Üretim: </span><span style={s.mono}>{list.length}×</span></div>
                  <div><span style={{color:C.text3}}>Adet: </span><span style={s.mono}>{adet}</span></div>
                  <div><span style={{color:C.text3}}>KG: </span><span style={s.mono}>{fmt(kg,2)}</span></div>
                  <div><span style={{color:C.text3}}>Stok: </span><span style={{...s.mono,color:C.gold2}}>{nihaiStokAdet(urun)} adet</span></div>
                  {fire>0&&<div><span style={{color:C.text3}}>Fire: </span><span style={{...s.mono,color:C.red}}>{fmt(fire,1)} kg</span></div>}
                </div>
              </div>;
            })}
          </>
        }
      </div>
    </>}

    {tab==="maliyet" && <>
      <div style={s.card}>
        <div style={s.cardTitle}>🧮 Maliyet Analizi</div>
        <div style={{textAlign:"center",padding:"16px 0",borderBottom:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace",
            textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>KG BAŞINA MALİYET</div>
          <div style={{fontSize:44,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>
            {fmtTL(kgBasi)}
          </div>
          <div style={{fontSize:11,color:C.text3,marginTop:4}}>/ kilogram (alım + genel gider)</div>
        </div>
        {[["Çiftçi Alım Bedeli",fmtTL(topAlimTL)],["Genel Giderler",fmtTL(topGider)],
          ["TOPLAM",fmtTL(topAlimTL+topGider)]].map(([l,v],i)=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
            borderBottom:i<2?`1px solid ${C.border}`:"none",fontSize:i===2?14:12,
            fontWeight:i===2?700:400}}>
            <span style={{color:i===2?C.gold2:C.text2}}>{l}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",color:i===2?C.gold2:C.text}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Aylık gider tablosu */}
      <div style={s.card}>
        <div style={s.cardTitle}>📅 Aylık Gider</div>
        {[...new Set(giderler.map(g=>g.ay))].sort().reverse().map(ay=>{
          const list = giderler.filter(g=>g.ay===ay);
          const top = list.reduce((a,g)=>a+g.tutar,0);
          return <div key={ay} style={{marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{...s.mono,fontSize:12,fontWeight:700}}>{ay}</span>
              <span style={{...s.mono,fontSize:12,color:C.gold2}}>{fmtTL(top)}</span>
            </div>
            {list.map(g=>(
              <div key={g.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,
                padding:"3px 0",paddingLeft:8,color:C.text2}}>
                <span>{g.kategori}</span>
                <span style={s.mono}>{fmtTL(g.tutar)}</span>
              </div>
            ))}
          </div>;
        })}
      </div>
    </>}
  </>;
}

// ═══════════════════════════════════════════════════════════════
// SİPARİŞ SAYFASI
// ═══════════════════════════════════════════════════════════════
function SiparisPage({ siparisler, satisTem, urunTanimlari, nihaiStokAdet,
                       uretimEmirleri, nextSiparisNo, nextEmiNo, showToast, loadAll, supabase }) {
  const [tab, setTab] = useState("liste");
  const [form, setForm] = useState({
    tarih:today(), musteri_ad:"", satis_temsilcisi:"",
    urun_tanim_id:"", adet:"", birim_fiyat:"",
    musteri_tel:"", musteri_email:"", notlar:""
  });
  const [bildirim, setBildirim] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const seciliUrun = urunTanimlari.find(u=>u.id===form.urun_tanim_id);
  const stokAdet = seciliUrun ? nihaiStokAdet(seciliUrun.ad) : 0;
  const toplam = (parseInt(form.adet)||0)*(parseFloat(form.birim_fiyat)||0);

  const tahminiUretimTarihi = () => {
    const bekleyen = (uretimEmirleri||[]).filter(e=>e.durum==="bekliyor"||e.durum==="uretimde").length;
    const gun = 2 + bekleyen * 2;
    const d = new Date(); d.setDate(d.getDate() + gun);
    return d.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  };

  const kaydet = async () => {
    if(!form.musteri_ad||!form.urun_tanim_id||!form.adet){
      showToast("Müşteri, ürün ve adet zorunlu","#e07070"); return;
    }
    setSaving(true);
    const adet = parseInt(form.adet)||0;
    const stokYeterli = adet <= stokAdet;
    const durum = stokYeterli ? "bekliyor" : "stok_bekleniyor";
    const sipNo = nextSiparisNo();

    const { error } = await supabase.from("siparisler").insert({
      siparis_no: sipNo, tarih: form.tarih,
      musteri_ad: form.musteri_ad, satis_temsilcisi: form.satis_temsilcisi||null,
      urun_tanim_id: form.urun_tanim_id, urun_ad: seciliUrun.ad,
      grade: seciliUrun.grade, paket_gr: seciliUrun.paket_gr,
      adet, birim_fiyat: parseFloat(form.birim_fiyat)||0,
      toplam_tutar: toplam, durum,
      notlar: form.notlar||null
    });
    if(error){ showToast("Hata: "+error.message,"#e07070"); setSaving(false); return; }

    if(!stokYeterli) {
      // Otomatik üretim emri oluştur
      const eksikAdet = adet - stokAdet;
      const hammaddeKg = Math.ceil(eksikAdet * seciliUrun.paket_gr / 1000 * 1.05 * 10) / 10;
      await supabase.from("uretim_emirleri").insert({
        emir_no: nextEmiNo(),
        urun_tanim_id: seciliUrun.id,
        urun_ad: seciliUrun.ad,
        grade: seciliUrun.grade,
        paket_gr: seciliUrun.paket_gr,
        hammadde_kg: hammaddeKg,
        hedef_adet: eksikAdet,
        durum:"bekliyor",
        talep_tarihi: today(),
        notlar: "Otomatik — Sipariş: "+sipNo
      });

      // Bildirim modalı göster
      const tahmini = tahminiUretimTarihi();
      setBildirim({
        sipNo, musteriAd: form.musteri_ad,
        urunAd: seciliUrun.ad, adet,
        tahmini,
        tel: form.musteri_tel,
        email: form.musteri_email
      });
    } else {
      showToast("✓ Sipariş kaydedildi");
      setTab("liste");
    }

    setForm({tarih:today(),musteri_ad:"",satis_temsilcisi:"",urun_tanim_id:"",adet:"",birim_fiyat:"",musteri_tel:"",musteri_email:"",notlar:""});
    loadAll();
    setSaving(false);
  };

  const durumGuncelle = async (id, durum) => {
    const siparis = siparisler.find(si=>si.id===id);
    if(!siparis) return;
    if(durum==="teslim_edildi") {
      await supabase.from("nihai_stok").insert({
        urun_tanim_id: siparis.urun_tanim_id, urun_ad: siparis.urun_ad,
        grade: siparis.grade, paket_gr: siparis.paket_gr,
        hareket_tipi:"cikis", adet: siparis.adet,
        kg: siparis.adet*siparis.paket_gr/1000, tarih: today(),
        sebep:"Sipariş Teslimi", notlar: siparis.siparis_no
      });
    }
    await supabase.from("siparisler").update({durum}).eq("id",id);
    showToast(durum==="teslim_edildi"?"✓ Teslim edildi — stoktan düşüldü":"✓ Güncellendi");
    loadAll();
  };

  const dRenk = {bekliyor:[C.amber,"rgba(224,155,74,.15)"], stok_bekleniyor:[C.purple,"rgba(167,139,250,.15)"],
                 hazirlaniyor:[C.blue,"rgba(106,174,214,.15)"],
                 teslim_edildi:[C.green,"rgba(82,183,136,.15)"], iptal:[C.red,"rgba(224,112,112,.15)"]};
  const dLabel = {bekliyor:"⏳ Bekliyor", stok_bekleniyor:"🏭 Üretim Bekliyor", hazirlaniyor:"📦 Hazırlanıyor", teslim_edildi:"✓ Teslim", iptal:"✕ İptal"};

  const bekleyenler = siparisler.filter(si=>si.durum==="bekliyor"||si.durum==="hazirlaniyor");
  const topSatis = siparisler.filter(si=>si.durum==="teslim_edildi").reduce((a,si)=>a+si.toplam_tutar,0);
  const topAdet  = siparisler.filter(si=>si.durum==="teslim_edildi").reduce((a,si)=>a+si.adet,0);
  const temsilciOzet = satisTem.map(t=>{
    const list = siparisler.filter(si=>si.satis_temsilcisi===t.ad&&si.durum==="teslim_edildi");
    return {ad:t.ad, sayi:list.length, tutar:list.reduce((a,si)=>a+si.toplam_tutar,0)};
  }).filter(t=>t.sayi>0).sort((a,b)=>b.tutar-a.tutar);

  return <>
    <div style={{fontSize:18,fontWeight:700,color:C.gold2,marginBottom:12}}>🛒 Siparişler</div>
    <div style={s.kpiRow}>
      <div style={s.kpi}>
        <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>Bekleyen</div>
        <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.amber}}>{bekleyenler.length}</div>
      </div>
      <div style={s.kpi}>
        <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>Teslim Adet</div>
        <div style={{fontSize:20,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.green}}>{topAdet}</div>
      </div>
      <div style={s.kpi}>
        <div style={{fontSize:10,color:C.text3,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>Satış Tutarı</div>
        <div style={{fontSize:16,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>{fmtTL(topSatis)}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:4,marginBottom:16,background:C.s2,padding:4,borderRadius:8,width:"fit-content"}}>
      {[["liste","📋 Liste"],["yeni","➕ Yeni"],["temsilci","👤 Temsilci"]].map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 14px",background:tab===id?C.s1:"transparent",
          border:"none",borderRadius:6,color:tab===id?C.gold2:C.text3,fontFamily:"'Sora',sans-serif",
          fontSize:12,fontWeight:500,cursor:"pointer"}}>{lbl}</button>
      ))}
    </div>

    {tab==="liste" && <>
      {siparisler.length===0
        ? <div style={{...s.alertInfo}}><span>ℹ️</span><div>Henüz sipariş yok. "Yeni" sekmesinden ekleyin.</div></div>
        : siparisler.map(si=>{
            const [renk,bg] = dRenk[si.durum]||[C.text3,C.s2];
            return <div key={si.id} style={{...s.card,borderColor:renk+"40"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <span style={s.lotTag}>{si.siparis_no}</span>
                  <span style={{marginLeft:8,fontWeight:700,fontSize:13}}>{si.musteri_ad}</span>
                </div>
                <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,color:renk,background:bg}}>{dLabel[si.durum]}</span>
              </div>
              <div style={{fontSize:12,color:C.text2,marginBottom:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                <div>📦 {si.urun_ad}</div>
                <div style={s.mono}>{si.adet} adet × {fmtTL(si.birim_fiyat)}</div>
                <div>📅 {si.tarih}</div>
                {si.satis_temsilcisi&&<div>👤 {si.satis_temsilcisi}</div>}
              </div>
              {si.toplam_tutar>0&&<div style={{fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.gold2,marginBottom:8}}>{fmtTL(si.toplam_tutar)}</div>}
              {(si.durum==="bekliyor"||si.durum==="stok_bekleniyor"||si.durum==="hazirlaniyor")&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {(si.durum==="bekliyor"||si.durum==="stok_bekleniyor")&&<button style={s.btnBlue} onClick={()=>durumGuncelle(si.id,"hazirlaniyor")}>📦 Hazırla</button>}
                {si.durum==="hazirlaniyor"&&<button style={s.btnGreen} onClick={()=>durumGuncelle(si.id,"teslim_edildi")}>✓ Teslim Et</button>}
                <button style={s.btnRed} onClick={()=>durumGuncelle(si.id,"iptal")}>İptal</button>
              </div>}
            </div>;
          })
      }
    </>}

    {tab==="yeni" && <div style={s.card}>
      <div style={s.cardTitle}>➕ Yeni Sipariş</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Tarih">
          <input style={s.input} type="date" value={form.tarih} onChange={e=>set("tarih",e.target.value)}/>
        </Field>
        <Field label="Satış Temsilcisi">
          <select style={s.select} value={form.satis_temsilcisi} onChange={e=>set("satis_temsilcisi",e.target.value)}>
            <option value="">-- Seçin --</option>
            {satisTem.map(t=><option key={t.id} value={t.ad}>{t.ad}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Müşteri Adı">
        <input style={s.input} value={form.musteri_ad} onChange={e=>set("musteri_ad",e.target.value)} placeholder="Firma / Kişi adı..."/>
      </Field>
      <Field label="Ürün Seç">
        <select style={s.select} value={form.urun_tanim_id} onChange={e=>set("urun_tanim_id",e.target.value)}>
          <option value="">-- Ürün Seçin --</option>
          {urunTanimlari.map(u=><option key={u.id} value={u.id}>{u.ad} — Stok: {nihaiStokAdet(u.ad)} adet</option>)}
        </select>
      </Field>
      {seciliUrun&&<div style={{...s.card,background:C.s2,borderColor:GC[seciliUrun.grade]+"40",marginBottom:12}}>
        <div style={{display:"flex",gap:12,fontSize:12,alignItems:"center"}}>
          <GradePill grade={seciliUrun.grade}/>
          <span><span style={{color:C.text3}}>Paket: </span><span style={s.mono}>{seciliUrun.paket_gr}gr</span></span>
          <span><span style={{color:C.text3}}>Stok: </span>
            <span style={{...s.mono,color:stokAdet>0?C.green:C.red,fontWeight:700}}>{stokAdet} adet</span></span>
        </div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Adet">
          <input style={s.input} type="number" value={form.adet} onChange={e=>set("adet",e.target.value)} placeholder="0" inputMode="numeric"/>
        </Field>
        <Field label="Birim Fiyat (₺)">
          <input style={s.input} type="number" value={form.birim_fiyat} onChange={e=>set("birim_fiyat",e.target.value)} placeholder="0.00" inputMode="decimal"/>
        </Field>
      </div>
      {toplam>0&&<div style={{...s.card,background:C.s2,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
          <span style={{color:C.text2}}>Toplam Tutar</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>{fmtTL(toplam)}</span>
        </div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Müşteri Tel (WhatsApp)">
          <input style={s.input} value={form.musteri_tel} onChange={e=>set("musteri_tel",e.target.value)} placeholder="05xx xxx xx xx" inputMode="tel"/>
        </Field>
        <Field label="Müşteri E-posta">
          <input style={s.input} type="email" value={form.musteri_email} onChange={e=>set("musteri_email",e.target.value)} placeholder="ornek@firma.com"/>
        </Field>
      </div>
      <Field label="Not"><input style={s.input} value={form.notlar} onChange={e=>set("notlar",e.target.value)} placeholder="Opsiyonel..."/></Field>
      {stokAdet < (parseInt(form.adet)||0) && form.adet && <div style={{...s.alertWarn,marginBottom:12}}>
        <span>⚠️</span>
        <div><strong>Stok yetersiz!</strong> Mevcut: {stokAdet} adet. Sipariş kaydedilecek ve otomatik üretim emri oluşturulacak.</div>
      </div>}
      <button style={s.btnGold} onClick={kaydet} disabled={saving}>{saving?"Kaydediliyor...":"✓ Sipariş Kaydet"}</button>
    </div>}

    {tab==="temsilci" && <>
      {temsilciOzet.length===0
        ? <div style={{...s.alertInfo}}><span>ℹ️</span><div>Henüz teslim edilmiş sipariş yok.</div></div>
        : temsilciOzet.map((t,i)=>(
            <div key={t.ad} style={{...s.card,borderColor:i===0?C.gold3:C.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.s3,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":"👤"}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{t.ad}</div>
                    <div style={{fontSize:11,color:C.text3}}>{t.sayi} sipariş teslim</div>
                  </div>
                </div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>{fmtTL(t.tutar)}</div>
              </div>
            </div>
          ))
      }
      {temsilciOzet.length>0&&<div style={{...s.card,background:C.s2}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700}}>
          <span style={{color:C.text2}}>Toplam Satış</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:C.gold2}}>{fmtTL(topSatis)}</span>
        </div>
      </div>}
    </>}
  </>;
}
