import { useState, useMemo, useEffect } from "react";

// ── Stock Universe ────────────────────────────────────────────────────────────
const STOCK_UNIVERSE = {
  "US – Mega Cap Tech": [
    { ticker:"AAPL",  name:"Apple"              },
    { ticker:"MSFT",  name:"Microsoft"          },
    { ticker:"NVDA",  name:"NVIDIA"             },
    { ticker:"GOOGL", name:"Alphabet"           },
    { ticker:"META",  name:"Meta"               },
    { ticker:"AMZN",  name:"Amazon"             },
    { ticker:"TSLA",  name:"Tesla"              },
    { ticker:"AVGO",  name:"Broadcom"           },
  ],
  "US – Finance": [
    { ticker:"JPM",   name:"JPMorgan Chase"     },
    { ticker:"GS",    name:"Goldman Sachs"      },
    { ticker:"BAC",   name:"Bank of America"    },
    { ticker:"MS",    name:"Morgan Stanley"     },
    { ticker:"BRK-B", name:"Berkshire Hathaway" },
    { ticker:"V",     name:"Visa"               },
    { ticker:"MA",    name:"Mastercard"         },
  ],
  "US – Other Majors": [
    { ticker:"JNJ",   name:"Johnson & Johnson"  },
    { ticker:"WMT",   name:"Walmart"            },
    { ticker:"XOM",   name:"ExxonMobil"         },
    { ticker:"UNH",   name:"UnitedHealth"       },
    { ticker:"PG",    name:"Procter & Gamble"   },
    { ticker:"HD",    name:"Home Depot"         },
    { ticker:"NFLX",  name:"Netflix"            },
    { ticker:"AMD",   name:"AMD"                },
  ],
  "Indonesia – Banks": [
    { ticker:"BBCA.JK", name:"BCA"              },
    { ticker:"BBRI.JK", name:"BRI"              },
    { ticker:"BMRI.JK", name:"Bank Mandiri"     },
    { ticker:"BBNI.JK", name:"BNI"              },
    { ticker:"BNGA.JK", name:"Bank CIMB Niaga"  },
    { ticker:"BNLI.JK", name:"Bank Permata"     },
  ],
  "Indonesia – Telco & Tech": [
    { ticker:"TLKM.JK", name:"Telkom Indonesia" },
    { ticker:"EXCL.JK", name:"XL Axiata"        },
    { ticker:"ISAT.JK", name:"Indosat Ooredoo"  },
    { ticker:"GOTO.JK", name:"GoTo"             },
    { ticker:"BUKA.JK", name:"Bukalapak"        },
  ],
  "Indonesia – Energy & Mining": [
    { ticker:"ADRO.JK", name:"Adaro Energy"     },
    { ticker:"BYAN.JK", name:"Bayan Resources"  },
    { ticker:"PGAS.JK", name:"Perusahaan Gas"   },
    { ticker:"ANTM.JK", name:"Aneka Tambang"    },
    { ticker:"PTBA.JK", name:"Bukit Asam"       },
    { ticker:"INCO.JK", name:"Vale Indonesia"   },
  ],
  "Indonesia – Consumer & Industry": [
    { ticker:"ASII.JK", name:"Astra International" },
    { ticker:"UNVR.JK", name:"Unilever Indonesia"  },
    { ticker:"ICBP.JK", name:"Indofood CBP"        },
    { ticker:"INDF.JK", name:"Indofood"            },
    { ticker:"HMSP.JK", name:"HM Sampoerna"        },
    { ticker:"KLBF.JK", name:"Kalbe Farma"         },
  ],
  "Major Indices": [
    { ticker:"^GSPC",    name:"S&P 500"              },
    { ticker:"^IXIC",    name:"Nasdaq Composite"     },
    { ticker:"^DJI",     name:"Dow Jones"            },
    { ticker:"^JKSE",    name:"IDX Composite (IHSG)" },
    { ticker:"^HSI",     name:"Hang Seng"            },
    { ticker:"^N225",    name:"Nikkei 225"           },
    { ticker:"^FTSE",    name:"FTSE 100"             },
    { ticker:"^AXJO",    name:"ASX 200"              },
  ],
  "Commodities & FX": [
    { ticker:"GC=F",     name:"Gold"                 },
    { ticker:"CL=F",     name:"Crude Oil (WTI)"      },
    { ticker:"SI=F",     name:"Silver"               },
    { ticker:"EURUSD=X", name:"EUR/USD"              },
    { ticker:"USDIDR=X", name:"USD/IDR"              },
    { ticker:"DX-Y.NYB", name:"USD Index (DXY)"      },
  ],
};

const ALL_STOCKS = Object.entries(STOCK_UNIVERSE).flatMap(([group, stocks]) =>
  stocks.map(s => ({ ...s, group }))
);

const SECTIONS = [
  { id:"markets",  label:"Markets & Equities",  icon:"📈", color:"#c9a84c" },
  { id:"economy",  label:"Economy & Policy",     icon:"🏛️", color:"#7eb8d4" },
  { id:"personal", label:"Personal Finance",     icon:"💰", color:"#7ec49a" },
  { id:"tech",     label:"Tech & Innovation",    icon:"⚡", color:"#a98cf5" },
  { id:"global",   label:"Global & Geopolitics", icon:"🌐", color:"#e8956a" },
];

const FOCUS_AREAS = [
  { id:"macro",      label:"Macro Trends",      desc:"Central bank moves, inflation, GDP, yield curves",         icon:"🔭" },
  { id:"earnings",   label:"Earnings Watch",    desc:"Quarterly results, guidance, analyst upgrades/downgrades", icon:"📊" },
  { id:"regulatory", label:"Regulatory Radar",  desc:"Policy shifts, antitrust, financial regulation, ESG",     icon:"⚖️" },
  { id:"sectors",    label:"Sector Spotlight",  desc:"Energy, financials, healthcare, real estate deep dives",  icon:"🔬" },
  { id:"wealth",     label:"Wealth Building",   desc:"ETFs, dividends, long-term investing strategies",         icon:"🏆" },
  { id:"risk",       label:"Risk & Volatility", desc:"VIX, credit spreads, geopolitical tail risks, hedging",   icon:"⚠️" },
];

const TABS = [
  { id:"briefing",  label:"Briefing",  icon:"📰" },
  { id:"sections",  label:"Sections",  icon:"📂" },
  { id:"focus",     label:"Focus",     icon:"🔬" },
  { id:"watchlist", label:"Watchlist", icon:"⭐" },
  { id:"earnings",  label:"Earnings",  icon:"📊" },
];

const GROUP_COLORS = {
  "US – Mega Cap Tech":               "#7eb8d4",
  "US – Finance":                     "#c9a84c",
  "US – Other Majors":                "#7ec49a",
  "Indonesia – Banks":                "#e8956a",
  "Indonesia – Telco & Tech":         "#a98cf5",
  "Indonesia – Energy & Mining":      "#e87070",
  "Indonesia – Consumer & Industry":  "#5ecf7a",
  "Major Indices":                    "#c9a84c",
  "Commodities & FX":                 "#8a8a8a",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const flagFor = (g="") => g.startsWith("US") ? "🇺🇸" : g.startsWith("Indonesia") ? "🇮🇩" : g==="Major Indices" ? "🌐" : "📊";

const signalColor = (s="") => {
  const v = s.toLowerCase();
  if (["bullish","positive","beat","up","strong","buy"].some(k=>v.includes(k))) return "#5ecf7a";
  if (["bearish","negative","miss","down","weak","sell"].some(k=>v.includes(k))) return "#e87070";
  return "#8a8a8a";
};

function extractJSON(text) {
  try { return JSON.parse(text.trim()); } catch {}
  const stripped = text.replace(/^```(?:json)?\s*/m,"").replace(/\s*```\s*$/m,"").trim();
  try { return JSON.parse(stripped); } catch {}
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s!==-1 && e!==-1) try { return JSON.parse(text.slice(s,e+1)); } catch {}
  throw new Error("JSON parse failed: " + text.slice(0,120));
}

const nowStr = () => new Date().toLocaleString("en-AU",{
  weekday:"short", day:"numeric", month:"short", year:"numeric",
  hour:"2-digit", minute:"2-digit"
});

// ── Claude API ────────────────────────────────────────────────────────────────
async function callClaude(prompt, useSearch=false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role:"user", content:prompt }],
  };
  if (useSearch) body.tools = [{ type:"web_search_20250305", name:"web_search" }];
  const res  = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
}

// ── Briefing ──────────────────────────────────────────────────────────────────
async function fetchBriefing(timestamp) {
  const text = await callClaude(
`You are a senior financial editor. Current time: ${timestamp}.

Search the web right now for the latest real financial headlines from Reuters, Yahoo Finance, MarketWatch, Forbes, CNN Business, Nasdaq, Investopedia, Kiplinger, Business Insider and Seeking Alpha.

Use ONLY real headlines you actually find. Do not invent or fabricate anything.

Return ONLY a raw JSON object — absolutely no markdown, no code fences, no explanation before or after:
{
  "topStory":{"headline":"...","summary":"2-3 sentence summary","source":"source name"},
  "sections":{
    "markets":{"headlines":[{"title":"...","source":"...","signal":"bullish|bearish|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence market mood"},
    "economy":{"headlines":[{"title":"...","source":"...","signal":"positive|negative|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "personal":{"headlines":[{"title":"...","source":"...","signal":"opportunity|caution|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "tech":{"headlines":[{"title":"...","source":"...","signal":"bullish|bearish|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "global":{"headlines":[{"title":"...","source":"...","signal":"positive|negative|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"}
  },
  "focusAreas":{
    "macro":"2 sentences based on what you found",
    "earnings":"2 sentences based on what you found",
    "regulatory":"2 sentences based on what you found",
    "sectors":"2 sentences based on what you found",
    "wealth":"2 actionable sentences based on what you found",
    "risk":"2 sentences on risks based on what you found"
  },
  "watchlist":["short watch phrase 1","short watch phrase 2","short watch phrase 3","short watch phrase 4"]
}`,
  true
  );
  return extractJSON(text);
}

// ── Earnings ──────────────────────────────────────────────────────────────────
async function fetchEarnings(watchlist, timestamp) {
  const tickers = watchlist.map(w=>`${w.ticker} (${w.name})`).join(", ");
  const text = await callClaude(
`Current time: ${timestamp}.

Search the web for the latest stock data for these tickers: ${tickers}.

For each find: current or most recent price, today's percentage change, recent earnings result (beat/miss/in-line if a stock), next earnings date if available, and a 1-sentence analyst or market sentiment.

Return ONLY a raw JSON object — no markdown, no code fences:
{
  "updatedAt":"HH:MM",
  "stocks":[
    {
      "ticker":"...",
      "name":"...",
      "price":"...",
      "currency":"USD|IDR",
      "change":"+1.23%",
      "direction":"up|down|flat",
      "recentEarnings":"short description or N/A",
      "nextEarnings":"date or N/A",
      "sentiment":"1 sentence",
      "signal":"bullish|bearish|neutral"
    }
  ],
  "summary":"2-3 sentence overall watchlist summary"
}`,
  true
  );
  return extractJSON(text);
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(()=>{
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  },[]);
  return mob;
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock({ isMobile }) {
  const [t, setT] = useState(new Date());
  useEffect(()=>{ const id=setInterval(()=>setT(new Date()),1000); return()=>clearInterval(id); },[]);
  return (
    <div style={{ textAlign:"right" }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:isMobile?14:18, color:"#e2ddd4", letterSpacing:".02em" }}>
        {t.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
      </div>
      {!isMobile && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#333", marginTop:3, letterSpacing:".1em" }}>
          {t.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────
function Spinner({ label }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"64px 0" }}>
      <div className="k-spin" />
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", letterSpacing:".14em", textAlign:"center", maxWidth:260 }}>
        {label}
      </p>
    </div>
  );
}

function SignalDot({ signal }) {
  return (
    <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%",
      background:signalColor(signal), marginRight:9, flexShrink:0, marginTop:7 }} />
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#383838",
      letterSpacing:".16em", marginBottom:11 }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Kabar() {
  const isMobile = useIsMobile();
  const px = isMobile ? "16px" : "32px";

  // ── state ──────────────────────────────────────────────────────────────────
  const [tab,           setTab]           = useState("briefing");
  const [briefing,      setBriefing]      = useState(null);
  const [briefPhase,    setBriefPhase]    = useState("idle");
  const [briefTime,     setBriefTime]     = useState(null);
  const [activeSection, setActiveSection] = useState("markets");
  const [activeFocus,   setActiveFocus]   = useState(null);

  const [watchlist, setWatchlist] = useState([
    { ticker:"^GSPC",   name:"S&P 500",         group:"Major Indices"            },
    { ticker:"^JKSE",   name:"IDX (IHSG)",       group:"Major Indices"            },
    { ticker:"AAPL",    name:"Apple",            group:"US – Mega Cap Tech"       },
    { ticker:"NVDA",    name:"NVIDIA",           group:"US – Mega Cap Tech"       },
    { ticker:"BBCA.JK", name:"BCA",              group:"Indonesia – Banks"        },
    { ticker:"TLKM.JK", name:"Telkom Indonesia", group:"Indonesia – Telco & Tech" },
  ]);

  const [earningsData,  setEarningsData]  = useState(null);
  const [earningsPhase, setEarningsPhase] = useState("idle");
  const [earningsTime,  setEarningsTime]  = useState(null);
  const [search,        setSearch]        = useState("");
  const [activeGroup,   setActiveGroup]   = useState("Major Indices");

  // ── watchlist helpers ──────────────────────────────────────────────────────
  const inWatchlist = (ticker) => watchlist.some(w=>w.ticker===ticker);
  const toggleWatch = (stock)  => setWatchlist(prev =>
    inWatchlist(stock.ticker) ? prev.filter(w=>w.ticker!==stock.ticker) : [...prev,stock]
  );

  const searchResults = useMemo(()=>{
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_STOCKS.filter(s=>s.ticker.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)).slice(0,8);
  },[search]);

  // ── actions ────────────────────────────────────────────────────────────────
  const generateBriefing = async () => {
    setBriefPhase("loading"); setBriefing(null);
    try {
      const ts = nowStr();
      setBriefing(await fetchBriefing(ts));
      setBriefTime(ts);
      setBriefPhase("done");
    } catch(e) { console.error(e); setBriefPhase("error"); }
  };

  const runEarnings = async () => {
    if (!watchlist.length) return;
    setEarningsPhase("loading"); setEarningsData(null);
    try {
      const ts = nowStr();
      setEarningsData(await fetchEarnings(watchlist, ts));
      setEarningsTime(ts);
      setEarningsPhase("done");
    } catch(e) { console.error(e); setEarningsPhase("error"); }
  };

  // ── grid helpers ───────────────────────────────────────────────────────────
  const col2 = isMobile ? "1fr" : "1fr 1fr";
  const col3 = isMobile ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ minHeight:"100vh", background:"#0c0d0f", color:"#e2ddd4", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        .k-spin{width:24px;height:24px;border:1.5px solid #1e1e1e;border-top-color:#c9a84c;border-radius:50%;animation:ks .75s linear infinite;}
        @keyframes ks{to{transform:rotate(360deg);}}

        .k-tab{background:none;border:none;cursor:pointer;color:#444;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;padding:12px 16px;border-bottom:1.5px solid transparent;transition:color .15s,border-color .15s;white-space:nowrap;}
        .k-tab:hover{color:#c9a84c;}
        .k-tab.on{color:#c9a84c;border-bottom-color:#c9a84c;}

        .k-mob-bar{position:fixed;bottom:0;left:0;right:0;background:#0e0f11;border-top:1px solid #1c1c1e;display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0px);}
        .k-mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 2px 6px;background:none;border:none;cursor:pointer;color:#3a3a3a;gap:3px;transition:color .15s;}
        .k-mob-tab.on{color:#c9a84c;}
        .k-mob-tab .ico{font-size:19px;line-height:1;}
        .k-mob-tab .lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.07em;text-transform:uppercase;}

        .k-btn{background:#c9a84c;color:#0c0d0f;border:none;cursor:pointer;padding:11px 26px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:500;border-radius:2px;transition:background .15s;}
        .k-btn:hover{background:#ddb95a;}
        .k-btn:disabled{opacity:.35;cursor:not-allowed;}
        .k-btn.sm{padding:7px 16px;font-size:10px;}
        .k-btn.ghost{background:transparent;border:1px solid #c9a84c44;color:#c9a84c;}
        .k-btn.ghost:hover{background:#16130a;border-color:#c9a84c;}
        .k-btn.full{width:100%;}

        .k-pill{background:none;border:1px solid #222;cursor:pointer;padding:6px 13px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:#555;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;}
        .k-pill:hover{border-color:#444;color:#999;}
        .k-pill.on{color:#0c0d0f;border-color:transparent;}

        .k-card{background:#111214;border:1px solid #1c1c1e;border-radius:3px;padding:16px;transition:border-color .15s;}
        .k-card.click{cursor:pointer;}
        .k-card.click:hover{border-color:#2a2a2a;}

        .k-fcard{background:#111214;border:1px solid #1c1c1e;border-radius:3px;padding:16px;cursor:pointer;transition:all .15s;}
        .k-fcard:hover{border-color:#2e2e2e;background:#161719;}
        .k-fcard.on{border-color:#c9a84c55;background:#15120a;}

        .k-input{width:100%;background:#111214;border:1px solid #222;border-radius:2px;padding:10px 13px;color:#e2ddd4;font-family:'DM Mono',monospace;font-size:12px;outline:none;letter-spacing:.05em;transition:border-color .15s;}
        .k-input:focus{border-color:#3a3a3a;}
        .k-input::placeholder{color:#2e2e2e;}

        .k-gtab{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.07em;color:#444;padding:5px 11px;border-radius:2px;transition:all .15s;white-space:nowrap;}
        .k-gtab:hover{color:#999;background:#141516;}
        .k-gtab.on{color:#c9a84c;background:#15120a;}

        .k-add{width:28px;height:28px;border-radius:50%;border:1px solid #252525;background:none;cursor:pointer;color:#555;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
        .k-add:hover{border-color:#c9a84c;color:#c9a84c;}
        .k-add.in{border-color:#5ecf7a44;color:#5ecf7a;background:#091509;}

        .k-rm{background:none;border:none;cursor:pointer;color:#2e2e2e;font-size:15px;line-height:1;padding:2px 5px;border-radius:2px;transition:color .15s;}
        .k-rm:hover{color:#e87070;}

        .hl-row{display:flex;align-items:flex-start;padding:12px 0;border-bottom:1px solid #161616;}
        .hl-row:last-child{border-bottom:none;}

        .w-tag{background:#15120a;border:1px solid #c9a84c1a;padding:5px 12px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;color:#c9a84c;letter-spacing:.06em;}

        .divider{border:none;border-top:1px solid #161616;margin:24px 0;}

        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#0c0d0f;}
        ::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px;}
      `}</style>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header style={{ borderBottom:"1px solid #181818", padding:`0 ${px}`,
        position:"sticky", top:0, background:"#0c0d0f", zIndex:50 }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>

          {/* Masthead row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding: isMobile ? "12px 0 10px" : "16px 0 12px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:isMobile?24:30,
                  fontWeight:700, color:"#e2ddd4", letterSpacing:".06em", lineHeight:1 }}>
                  KABAR
                </span>
                {!isMobile && (
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                    color:"#c9a84c", letterSpacing:".18em" }}>
                    FINANCIAL INTELLIGENCE
                  </span>
                )}
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                color:"#2e2e2e", letterSpacing:".12em", marginTop:4 }}>
                🇺🇸 US · 🇮🇩 INDONESIA · 🌐 GLOBAL
              </div>
            </div>
            <LiveClock isMobile={isMobile} />
          </div>

          {/* Desktop tab bar */}
          {!isMobile && (
            <div style={{ display:"flex" }}>
              {TABS.map(t=>(
                <button key={t.id} className={`k-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
                  {t.icon} {t.id==="watchlist" ? `Watchlist (${watchlist.length})` : t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main style={{ maxWidth:960, margin:"0 auto",
        padding:`${isMobile?"20px":"32px"} ${px}`,
        paddingBottom: isMobile ? "88px" : "40px" }}>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* BRIEFING                                                        */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab==="briefing" && (
          <div>
            {/* Action row */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
              <div>
                {briefTime && (
                  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                    color:"#383838", letterSpacing:".12em" }}>
                    GENERATED · {briefTime.toUpperCase()}
                  </p>
                )}
              </div>
              {(briefPhase==="idle"||briefPhase==="done"||briefPhase==="error") && (
                <button
                  className={`k-btn sm${isMobile?" full":""}`}
                  onClick={generateBriefing}>
                  {briefPhase==="done" ? "↻ Regenerate" : "Generate Briefing"}
                </button>
              )}
            </div>

            {/* Idle state */}
            {briefPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"72px 0" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:isMobile?22:28,
                  color:"#2a2a2a", fontStyle:"normal", marginBottom:12, fontWeight:600 }}>
                  What's moving the markets?
                </div>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                  color:"#2a2a2a", letterSpacing:".14em", marginBottom:32 }}>
                  CLAUDE SEARCHES 10 LIVE FINANCIAL SOURCES
                </p>
                <button className="k-btn" onClick={generateBriefing}>
                  Generate Briefing Now
                </button>
              </div>
            )}

            {briefPhase==="loading" && (
              <Spinner label="SEARCHING LIVE FINANCIAL NEWS ACROSS 10 SOURCES…" />
            )}

            {briefPhase==="error" && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                  color:"#e87070", marginBottom:16, letterSpacing:".1em" }}>
                  SOMETHING WENT WRONG · CHECK YOUR API KEY OR CREDITS
                </p>
                <button className="k-btn" onClick={generateBriefing}>Retry</button>
              </div>
            )}

            {briefPhase==="done" && briefing && (
              <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

                {/* Top story */}
                <div style={{ borderLeft:"2px solid #c9a84c", paddingLeft:20 }}>
                  <SectionLabel>★ TOP STORY</SectionLabel>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:isMobile?21:26,
                    fontWeight:700, lineHeight:1.25, color:"#e2ddd4", marginBottom:14 }}>
                    {briefing.topStory?.headline}
                  </h2>
                  <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:isMobile?13:14,
                    color:"#888", lineHeight:1.8, marginBottom:10 }}>
                    {briefing.topStory?.summary}
                  </p>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                    color:"#333", letterSpacing:".12em" }}>
                    VIA {briefing.topStory?.source?.toUpperCase()}
                  </span>
                </div>

                {/* Snapshots grid */}
                <div>
                  <SectionLabel>SECTION SNAPSHOTS — TAP TO EXPLORE</SectionLabel>
                  <div style={{ display:"grid", gridTemplateColumns:col2, gap:9 }}>
                    {SECTIONS.map(sec=>{
                      const d = briefing.sections?.[sec.id];
                      return (
                        <div key={sec.id} className="k-card click"
                          onClick={()=>{ setTab("sections"); setActiveSection(sec.id); }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:15 }}>{sec.icon}</span>
                            <div style={{ width:5, height:5, borderRadius:"50%",
                              background:sec.color, marginTop:4 }} />
                          </div>
                          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                            color:sec.color, letterSpacing:".12em", margin:"10px 0 6px" }}>
                            {sec.label.toUpperCase()}
                          </div>
                          <p style={{ fontFamily:"'Source Serif 4',serif",
                            fontSize:11, color:"#666", lineHeight:1.6 }}>
                            {d?.snapshot || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Watch today */}
                {briefing.watchlist?.length > 0 && (
                  <div>
                    <SectionLabel>👁 WATCH TODAY</SectionLabel>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {[briefing.watchlist].flat().map((w,i)=>(
                        <span key={i} className="w-tag">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"10px 14px",
                  background:"#111214", border:"1px solid #1c1c1e",
                  borderRadius:3, flexWrap:"wrap", gap:6 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#2e2e2e" }}>
                    📡 LIVE WEB SEARCH · 10 SOURCES · NO RSS
                  </span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#222" }}>
                    {briefTime}
                  </span>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SECTIONS                                                        */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab==="sections" && (
          <div>
            {!briefing ? (
              <div style={{ textAlign:"center", padding:"56px 0" }}>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                  color:"#383838", marginBottom:22, letterSpacing:".12em" }}>
                  GENERATE A BRIEFING FIRST
                </p>
                <button className="k-btn"
                  onClick={()=>{ generateBriefing(); setTab("briefing"); }}>
                  Generate Now
                </button>
              </div>
            ) : (
              <div>
                {/* Section pills */}
                <div style={{ display:"flex", gap:7,
                  flexWrap: isMobile?"nowrap":"wrap",
                  overflowX: isMobile?"auto":"visible",
                  marginBottom:24, paddingBottom: isMobile?4:0 }}>
                  {SECTIONS.map(sec=>(
                    <button key={sec.id}
                      className={`k-pill ${activeSection===sec.id?"on":""}`}
                      style={activeSection===sec.id?{background:sec.color}:{}}
                      onClick={()=>setActiveSection(sec.id)}>
                      {sec.icon}{!isMobile&&" "+sec.label}
                    </button>
                  ))}
                </div>

                {SECTIONS.filter(s=>s.id===activeSection).map(sec=>{
                  const d = briefing.sections?.[sec.id];
                  return (
                    <div key={sec.id}>
                      <h3 style={{ fontFamily:"'Cormorant Garamond',serif",
                        fontSize:isMobile?20:23, fontWeight:700,
                        color:sec.color, marginBottom:6 }}>
                        {sec.icon} {sec.label}
                      </h3>
                      <p style={{ fontFamily:"'Source Serif 4',serif",
                        fontStyle:"italic", fontSize:12, color:"#555", marginBottom:20 }}>
                        {d?.snapshot}
                      </p>
                      <div style={{ background:"#111214", border:"1px solid #1c1c1e",
                        borderRadius:3, padding: isMobile?"4px 14px":"4px 20px" }}>
                        {(d?.headlines||[]).map((h,i)=>(
                          <div key={i} className="hl-row">
                            <SignalDot signal={h.signal} />
                            <div style={{ flex:1 }}>
                              <p style={{ fontFamily:"'Source Serif 4',serif",
                                fontSize:isMobile?12:13, color:"#ccc", lineHeight:1.6 }}>
                                {h.title}
                              </p>
                              <div style={{ display:"flex", gap:10, marginTop:5 }}>
                                <span style={{ fontFamily:"'DM Mono',monospace",
                                  fontSize:9, color:"#333" }}>{h.source}</span>
                                <span style={{ fontFamily:"'DM Mono',monospace",
                                  fontSize:9, color:signalColor(h.signal) }}>
                                  {h.signal?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FOCUS AREAS                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab==="focus" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:isMobile?20:23, fontWeight:700, color:"#e2ddd4", marginBottom:5 }}>
                Areas of Focus
              </h2>
              <p style={{ fontFamily:"'Source Serif 4',serif",
                fontStyle:"italic", fontSize:12, color:"#555" }}>
                Six standing lenses — tap any card for live insight
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:col2, gap:9, marginBottom:22 }}>
              {FOCUS_AREAS.map(fa=>(
                <div key={fa.id}
                  className={`k-fcard ${activeFocus===fa.id?"on":""}`}
                  onClick={()=>setActiveFocus(activeFocus===fa.id?null:fa.id)}>
                  <div style={{ fontSize:18, marginBottom:8 }}>{fa.icon}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                    color:"#c9a84c", letterSpacing:".12em", marginBottom:5 }}>
                    {fa.label.toUpperCase()}
                  </div>
                  <p style={{ fontFamily:"'Source Serif 4',serif",
                    fontSize:11, color:"#555", lineHeight:1.6,
                    marginBottom:activeFocus===fa.id?12:0 }}>
                    {fa.desc}
                  </p>
                  {activeFocus===fa.id && (
                    <div style={{ borderTop:"1px solid #1c1c1e", paddingTop:12 }}>
                      {briefing?.focusAreas?.[fa.id]
                        ? <p style={{ fontFamily:"'Source Serif 4',serif",
                            fontSize:12, color:"#aaa", lineHeight:1.75 }}>
                            {briefing.focusAreas[fa.id]}
                          </p>
                        : <p style={{ fontFamily:"'DM Mono',monospace",
                            fontSize:9, color:"#333" }}>
                            Generate a briefing first.
                          </p>
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!briefing && (
              <div style={{ textAlign:"center" }}>
                <button className="k-btn"
                  onClick={()=>{ generateBriefing(); setTab("briefing"); }}>
                  Generate Briefing
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* WATCHLIST                                                       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab==="watchlist" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:isMobile?20:23, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  My Watchlist
                </h2>
                <p style={{ fontFamily:"'Source Serif 4',serif",
                  fontStyle:"italic", fontSize:12, color:"#555" }}>
                  {watchlist.length} symbol{watchlist.length!==1?"s":""} tracked
                </p>
              </div>
              {watchlist.length>0 && (
                <button className="k-btn sm" onClick={()=>setTab("earnings")}>
                  Run Earnings Watch →
                </button>
              )}
            </div>

            {/* Current chips */}
            {watchlist.length>0 && (
              <div style={{ marginBottom:24 }}>
                <SectionLabel>CURRENTLY TRACKING</SectionLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {watchlist.map(w=>(
                    <div key={w.ticker} style={{ display:"flex", alignItems:"center", gap:5,
                      background:"#111214",
                      border:`1px solid ${GROUP_COLORS[w.group]||"#222"}2a`,
                      borderRadius:40, padding:"5px 10px 5px 13px" }}>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                        color:GROUP_COLORS[w.group]||"#aaa" }}>
                        {flagFor(w.group)} {w.ticker}
                      </span>
                      {!isMobile && (
                        <span style={{ fontFamily:"'Source Serif 4',serif",
                          fontSize:11, color:"#3a3a3a" }}>{w.name}</span>
                      )}
                      <button className="k-rm" onClick={()=>toggleWatch(w)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="divider" />

            {/* Search */}
            <div style={{ marginBottom:22 }}>
              <SectionLabel>SEARCH BY NAME OR TICKER</SectionLabel>
              <input className="k-input"
                placeholder="e.g. Apple, BBRI, gold, Nasdaq…"
                value={search}
                onChange={e=>setSearch(e.target.value)} />
              {searchResults.length>0 && (
                <div style={{ marginTop:7, display:"flex", flexDirection:"column", gap:3 }}>
                  {searchResults.map(s=>(
                    <div key={s.ticker} style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", background:"#111214",
                      border:"1px solid #1c1c1e", borderRadius:2, padding:"9px 13px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11,
                          color:GROUP_COLORS[s.group]||"#aaa" }}>
                          {flagFor(s.group)} {s.ticker}
                        </span>
                        <span style={{ fontFamily:"'Source Serif 4',serif",
                          fontSize:13, color:"#ccc" }}>{s.name}</span>
                        {!isMobile && (
                          <span style={{ fontFamily:"'DM Mono',monospace",
                            fontSize:9, color:"#2e2e2e" }}>{s.group}</span>
                        )}
                      </div>
                      <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`}
                        onClick={()=>toggleWatch(s)}>
                        {inWatchlist(s.ticker)?"✓":"+"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browse */}
            <SectionLabel>BROWSE BY CATEGORY</SectionLabel>
            <div style={{ display:"flex", gap:5, flexWrap:"nowrap",
              overflowX:"auto", marginBottom:14, paddingBottom:4 }}>
              {Object.keys(STOCK_UNIVERSE).map(g=>(
                <button key={g} className={`k-gtab ${activeGroup===g?"on":""}`}
                  onClick={()=>setActiveGroup(g)}>
                  {flagFor(g)} {isMobile ? (g.split("–")[1]?.trim()||g) : g}
                </button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:col3, gap:7 }}>
              {(STOCK_UNIVERSE[activeGroup]||[]).map(s=>(
                <div key={s.ticker} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", background:"#111214",
                  border:`1px solid ${inWatchlist(s.ticker)?"#5ecf7a1a":"#1c1c1e"}`,
                  borderRadius:3, padding:"9px 11px" }}>
                  <div>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                      color:inWatchlist(s.ticker)?"#5ecf7a":(GROUP_COLORS[activeGroup]||"#aaa") }}>
                      {s.ticker}
                    </div>
                    <div style={{ fontFamily:"'Source Serif 4',serif",
                      fontSize:10, color:"#444", marginTop:2, lineHeight:1.35 }}>
                      {s.name}
                    </div>
                  </div>
                  <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`}
                    onClick={()=>toggleWatch(s)}>
                    {inWatchlist(s.ticker)?"✓":"+"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* EARNINGS WATCH                                                  */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {tab==="earnings" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:22, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:isMobile?20:23, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  Earnings Watch
                </h2>
                <p style={{ fontFamily:"'Source Serif 4',serif",
                  fontStyle:"italic", fontSize:12, color:"#555" }}>
                  Live prices · earnings results · upcoming dates · sentiment
                </p>
                {earningsTime && (
                  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                    color:"#333", marginTop:6, letterSpacing:".1em" }}>
                    UPDATED · {earningsTime.toUpperCase()}
                  </p>
                )}
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <button className="k-btn ghost sm" onClick={()=>setTab("watchlist")}>
                  Edit List
                </button>
                {watchlist.length>0 && (
                  <button className="k-btn sm" onClick={runEarnings}
                    disabled={earningsPhase==="loading"}>
                    {earningsPhase==="loading" ? "Searching…"
                      : earningsPhase==="done"    ? "↻ Refresh"
                      : "Run Now"}
                  </button>
                )}
              </div>
            </div>

            {watchlist.length===0 && (
              <div style={{ textAlign:"center", padding:"56px 0" }}>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                  color:"#383838", marginBottom:22, letterSpacing:".12em" }}>
                  YOUR WATCHLIST IS EMPTY
                </p>
                <button className="k-btn" onClick={()=>setTab("watchlist")}>
                  Build Watchlist →
                </button>
              </div>
            )}

            {watchlist.length>0 && earningsPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"56px 0" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif",
                  fontSize:isMobile?20:26, color:"#2a2a2a", fontWeight:600, marginBottom:10 }}>
                  {watchlist.length} symbol{watchlist.length!==1?"s":""} ready
                </div>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:9,
                  color:"#2a2a2a", letterSpacing:".12em", marginBottom:28 }}>
                  CLAUDE SEARCHES LIVE DATA FOR EACH SYMBOL
                </p>
                <button className="k-btn" onClick={runEarnings}>
                  Run Earnings Watch
                </button>
              </div>
            )}

            {earningsPhase==="loading" && (
              <Spinner label={`SEARCHING LIVE DATA FOR ${watchlist.length} SYMBOL${watchlist.length!==1?"S":""}…`} />
            )}

            {earningsPhase==="error" && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10,
                  color:"#e87070", marginBottom:16, letterSpacing:".1em" }}>
                  SOMETHING WENT WRONG · PLEASE RETRY
                </p>
                <button className="k-btn" onClick={runEarnings}>Retry</button>
              </div>
            )}

            {earningsPhase==="done" && earningsData && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Summary banner */}
                <div style={{ background:"#15120a", borderLeft:"2px solid #c9a84c",
                  border:"1px solid #c9a84c1a", borderRadius:3, padding:"14px 18px" }}>
                  <SectionLabel>📊 WATCHLIST SNAPSHOT</SectionLabel>
                  <p style={{ fontFamily:"'Source Serif 4',serif",
                    fontSize:isMobile?12:13, color:"#aaa", lineHeight:1.8 }}>
                    {earningsData.summary}
                  </p>
                </div>

                {/* Stock cards */}
                <div style={{ display:"grid", gridTemplateColumns:col2, gap:9 }}>
                  {(earningsData.stocks||[]).map((s,i)=>{
                    const wl     = watchlist.find(w=>w.ticker===s.ticker);
                    const gc     = GROUP_COLORS[wl?.group]||"#8a8a8a";
                    const isUp   = s.direction==="up";
                    const isDown = s.direction==="down";
                    const chgClr = isUp?"#5ecf7a":isDown?"#e87070":"#8a8a8a";
                    const sigClr = signalColor(s.signal);
                    return (
                      <div key={i} className="k-card"
                        style={{ borderColor:`${sigClr}18` }}>

                        {/* Price row */}
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"flex-start", marginBottom:10 }}>
                          <div>
                            <div style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:12, color:gc, letterSpacing:".05em" }}>
                              {flagFor(wl?.group||"")} {s.ticker}
                            </div>
                            <div style={{ fontFamily:"'Source Serif 4',serif",
                              fontSize:10, color:"#444", marginTop:2 }}>
                              {s.name}
                            </div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:isMobile?14:16, color:"#e2ddd4" }}>
                              {s.currency==="IDR"?"Rp":s.currency==="USD"?"$":""}{s.price}
                            </div>
                            <div style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:10, color:chgClr, marginTop:2 }}>
                              {isUp?"▲":isDown?"▼":"—"} {s.change}
                            </div>
                          </div>
                        </div>

                        {/* Signal badge */}
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                          background:`${sigClr}10`, border:`1px solid ${sigClr}25`,
                          borderRadius:40, padding:"3px 10px", marginBottom:12 }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:sigClr }} />
                          <span style={{ fontFamily:"'DM Mono',monospace",
                            fontSize:8, color:sigClr, letterSpacing:".12em" }}>
                            {s.signal?.toUpperCase()}
                          </span>
                        </div>

                        {s.recentEarnings && s.recentEarnings!=="N/A" && (
                          <div style={{ marginBottom:9 }}>
                            <div style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:8, color:"#2e2e2e", letterSpacing:".12em", marginBottom:4 }}>
                              RECENT EARNINGS
                            </div>
                            <p style={{ fontFamily:"'Source Serif 4',serif",
                              fontSize:11, color:"#777", lineHeight:1.55 }}>
                              {s.recentEarnings}
                            </p>
                          </div>
                        )}

                        {s.nextEarnings && s.nextEarnings!=="N/A" && (
                          <div style={{ marginBottom:9 }}>
                            <div style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:8, color:"#2e2e2e", letterSpacing:".12em", marginBottom:4 }}>
                              NEXT EARNINGS
                            </div>
                            <span style={{ fontFamily:"'DM Mono',monospace",
                              fontSize:9, color:"#c9a84c" }}>
                              📅 {s.nextEarnings}
                            </span>
                          </div>
                        )}

                        {s.sentiment && (
                          <div style={{ borderTop:"1px solid #161616", paddingTop:9, marginTop:4 }}>
                            <p style={{ fontFamily:"'Source Serif 4',serif",
                              fontStyle:"italic", fontSize:11, color:"#555", lineHeight:1.6 }}>
                              {s.sentiment}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:8,
                  color:"#1e1e1e", textAlign:"center", letterSpacing:".1em", paddingTop:4 }}>
                  FOR INFORMATION ONLY · NOT FINANCIAL ADVICE
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Mobile bottom nav ──────────────────────────────────────────────── */}
      {isMobile && (
        <nav className="k-mob-bar">
          {TABS.map(t=>(
            <button key={t.id}
              className={`k-mob-tab ${tab===t.id?"on":""}`}
              onClick={()=>setTab(t.id)}>
              <span className="ico">{t.icon}</span>
              <span className="lbl">
                {t.id==="watchlist" ? `List(${watchlist.length})` : t.label}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
