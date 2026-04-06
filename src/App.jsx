import { useState, useMemo, useEffect } from "react";

// ── RSS Sources ───────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  { name: "Reuters",          url: "https://feeds.reuters.com/reuters/businessNews",                      section: "global"   },
  { name: "Yahoo Finance",    url: "https://finance.yahoo.com/news/rssindex",                             section: "markets"  },
  { name: "MarketWatch",      url: "https://feeds.marketwatch.com/marketwatch/topstories/",               section: "markets"  },
  { name: "Forbes",           url: "https://www.forbes.com/feeds/news/",                                  section: "economy"  },
  { name: "CNN Business",     url: "http://rss.cnn.com/rss/money_latest.rss",                             section: "economy"  },
  { name: "Nasdaq",           url: "https://www.nasdaq.com/feed/rssoutbound?category=stocks",             section: "markets"  },
  { name: "Investopedia",     url: "https://www.investopedia.com/feedbuilder/feed/getfeed/?feedType=rss", section: "personal" },
  { name: "Kiplinger",        url: "https://www.kiplinger.com/rss/all",                                   section: "personal" },
  { name: "Business Insider", url: "https://feeds.businessinsider.com/custom/all",                       section: "tech"     },
  { name: "Seeking Alpha",    url: "https://seekingalpha.com/market_currents.xml",                        section: "markets"  },
];
const RSS2JSON = "https://api.rss2json.com/v1/api.json?count=6&rss_url=";

// ── Stock Universe ────────────────────────────────────────────────────────────
const STOCK_UNIVERSE = {
  "US – Mega Cap Tech": [
    { ticker:"AAPL",  name:"Apple"             },
    { ticker:"MSFT",  name:"Microsoft"         },
    { ticker:"NVDA",  name:"NVIDIA"            },
    { ticker:"GOOGL", name:"Alphabet"          },
    { ticker:"META",  name:"Meta"              },
    { ticker:"AMZN",  name:"Amazon"            },
    { ticker:"TSLA",  name:"Tesla"             },
    { ticker:"AVGO",  name:"Broadcom"          },
  ],
  "US – Finance": [
    { ticker:"JPM",   name:"JPMorgan Chase"    },
    { ticker:"GS",    name:"Goldman Sachs"     },
    { ticker:"BAC",   name:"Bank of America"   },
    { ticker:"MS",    name:"Morgan Stanley"    },
    { ticker:"BRK-B", name:"Berkshire Hathaway"},
    { ticker:"V",     name:"Visa"              },
    { ticker:"MA",    name:"Mastercard"        },
  ],
  "US – Other Majors": [
    { ticker:"JNJ",   name:"Johnson & Johnson" },
    { ticker:"WMT",   name:"Walmart"           },
    { ticker:"XOM",   name:"ExxonMobil"        },
    { ticker:"UNH",   name:"UnitedHealth"      },
    { ticker:"PG",    name:"Procter & Gamble"  },
    { ticker:"HD",    name:"Home Depot"        },
    { ticker:"NFLX",  name:"Netflix"           },
    { ticker:"AMD",   name:"AMD"               },
  ],
  "Indonesia – Banks": [
    { ticker:"BBCA.JK", name:"BCA"             },
    { ticker:"BBRI.JK", name:"BRI"             },
    { ticker:"BMRI.JK", name:"Bank Mandiri"    },
    { ticker:"BBNI.JK", name:"BNI"             },
    { ticker:"BNGA.JK", name:"Bank CIMB Niaga" },
    { ticker:"BNLI.JK", name:"Bank Permata"    },
  ],
  "Indonesia – Telco & Tech": [
    { ticker:"TLKM.JK", name:"Telkom Indonesia"},
    { ticker:"EXCL.JK", name:"XL Axiata"       },
    { ticker:"ISAT.JK", name:"Indosat Ooredoo" },
    { ticker:"GOTO.JK", name:"GoTo"            },
    { ticker:"BUKA.JK", name:"Bukalapak"       },
  ],
  "Indonesia – Energy & Mining": [
    { ticker:"ADRO.JK", name:"Adaro Energy"    },
    { ticker:"BYAN.JK", name:"Bayan Resources" },
    { ticker:"PGAS.JK", name:"Perusahaan Gas"  },
    { ticker:"ANTM.JK", name:"Aneka Tambang"   },
    { ticker:"PTBA.JK", name:"Bukit Asam"      },
    { ticker:"INCO.JK", name:"Vale Indonesia"  },
  ],
  "Indonesia – Consumer & Industry": [
    { ticker:"ASII.JK", name:"Astra International"},
    { ticker:"UNVR.JK", name:"Unilever Indonesia" },
    { ticker:"ICBP.JK", name:"Indofood CBP"       },
    { ticker:"INDF.JK", name:"Indofood"           },
    { ticker:"HMSP.JK", name:"HM Sampoerna"       },
    { ticker:"KLBF.JK", name:"Kalbe Farma"        },
  ],
  "Major Indices": [
    { ticker:"^GSPC",    name:"S&P 500"             },
    { ticker:"^IXIC",    name:"Nasdaq Composite"    },
    { ticker:"^DJI",     name:"Dow Jones"           },
    { ticker:"^JKSE",    name:"IDX Composite (IHSG)"},
    { ticker:"^HSI",     name:"Hang Seng"           },
    { ticker:"^N225",    name:"Nikkei 225"          },
    { ticker:"^FTSE",    name:"FTSE 100"            },
    { ticker:"^AXJO",    name:"ASX 200"             },
  ],
  "Commodities & FX": [
    { ticker:"GC=F",     name:"Gold"                },
    { ticker:"CL=F",     name:"Crude Oil (WTI)"     },
    { ticker:"SI=F",     name:"Silver"              },
    { ticker:"EURUSD=X", name:"EUR/USD"             },
    { ticker:"USDIDR=X", name:"USD/IDR"             },
    { ticker:"DX-Y.NYB", name:"USD Index (DXY)"     },
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

const GROUP_COLORS = {
  "US – Mega Cap Tech":              "#7eb8d4",
  "US – Finance":                    "#c9a84c",
  "US – Other Majors":               "#7ec49a",
  "Indonesia – Banks":               "#e8956a",
  "Indonesia – Telco & Tech":        "#a98cf5",
  "Indonesia – Energy & Mining":     "#e87070",
  "Indonesia – Consumer & Industry": "#5ecf7a",
  "Major Indices":                   "#c9a84c",
  "Commodities & FX":                "#8a8a8a",
};

const TABS = [
  { id:"briefing",  label:"Briefing",  icon:"📰" },
  { id:"sections",  label:"Sections",  icon:"📂" },
  { id:"focus",     label:"Focus",     icon:"🔬" },
  { id:"watchlist", label:"Watchlist", icon:"⭐" },
  { id:"earnings",  label:"Earnings",  icon:"📊" },
];

function flagFor(group = "") {
  if (group.startsWith("US")) return "🇺🇸";
  if (group.startsWith("Indonesia")) return "🇮🇩";
  if (group === "Major Indices") return "🌐";
  return "📊";
}

function signalColor(s = "") {
  const v = s.toLowerCase();
  if (["bullish","positive","beat","up","strong","buy"].some(k => v.includes(k)))  return "#5ecf7a";
  if (["bearish","negative","miss","down","weak","sell"].some(k => v.includes(k))) return "#e87070";
  return "#8a8a8a";
}

function SignalDot({ signal }) {
  return <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%",
    background:signalColor(signal), marginRight:8, flexShrink:0, marginTop:6 }} />;
}

function Spinner({ label="LOADING…" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"56px 0" }}>
      <div className="k-spin" />
      <p style={{ color:"#555", fontSize:11, letterSpacing:"0.14em", fontFamily:"'DM Mono',monospace", textAlign:"center" }}>{label}</p>
    </div>
  );
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock({ isMobile }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign:"right" }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize: isMobile ? 14 : 18,
        color:"#e2ddd4", letterSpacing:".04em" }}>
        {time.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
      </div>
      {!isMobile && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#333", marginTop:3, letterSpacing:".1em" }}>
          {time.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchAllFeeds() {
  const res  = await fetch("/api/feeds");
  const data = await res.json();
  return data.items || [];
}

async function callClaude(prompt, useSearch=false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role:"user", content:prompt }],
  };
  if (useSearch) body.tools = [{ type:"web_search_20250305", name:"web_search" }];
  const res = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
  });
  const data = await res.json();
  return (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").replace(/```json|```/g,"").trim();
}

async function analyseBriefing(items, timestamp) {
  const headlines = items.map((it,i)=>
    `[${i}] SOURCE:${it.source} | SECTION:${it.section} | TITLE:${it.title} | DESC:${it.desc}`
  ).join("\n");
  return JSON.parse(await callClaude(
`You are a senior financial editor. Current time: ${timestamp}.
Below are ${items.length} LIVE headlines from free RSS feeds. Use ONLY these.

HEADLINES:
${headlines}

Respond ONLY with valid JSON, no markdown:
{
  "topStory":{"headline":"...","summary":"2-3 sentences","source":"..."},
  "sections":{
    "markets":{"headlines":[{"title":"...","source":"...","signal":"bullish|bearish|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "economy":{"headlines":[{"title":"...","source":"...","signal":"positive|negative|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "personal":{"headlines":[{"title":"...","source":"...","signal":"opportunity|caution|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "tech":{"headlines":[{"title":"...","source":"...","signal":"bullish|bearish|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"},
    "global":{"headlines":[{"title":"...","source":"...","signal":"positive|negative|neutral"},{"title":"...","source":"...","signal":"..."},{"title":"...","source":"...","signal":"..."}],"snapshot":"1 sentence"}
  },
  "focusAreas":{
    "macro":"2 sentences","earnings":"2 sentences","regulatory":"2 sentences",
    "sectors":"2 sentences","wealth":"2 sentences actionable","risk":"2 sentences"
  },
  "watchlist":["phrase1","phrase2","phrase3","phrase4"]
}`
  ));
}

async function fetchEarningsWatch(watchlist, timestamp) {
  const tickerList = watchlist.map(w=>`${w.ticker} (${w.name})`).join(", ");
  return JSON.parse(await callClaude(
`Current time: ${timestamp}. Search for latest stock data for: ${tickerList}.
For each find: current price, today % change, recent earnings (beat/miss/in-line), next earnings date, 1-sentence sentiment.

Respond ONLY with valid JSON, no markdown:
{
  "updatedAt":"HH:MM",
  "stocks":[{"ticker":"...","name":"...","price":"...","currency":"USD|IDR",
    "change":"+1.23%","direction":"up|down|flat","recentEarnings":"...",
    "nextEarnings":"...","sentiment":"...","signal":"bullish|bearish|neutral"}],
  "summary":"2-3 sentence overall summary"
}`, true
  ));
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Kabar() {
  const isMobile = useIsMobile();
  const [tab,           setTab]           = useState("briefing");
  const [briefing,      setBriefing]      = useState(null);
  const [rawCount,      setRawCount]      = useState(0);
  const [briefPhase,    setBriefPhase]    = useState("idle");
  const [briefTime,     setBriefTime]     = useState(null);
  const [activeSection, setActiveSection] = useState("markets");
  const [activeFocus,   setActiveFocus]   = useState(null);
  const [watchlist,     setWatchlist]     = useState([
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

  const nowStr = () => new Date().toLocaleString("en-AU", {
    weekday:"short", day:"numeric", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_STOCKS.filter(s =>
      s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const inWatchlist  = (ticker) => watchlist.some(w => w.ticker === ticker);
  const toggleWatch  = (stock)  => setWatchlist(prev =>
    inWatchlist(stock.ticker) ? prev.filter(w=>w.ticker!==stock.ticker) : [...prev, stock]
  );

  const generateBriefing = async () => {
    setBriefPhase("fetching"); setBriefing(null);
    try {
      const items = await fetchAllFeeds();
      setRawCount(items.length);
      setBriefPhase("analysing");
      const ts = nowStr();
      setBriefing(await analyseBriefing(items, ts));
      setBriefTime(ts);
      setBriefPhase("done");
    } catch(e) { console.error(e); setBriefPhase("error"); }
  };

  const runEarnings = async () => {
    if (!watchlist.length) return;
    setEarningsPhase("loading"); setEarningsData(null);
    try {
      const ts = nowStr();
      setEarningsData(await fetchEarningsWatch(watchlist, ts));
      setEarningsTime(ts);
      setEarningsPhase("done");
    } catch(e) { console.error(e); setEarningsPhase("error"); }
  };

  // ── layout values ──────────────────────────────────────────────────────────
  const px        = isMobile ? "16px" : "28px";
  const maxW      = "960px";
  const gridCols  = isMobile ? "1fr" : "1fr 1fr";
  const grid3Cols = isMobile ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ minHeight:"100vh", background:"#0c0d0f", color:"#e2ddd4", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        .k-spin{width:24px;height:24px;border:1.5px solid #222;border-top-color:#c9a84c;border-radius:50%;animation:kspin .7s linear infinite;}
        @keyframes kspin{to{transform:rotate(360deg);}}

        /* Desktop tabs – horizontal strip under header */
        .k-tab{background:none;border:none;cursor:pointer;color:#484848;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;padding:11px 16px;border-bottom:1.5px solid transparent;transition:all .18s;white-space:nowrap;}
        .k-tab:hover{color:#c9a84c;}
        .k-tab.on{color:#c9a84c;border-bottom-color:#c9a84c;}

        /* Mobile tabs – fixed bottom bar */
        .k-mob-bar{position:fixed;bottom:0;left:0;right:0;background:#0f1012;border-top:1px solid #1c1c1e;display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom);}
        .k-mob-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 4px 6px;gap:3px;background:none;border:none;cursor:pointer;color:#444;transition:color .15s;}
        .k-mob-tab.on{color:#c9a84c;}
        .k-mob-tab span.icon{font-size:18px;line-height:1;}
        .k-mob-tab span.label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.08em;text-transform:uppercase;}

        .k-btn{background:#c9a84c;color:#0c0d0f;border:none;cursor:pointer;padding:11px 26px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:500;border-radius:2px;transition:all .18s;}
        .k-btn:hover{background:#e8c96a;}
        .k-btn:disabled{opacity:.4;cursor:not-allowed;}
        .k-btn.sm{padding:7px 16px;font-size:10px;}
        .k-btn.ghost{background:transparent;border:1px solid #c9a84c;color:#c9a84c;}
        .k-btn.ghost:hover{background:#1a1608;}
        .k-btn.full{width:100%;}

        .k-pill{display:flex;align-items:center;gap:5px;background:none;border:1px solid #222;cursor:pointer;padding:6px 13px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:#555;transition:all .18s;white-space:nowrap;}
        .k-pill:hover{border-color:#444;color:#aaa;}
        .k-pill.on{color:#0c0d0f;border-color:transparent;}

        .k-card{background:#121315;border:1px solid #1c1c1e;border-radius:3px;padding:16px;transition:border-color .18s;}
        .k-card.click{cursor:pointer;}
        .k-card.click:hover{border-color:#2e2e2e;}

        .k-fcard{background:#121315;border:1px solid #1c1c1e;border-radius:3px;padding:16px;cursor:pointer;transition:all .18s;}
        .k-fcard:hover{border-color:#333;background:#181a1c;}
        .k-fcard.on{border-color:#c9a84c;background:#16130a;}

        .k-input{width:100%;background:#121315;border:1px solid #222;border-radius:2px;padding:10px 13px;color:#e2ddd4;font-family:'DM Mono',monospace;font-size:12px;outline:none;letter-spacing:.05em;}
        .k-input:focus{border-color:#3a3a3a;}
        .k-input::placeholder{color:#333;}

        .k-gtab{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.07em;color:#484848;padding:5px 11px;border-radius:2px;transition:all .18s;white-space:nowrap;}
        .k-gtab:hover{color:#aaa;background:#141516;}
        .k-gtab.on{color:#c9a84c;background:#16130a;}

        .k-add{width:28px;height:28px;border-radius:50%;border:1px solid #2a2a2a;background:none;cursor:pointer;color:#555;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0;}
        .k-add:hover{border-color:#c9a84c;color:#c9a84c;}
        .k-add.in{border-color:#5ecf7a33;color:#5ecf7a;background:#0a180f;}

        .k-rm{background:none;border:none;cursor:pointer;color:#333;font-size:15px;line-height:1;padding:1px 5px;border-radius:2px;transition:color .15s;}
        .k-rm:hover{color:#e87070;}

        .hl-row{display:flex;align-items:flex-start;padding:12px 0;border-bottom:1px solid #181818;}
        .hl-row:last-child{border-bottom:none;}

        .w-tag{background:#16130a;border:1px solid #c9a84c22;padding:4px 11px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;color:#c9a84c;letter-spacing:.06em;}

        .mono{font-family:'DM Mono',monospace;}
        .serif{font-family:'Source Serif 4',serif;}
        .display{font-family:'Cormorant Garamond',serif;}

        /* Mobile-specific overrides */
        @media(max-width:767px){
          .k-card{padding:12px;}
          .k-fcard{padding:12px;}
        }

        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#0c0d0f;}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid #181818", padding:`0 ${px}`, position:"sticky", top:0,
        background:"#0c0d0f", zIndex:50 }}>
        <div style={{ maxWidth:maxW, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding: isMobile ? "12px 0 10px" : "16px 0 12px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span className="display" style={{ fontSize: isMobile ? 26 : 32, fontWeight:700,
                  color:"#e2ddd4", letterSpacing:".04em", lineHeight:1 }}>
                  KABAR
                </span>
                {!isMobile && (
                  <span className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".16em", paddingBottom:2 }}>
                    FINANCIAL INTELLIGENCE
                  </span>
                )}
              </div>
              <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".1em", marginTop:3 }}>
                🇺🇸 US · 🇮🇩 IDX · 🌐 GLOBAL
              </div>
            </div>
            <LiveClock isMobile={isMobile} />
          </div>

          {/* Desktop tab bar */}
          {!isMobile && (
            <div style={{ display:"flex", overflowX:"auto" }}>
              {TABS.map(t => (
                <button key={t.id} className={`k-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
                  {t.icon} {t.id==="watchlist" ? `Watchlist (${watchlist.length})` : t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth:maxW, margin:"0 auto", padding:`${isMobile?"20px":"28px"} ${px}`,
        paddingBottom: isMobile ? "80px" : px }}>

        {/* ══ BRIEFING ══════════════════════════════════════════════════════ */}
        {tab==="briefing" && (
          <div>
            {/* Top bar with timestamp + button */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                {briefTime && (
                  <p className="mono" style={{ fontSize:9, color:"#444", letterSpacing:".12em" }}>
                    LAST GENERATED · {briefTime.toUpperCase()}
                  </p>
                )}
              </div>
              {(briefPhase==="idle"||briefPhase==="done") && (
                <button className={`k-btn sm ${isMobile?"full":""}`} onClick={generateBriefing}>
                  {briefPhase==="done" ? "↻ Regenerate Now" : "Generate Briefing Now"}
                </button>
              )}
            </div>

            {briefPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"52px 0" }}>
                <div className="display" style={{ fontSize: isMobile?22:28, color:"#333",
                  fontStyle:"italic", fontWeight:400, marginBottom:10 }}>
                  What's moving the markets?
                </div>
                <p className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:28 }}>
                  LIVE RSS FROM 10 FREE SOURCES · CLAUDE CURATES INSTANTLY
                </p>
                <button className="k-btn" onClick={generateBriefing}>Generate Briefing Now</button>
              </div>
            )}

            {briefPhase==="fetching"  && <Spinner label="FETCHING LIVE RSS FEEDS…" />}
            {briefPhase==="analysing" && <Spinner label={`CLAUDE CURATING ${rawCount} HEADLINES…`} />}
            {briefPhase==="error" && (
              <div style={{ textAlign:"center", padding:"36px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#e87070", marginBottom:14 }}>Something went wrong. Please retry.</p>
                <button className="k-btn" onClick={generateBriefing}>Retry</button>
              </div>
            )}

            {briefPhase==="done" && briefing && (
              <div style={{ display:"flex", flexDirection:"column", gap: isMobile?20:26 }}>

                {/* Top Story */}
                <div style={{ borderLeft:"2px solid #c9a84c", paddingLeft:18 }}>
                  <div className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".16em", marginBottom:10 }}>
                    ★ TOP STORY
                  </div>
                  <h2 className="display" style={{ fontSize: isMobile?20:24, fontWeight:700,
                    lineHeight:1.25, color:"#e2ddd4", marginBottom:12 }}>
                    {briefing.topStory?.headline}
                  </h2>
                  <p className="serif" style={{ fontSize: isMobile?13:14, color:"#888", lineHeight:1.75, marginBottom:8 }}>
                    {briefing.topStory?.summary}
                  </p>
                  <span className="mono" style={{ fontSize:9, color:"#3a3a3a", letterSpacing:".12em" }}>
                    VIA {briefing.topStory?.source?.toUpperCase()}
                  </span>
                </div>

                {/* Section Snapshots */}
                <div>
                  <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".14em", marginBottom:12 }}>
                    SECTION SNAPSHOTS
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:8 }}>
                    {SECTIONS.map(sec => {
                      const d = briefing.sections?.[sec.id];
                      return (
                        <div key={sec.id} className="k-card click"
                          onClick={()=>{ setTab("sections"); setActiveSection(sec.id); }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:14 }}>{sec.icon}</span>
                            <div style={{ width:5, height:5, borderRadius:"50%", background:sec.color, marginTop:3 }} />
                          </div>
                          <div className="mono" style={{ fontSize:9, color:sec.color, letterSpacing:".12em", margin:"9px 0 5px" }}>
                            {sec.label.toUpperCase()}
                          </div>
                          <p className="serif" style={{ fontSize:11, color:"#666", lineHeight:1.55 }}>
                            {d?.snapshot || "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Watch Today */}
                {briefing.watchlist?.length > 0 && (
                  <div>
                    <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".14em", marginBottom:10 }}>
                      👁 WATCH TODAY
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {[briefing.watchlist].flat().map((w,i)=>(
                        <span key={i} className="w-tag">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"10px 14px", background:"#121315", border:"1px solid #1c1c1e", borderRadius:3,
                  flexWrap:"wrap", gap:6 }}>
                  <span className="mono" style={{ fontSize:9, color:"#333" }}>
                    📡 {rawCount} HEADLINES · 10 FREE SOURCES
                  </span>
                  <span className="mono" style={{ fontSize:9, color:"#2a2a2a" }}>{briefTime}</span>
                </div>

                <div style={{ textAlign: isMobile?"center":"left" }}>
                  <button className={`k-btn sm ${isMobile?"full":""}`} onClick={generateBriefing}>↻ Regenerate</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SECTIONS ══════════════════════════════════════════════════════ */}
        {tab==="sections" && (
          <div>
            {!briefing ? (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#444", marginBottom:20 }}>GENERATE A BRIEFING FIRST</p>
                <button className="k-btn" onClick={()=>{ generateBriefing(); setTab("briefing"); }}>Generate Now</button>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", gap:7, flexWrap: isMobile?"nowrap":"wrap",
                  overflowX: isMobile?"auto":"visible", marginBottom:22, paddingBottom: isMobile?4:0 }}>
                  {SECTIONS.map(sec => (
                    <button key={sec.id} className={`k-pill ${activeSection===sec.id?"on":""}`}
                      style={activeSection===sec.id?{background:sec.color}:{}}
                      onClick={()=>setActiveSection(sec.id)}>
                      {sec.icon} {isMobile ? "" : sec.label}
                    </button>
                  ))}
                </div>
                {SECTIONS.filter(s=>s.id===activeSection).map(sec => {
                  const d = briefing.sections?.[sec.id];
                  return (
                    <div key={sec.id}>
                      <h3 className="display" style={{ fontSize: isMobile?20:22, fontWeight:700, color:sec.color, marginBottom:5 }}>
                        {sec.icon} {sec.label}
                      </h3>
                      <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555", marginBottom:18 }}>
                        {d?.snapshot}
                      </p>
                      <div style={{ background:"#121315", border:"1px solid #1c1c1e", borderRadius:3,
                        padding: isMobile?"4px 14px":"4px 18px" }}>
                        {(d?.headlines||[]).map((h,i) => (
                          <div key={i} className="hl-row">
                            <SignalDot signal={h.signal} />
                            <div style={{ flex:1 }}>
                              <p className="serif" style={{ fontSize: isMobile?12:13, color:"#ccc", lineHeight:1.55 }}>
                                {h.title}
                              </p>
                              <div style={{ display:"flex", gap:10, marginTop:5 }}>
                                <span className="mono" style={{ fontSize:9, color:"#3a3a3a" }}>{h.source}</span>
                                <span className="mono" style={{ fontSize:9, color:signalColor(h.signal) }}>
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

        {/* ══ FOCUS AREAS ═══════════════════════════════════════════════════ */}
        {tab==="focus" && (
          <div>
            <div style={{ marginBottom:18 }}>
              <h2 className="display" style={{ fontSize: isMobile?20:22, fontWeight:700, color:"#e2ddd4", marginBottom:5 }}>
                Areas of Focus
              </h2>
              <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                Six lenses — tap any card for live insight
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:9, marginBottom:20 }}>
              {FOCUS_AREAS.map(fa => (
                <div key={fa.id} className={`k-fcard ${activeFocus===fa.id?"on":""}`}
                  onClick={()=>setActiveFocus(activeFocus===fa.id?null:fa.id)}>
                  <div style={{ fontSize:17, marginBottom:7 }}>{fa.icon}</div>
                  <div className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".12em", marginBottom:5 }}>
                    {fa.label.toUpperCase()}
                  </div>
                  <p className="serif" style={{ fontSize:11, color:"#555", lineHeight:1.55,
                    marginBottom:activeFocus===fa.id?12:0 }}>
                    {fa.desc}
                  </p>
                  {activeFocus===fa.id && (
                    <div style={{ borderTop:"1px solid #1c1c1e", paddingTop:12 }}>
                      {briefing?.focusAreas?.[fa.id]
                        ? <p className="serif" style={{ fontSize:12, color:"#aaa", lineHeight:1.7 }}>
                            {briefing.focusAreas[fa.id]}
                          </p>
                        : <p className="mono" style={{ fontSize:9, color:"#333" }}>
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
                <button className="k-btn" onClick={()=>{ generateBriefing(); setTab("briefing"); }}>
                  Generate Briefing
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ WATCHLIST ═════════════════════════════════════════════════════ */}
        {tab==="watchlist" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
              marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 className="display" style={{ fontSize: isMobile?20:22, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  My Watchlist
                </h2>
                <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                  {watchlist.length} symbol{watchlist.length!==1?"s":""} tracked
                </p>
              </div>
              {watchlist.length > 0 && (
                <button className="k-btn sm" onClick={()=>setTab("earnings")}>
                  Run Earnings Watch →
                </button>
              )}
            </div>

            {/* Current chips */}
            {watchlist.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:10 }}>
                  TRACKING
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {watchlist.map(w => (
                    <div key={w.ticker} style={{ display:"flex", alignItems:"center", gap:5,
                      background:"#121315", border:`1px solid ${GROUP_COLORS[w.group]||"#222"}33`,
                      borderRadius:40, padding:"4px 10px 4px 12px" }}>
                      <span className="mono" style={{ fontSize:10, color:GROUP_COLORS[w.group]||"#aaa" }}>
                        {flagFor(w.group)} {w.ticker}
                      </span>
                      {!isMobile && (
                        <span className="serif" style={{ fontSize:11, color:"#444" }}>{w.name}</span>
                      )}
                      <button className="k-rm" onClick={()=>toggleWatch(w)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ marginBottom:20 }}>
              <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:8 }}>
                SEARCH
              </div>
              <input className="k-input" placeholder="e.g. Apple, BBRI, gold, Nasdaq…"
                value={search} onChange={e=>setSearch(e.target.value)} />
              {searchResults.length > 0 && (
                <div style={{ marginTop:7, display:"flex", flexDirection:"column", gap:3 }}>
                  {searchResults.map(s => (
                    <div key={s.ticker} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                      background:"#121315", border:"1px solid #1c1c1e", borderRadius:2, padding:"9px 13px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span className="mono" style={{ fontSize:11, color:GROUP_COLORS[s.group]||"#aaa" }}>
                          {flagFor(s.group)} {s.ticker}
                        </span>
                        <span className="serif" style={{ fontSize:13, color:"#ccc" }}>{s.name}</span>
                      </div>
                      <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`} onClick={()=>toggleWatch(s)}>
                        {inWatchlist(s.ticker)?"✓":"+"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browse */}
            <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:9 }}>BROWSE</div>
            <div style={{ display:"flex", gap:5, flexWrap:"nowrap", overflowX:"auto",
              marginBottom:14, paddingBottom:4 }}>
              {Object.keys(STOCK_UNIVERSE).map(g => (
                <button key={g} className={`k-gtab ${activeGroup===g?"on":""}`} onClick={()=>setActiveGroup(g)}>
                  {flagFor(g)} {isMobile ? g.split("–")[1]?.trim() || g : g}
                </button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:grid3Cols, gap:7 }}>
              {(STOCK_UNIVERSE[activeGroup]||[]).map(s => (
                <div key={s.ticker} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  background:"#121315", border:`1px solid ${inWatchlist(s.ticker)?"#5ecf7a22":"#1c1c1e"}`,
                  borderRadius:3, padding:"9px 11px" }}>
                  <div>
                    <div className="mono" style={{ fontSize:10,
                      color:inWatchlist(s.ticker)?"#5ecf7a":(GROUP_COLORS[activeGroup]||"#aaa") }}>
                      {s.ticker}
                    </div>
                    <div className="serif" style={{ fontSize:10, color:"#555", marginTop:2, lineHeight:1.3 }}>
                      {s.name}
                    </div>
                  </div>
                  <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`} onClick={()=>toggleWatch(s)}>
                    {inWatchlist(s.ticker)?"✓":"+"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ EARNINGS WATCH ════════════════════════════════════════════════ */}
        {tab==="earnings" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
              marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 className="display" style={{ fontSize: isMobile?20:22, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  Earnings Watch
                </h2>
                <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                  Live prices · earnings · upcoming dates · sentiment
                </p>
                {earningsTime && (
                  <p className="mono" style={{ fontSize:9, color:"#333", marginTop:5, letterSpacing:".1em" }}>
                    UPDATED · {earningsTime.toUpperCase()}
                  </p>
                )}
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <button className="k-btn ghost sm" onClick={()=>setTab("watchlist")}>Edit List</button>
                {watchlist.length > 0 && (
                  <button className="k-btn sm" onClick={runEarnings} disabled={earningsPhase==="loading"}>
                    {earningsPhase==="loading" ? "Loading…" : earningsPhase==="done" ? "↻ Refresh" : "Run Now"}
                  </button>
                )}
              </div>
            </div>

            {watchlist.length===0 && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#444", marginBottom:20 }}>WATCHLIST IS EMPTY</p>
                <button className="k-btn" onClick={()=>setTab("watchlist")}>Build Watchlist →</button>
              </div>
            )}

            {watchlist.length>0 && earningsPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <div className="display" style={{ fontSize: isMobile?20:24, color:"#333", fontStyle:"italic", marginBottom:10 }}>
                  {watchlist.length} symbol{watchlist.length!==1?"s":""} ready
                </div>
                <p className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:28 }}>
                  CLAUDE SEARCHES LIVE DATA FOR EACH SYMBOL
                </p>
                <button className="k-btn" onClick={runEarnings}>Run Earnings Watch</button>
              </div>
            )}

            {earningsPhase==="loading" && (
              <Spinner label={`SEARCHING ${watchlist.length} SYMBOL${watchlist.length!==1?"S":""}…`} />
            )}
            {earningsPhase==="error" && (
              <div style={{ textAlign:"center", padding:"36px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#e87070", marginBottom:14 }}>Something went wrong.</p>
                <button className="k-btn" onClick={runEarnings}>Retry</button>
              </div>
            )}

            {earningsPhase==="done" && earningsData && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Summary */}
                <div style={{ background:"#14120a", border:"1px solid #c9a84c22",
                  borderLeft:"2px solid #c9a84c", borderRadius:3, padding:"14px 18px" }}>
                  <div className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".14em", marginBottom:8 }}>
                    📊 WATCHLIST SNAPSHOT
                  </div>
                  <p className="serif" style={{ fontSize: isMobile?12:13, color:"#aaa", lineHeight:1.75 }}>
                    {earningsData.summary}
                  </p>
                </div>

                {/* Stock cards */}
                <div style={{ display:"grid", gridTemplateColumns:gridCols, gap:9 }}>
                  {(earningsData.stocks||[]).map((s,i) => {
                    const wl     = watchlist.find(w=>w.ticker===s.ticker);
                    const gc     = GROUP_COLORS[wl?.group]||"#8a8a8a";
                    const isUp   = s.direction==="up";
                    const isDown = s.direction==="down";
                    const chgClr = isUp?"#5ecf7a":isDown?"#e87070":"#8a8a8a";
                    const sigClr = signalColor(s.signal);
                    return (
                      <div key={i} className="k-card" style={{ borderColor:`${sigClr}18` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                          <div>
                            <div className="mono" style={{ fontSize:12, color:gc, letterSpacing:".05em" }}>
                              {flagFor(wl?.group||"")} {s.ticker}
                            </div>
                            <div className="serif" style={{ fontSize:10, color:"#555", marginTop:2 }}>{s.name}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div className="mono" style={{ fontSize: isMobile?14:15, color:"#e2ddd4" }}>
                              {s.currency==="IDR"?"Rp":s.currency==="USD"?"$":""}{s.price}
                            </div>
                            <div className="mono" style={{ fontSize:10, color:chgClr, marginTop:2 }}>
                              {isUp?"▲":isDown?"▼":"—"} {s.change}
                            </div>
                          </div>
                        </div>

                        <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                          background:`${sigClr}12`, border:`1px solid ${sigClr}28`,
                          borderRadius:40, padding:"2px 9px", marginBottom:10 }}>
                          <div style={{ width:4, height:4, borderRadius:"50%", background:sigClr }} />
                          <span className="mono" style={{ fontSize:8, color:sigClr, letterSpacing:".1em" }}>
                            {s.signal?.toUpperCase()}
                          </span>
                        </div>

                        {s.recentEarnings && (
                          <div style={{ marginBottom:8 }}>
                            <div className="mono" style={{ fontSize:8, color:"#333", letterSpacing:".1em", marginBottom:3 }}>RECENT EARNINGS</div>
                            <p className="serif" style={{ fontSize:11, color:"#888", lineHeight:1.5 }}>{s.recentEarnings}</p>
                          </div>
                        )}
                        {s.nextEarnings && (
                          <div style={{ marginBottom:8 }}>
                            <div className="mono" style={{ fontSize:8, color:"#333", letterSpacing:".1em", marginBottom:3 }}>NEXT EARNINGS</div>
                            <span className="mono" style={{ fontSize:9, color:"#c9a84c" }}>📅 {s.nextEarnings}</span>
                          </div>
                        )}
                        {s.sentiment && (
                          <div style={{ borderTop:"1px solid #181818", paddingTop:8, marginTop:4 }}>
                            <p className="serif" style={{ fontStyle:"italic", fontSize:11, color:"#555", lineHeight:1.5 }}>
                              {s.sentiment}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mono" style={{ fontSize:8, color:"#2a2a2a", textAlign:"center", letterSpacing:".1em" }}>
                  FOR INFORMATION ONLY · NOT FINANCIAL ADVICE
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────────── */}
      {isMobile && (
        <nav className="k-mob-bar">
          {TABS.map(t => (
            <button key={t.id} className={`k-mob-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              <span className="icon">{t.icon}</span>
              <span className="label">{t.id==="watchlist" ? `List(${watchlist.length})` : t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
