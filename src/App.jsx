import { useState, useMemo } from "react";

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
    { ticker:"AAPL",  name:"Apple"            },
    { ticker:"MSFT",  name:"Microsoft"        },
    { ticker:"NVDA",  name:"NVIDIA"           },
    { ticker:"GOOGL", name:"Alphabet"         },
    { ticker:"META",  name:"Meta"             },
    { ticker:"AMZN",  name:"Amazon"           },
    { ticker:"TSLA",  name:"Tesla"            },
    { ticker:"AVGO",  name:"Broadcom"         },
  ],
  "US – Finance": [
    { ticker:"JPM",   name:"JPMorgan Chase"   },
    { ticker:"GS",    name:"Goldman Sachs"    },
    { ticker:"BAC",   name:"Bank of America"  },
    { ticker:"MS",    name:"Morgan Stanley"   },
    { ticker:"BRK-B", name:"Berkshire Hathaway"},
    { ticker:"V",     name:"Visa"             },
    { ticker:"MA",    name:"Mastercard"       },
  ],
  "US – Other Majors": [
    { ticker:"JNJ",   name:"Johnson & Johnson"},
    { ticker:"WMT",   name:"Walmart"          },
    { ticker:"XOM",   name:"ExxonMobil"       },
    { ticker:"UNH",   name:"UnitedHealth"     },
    { ticker:"PG",    name:"Procter & Gamble" },
    { ticker:"HD",    name:"Home Depot"       },
    { ticker:"NFLX",  name:"Netflix"          },
    { ticker:"AMD",   name:"AMD"              },
  ],
  "Indonesia – Banks": [
    { ticker:"BBCA.JK", name:"BCA"            },
    { ticker:"BBRI.JK", name:"BRI"            },
    { ticker:"BMRI.JK", name:"Bank Mandiri"   },
    { ticker:"BBNI.JK", name:"BNI"            },
    { ticker:"BNGA.JK", name:"Bank CIMB Niaga"},
    { ticker:"BNLI.JK", name:"Bank Permata"   },
  ],
  "Indonesia – Telco & Tech": [
    { ticker:"TLKM.JK", name:"Telkom Indonesia"},
    { ticker:"EXCL.JK",  name:"XL Axiata"     },
    { ticker:"ISAT.JK",  name:"Indosat Ooredoo"},
    { ticker:"GOTO.JK",  name:"GoTo"          },
    { ticker:"BUKA.JK",  name:"Bukalapak"     },
  ],
  "Indonesia – Energy & Mining": [
    { ticker:"ADRO.JK", name:"Adaro Energy"   },
    { ticker:"BYAN.JK", name:"Bayan Resources"},
    { ticker:"PGAS.JK", name:"Perusahaan Gas" },
    { ticker:"ANTM.JK", name:"Aneka Tambang"  },
    { ticker:"PTBA.JK", name:"Bukit Asam"     },
    { ticker:"INCO.JK", name:"Vale Indonesia" },
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
    { ticker:"^GSPC",    name:"S&P 500"            },
    { ticker:"^IXIC",    name:"Nasdaq Composite"   },
    { ticker:"^DJI",     name:"Dow Jones"          },
    { ticker:"^JKSE",    name:"IDX Composite (IHSG)"},
    { ticker:"^HSI",     name:"Hang Seng"          },
    { ticker:"^N225",    name:"Nikkei 225"         },
    { ticker:"^FTSE",    name:"FTSE 100"           },
    { ticker:"^AXJO",    name:"ASX 200"            },
  ],
  "Commodities & FX": [
    { ticker:"GC=F",     name:"Gold"               },
    { ticker:"CL=F",     name:"Crude Oil (WTI)"    },
    { ticker:"SI=F",     name:"Silver"             },
    { ticker:"EURUSD=X", name:"EUR/USD"            },
    { ticker:"USDIDR=X", name:"USD/IDR"            },
    { ticker:"DX-Y.NYB", name:"USD Index (DXY)"    },
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
      <p style={{ color:"#666", fontSize:11, letterSpacing:"0.14em", fontFamily:"'DM Mono',monospace" }}>{label}</p>
    </div>
  );
}

function EmptyState({ message, action, onAction }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#444", letterSpacing:".12em", marginBottom:20 }}>{message}</p>
      {action && <button className="k-btn" onClick={onAction}>{action}</button>}
    </div>
  );
}

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchAllFeeds() {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async src => {
      const res  = await fetch(`${RSS2JSON}${encodeURIComponent(src.url)}`);
      const data = await res.json();
      if (data.status !== "ok") return [];
      return (data.items || []).slice(0, 5).map(item => ({
        title:   item.title?.trim() || "",
        desc:    item.description?.replace(/<[^>]+>/g,"").trim().slice(0,180) || "",
        source:  src.name,
        section: src.section,
      }));
    })
  );
  return results.flatMap(r => r.status === "fulfilled" ? r.value : []);
}

async function callClaude(prompt, useSearch=false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role:"user", content:prompt }],
  };
  if (useSearch) body.tools = [{ type:"web_search_20250305", name:"web_search" }];
  const res  = await fetch("/api/claude", {
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

Below are ${items.length} LIVE headlines from free RSS feeds. Use ONLY these — do not invent stories.

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
    "macro":"2 sentences from headlines",
    "earnings":"2 sentences from headlines",
    "regulatory":"2 sentences from headlines",
    "sectors":"2 sentences from headlines",
    "wealth":"2 sentences actionable",
    "risk":"2 sentences risk insight"
  },
  "watchlist":["phrase1","phrase2","phrase3","phrase4"]
}`
  ));
}

async function fetchEarningsWatch(watchlist, timestamp) {
  const tickerList = watchlist.map(w=>`${w.ticker} (${w.name})`).join(", ");
  return JSON.parse(await callClaude(
`Current time: ${timestamp}. Search the web for the latest stock data and earnings info for: ${tickerList}.

For each, find: current/latest price, today's % change, recent earnings result (beat/miss/in-line), next earnings date if announced, and a brief 1-sentence analyst sentiment.

Respond ONLY with valid JSON, no markdown:
{
  "updatedAt":"HH:MM",
  "stocks":[{
    "ticker":"...",
    "name":"...",
    "price":"...",
    "currency":"USD|IDR",
    "change":"+1.23%",
    "direction":"up|down|flat",
    "recentEarnings":"...",
    "nextEarnings":"...",
    "sentiment":"...",
    "signal":"bullish|bearish|neutral"
  }],
  "summary":"2-3 sentence overall summary"
}`,
  true
  ));
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Kabar() {
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

  const now = () => {
    const d = new Date();
    return d.toLocaleString("en-AU", {
      weekday:"short", day:"numeric", month:"short", year:"numeric",
      hour:"2-digit", minute:"2-digit"
    });
  };

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_STOCKS.filter(s =>
      s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const inWatchlist = (ticker) => watchlist.some(w => w.ticker === ticker);
  const toggleWatchlist = (stock) => {
    setWatchlist(prev =>
      inWatchlist(stock.ticker)
        ? prev.filter(w => w.ticker !== stock.ticker)
        : [...prev, stock]
    );
  };

  const generateBriefing = async () => {
    setBriefPhase("fetching");
    setBriefing(null);
    try {
      const items = await fetchAllFeeds();
      setRawCount(items.length);
      setBriefPhase("analysing");
      const ts = now();
      const result = await analyseBriefing(items, ts);
      setBriefing(result);
      setBriefTime(ts);
      setBriefPhase("done");
    } catch(e) {
      console.error(e);
      setBriefPhase("error");
    }
  };

  const runEarningsWatch = async () => {
    if (!watchlist.length) return;
    setEarningsPhase("loading");
    setEarningsData(null);
    try {
      const ts = now();
      const result = await fetchEarningsWatch(watchlist, ts);
      setEarningsData(result);
      setEarningsTime(ts);
      setEarningsPhase("done");
    } catch(e) {
      console.error(e);
      setEarningsPhase("error");
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0c0d0f", color:"#e2ddd4", fontFamily:"'Georgia',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        .k-spin{width:24px;height:24px;border:1.5px solid #222;border-top-color:#c9a84c;border-radius:50%;animation:kspin .7s linear infinite;}
        @keyframes kspin{to{transform:rotate(360deg);}}

        .k-tab{background:none;border:none;cursor:pointer;color:#484848;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;padding:11px 15px;border-bottom:1.5px solid transparent;transition:all .18s;white-space:nowrap;}
        .k-tab:hover{color:#c9a84c;}
        .k-tab.on{color:#c9a84c;border-bottom-color:#c9a84c;}

        .k-btn{background:#c9a84c;color:#0c0d0f;border:none;cursor:pointer;padding:11px 26px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:500;border-radius:2px;transition:all .18s;}
        .k-btn:hover{background:#e8c96a;}
        .k-btn:disabled{opacity:.4;cursor:not-allowed;}
        .k-btn.sm{padding:7px 16px;font-size:10px;}
        .k-btn.ghost{background:transparent;border:1px solid #c9a84c;color:#c9a84c;}
        .k-btn.ghost:hover{background:#1a1608;}
        .k-btn.danger{background:transparent;border:1px solid #e87070;color:#e87070;}
        .k-btn.danger:hover{background:#1a0808;}

        .k-pill{display:flex;align-items:center;gap:5px;background:none;border:1px solid #222;cursor:pointer;padding:5px 12px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:#555;transition:all .18s;white-space:nowrap;}
        .k-pill:hover{border-color:#444;color:#aaa;}
        .k-pill.on{color:#0c0d0f;border-color:transparent;}

        .k-card{background:#121315;border:1px solid #1c1c1e;border-radius:3px;padding:16px;transition:border-color .18s;}
        .k-card:hover{border-color:#2a2a2a;}
        .k-card.clickable{cursor:pointer;}
        .k-card.clickable:hover{border-color:#333;}

        .k-fcard{background:#121315;border:1px solid #1c1c1e;border-radius:3px;padding:16px;cursor:pointer;transition:all .18s;}
        .k-fcard:hover{border-color:#333;background:#181a1c;}
        .k-fcard.on{border-color:#c9a84c;background:#16130a;}

        .k-input{width:100%;background:#121315;border:1px solid #222;border-radius:2px;padding:9px 13px;color:#e2ddd4;font-family:'DM Mono',monospace;font-size:11px;outline:none;letter-spacing:.05em;}
        .k-input:focus{border-color:#3a3a3a;}
        .k-input::placeholder{color:#3a3a3a;}

        .k-gtab{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;color:#484848;padding:5px 11px;border-radius:2px;transition:all .18s;white-space:nowrap;}
        .k-gtab:hover{color:#aaa;background:#141516;}
        .k-gtab.on{color:#c9a84c;background:#16130a;}

        .k-add{width:26px;height:26px;border-radius:50%;border:1px solid #2a2a2a;background:none;cursor:pointer;color:#555;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0;}
        .k-add:hover{border-color:#c9a84c;color:#c9a84c;}
        .k-add.in{border-color:#5ecf7a33;color:#5ecf7a;background:#0a180f;}

        .k-rm{background:none;border:none;cursor:pointer;color:#333;font-size:14px;line-height:1;padding:1px 5px;border-radius:2px;transition:color .15s;}
        .k-rm:hover{color:#e87070;}

        .hl-row{display:flex;align-items:flex-start;padding:11px 0;border-bottom:1px solid #181818;}
        .hl-row:last-child{border-bottom:none;}

        .s-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:40px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.08em;}
        .w-tag{background:#16130a;border:1px solid #c9a84c22;padding:4px 11px;border-radius:40px;font-family:'DM Mono',monospace;font-size:10px;color:#c9a84c;letter-spacing:.06em;}

        .mono{font-family:'DM Mono',monospace;}
        .serif{font-family:'Source Serif 4',serif;}
        .display{font-family:'Cormorant Garamond',serif;}

        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#0c0d0f;}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:2px;}
      `}</style>

      {/* ── Masthead ──────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid #181818", padding:"0 20px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0 12px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:700,
                  color:"#e2ddd4", letterSpacing:".04em", lineHeight:1 }}>
                  KABAR
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#c9a84c",
                  letterSpacing:".16em", paddingBottom:2 }}>
                  FINANCIAL INTELLIGENCE
                </span>
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#333", letterSpacing:".12em", marginTop:4 }}>
                🇺🇸 US &nbsp;·&nbsp; 🇮🇩 INDONESIA &nbsp;·&nbsp; 🌐 GLOBAL &nbsp;·&nbsp; 10 FREE SOURCES
              </div>
            </div>
            {/* Live clock */}
            <LiveClock />
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", overflowX:"auto", gap:0 }}>
            {[
              ["briefing",  "Briefing"],
              ["sections",  "Sections"],
              ["focus",     "Focus Areas"],
              ["watchlist", `Watchlist (${watchlist.length})`],
              ["earnings",  "Earnings Watch"],
            ].map(([id,label]) => (
              <button key={id} className={`k-tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 20px" }}>

        {/* ══ BRIEFING ══════════════════════════════════════════════════════ */}
        {tab==="briefing" && (
          <div>
            {(briefPhase==="idle" || briefPhase==="done") && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
                <div>
                  {briefPhase==="done" && briefTime && (
                    <p className="mono" style={{ fontSize:9, color:"#444", letterSpacing:".12em" }}>
                      LAST GENERATED · {briefTime.toUpperCase()}
                    </p>
                  )}
                </div>
                <button className="k-btn sm" onClick={generateBriefing}>
                  {briefPhase==="done" ? "↻ Regenerate" : "Generate Briefing"}
                </button>
              </div>
            )}

            {briefPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div className="display" style={{ fontSize:26, color:"#333", marginBottom:10, fontStyle:"italic", fontWeight:400 }}>
                  What's moving the markets?
                </div>
                <p className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".14em", marginBottom:32 }}>
                  PULLS LIVE RSS FROM 10 FREE SOURCES · CLAUDE CURATES INSTANTLY
                </p>
                <button className="k-btn" onClick={generateBriefing}>Generate Briefing Now</button>
              </div>
            )}

            {briefPhase==="fetching"  && <Spinner label="FETCHING LIVE RSS FEEDS…" />}
            {briefPhase==="analysing" && <Spinner label={`CLAUDE CURATING ${rawCount} HEADLINES…`} />}
            {briefPhase==="error" && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#e87070", marginBottom:16 }}>
                  Something went wrong. Please try again.
                </p>
                <button className="k-btn" onClick={generateBriefing}>Retry</button>
              </div>
            )}

            {briefPhase==="done" && briefing && (
              <div style={{ display:"flex", flexDirection:"column", gap:26 }}>

                {/* Top Story */}
                <div style={{ borderLeft:"2px solid #c9a84c", paddingLeft:20 }}>
                  <div className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".16em", marginBottom:10 }}>
                    ★ TOP STORY
                  </div>
                  <h2 className="display" style={{ fontSize:24, fontWeight:700, lineHeight:1.25, color:"#e2ddd4", marginBottom:12 }}>
                    {briefing.topStory?.headline}
                  </h2>
                  <p className="serif" style={{ fontSize:14, color:"#888", lineHeight:1.75, marginBottom:8 }}>
                    {briefing.topStory?.summary}
                  </p>
                  <span className="mono" style={{ fontSize:9, color:"#3a3a3a", letterSpacing:".12em" }}>
                    VIA {briefing.topStory?.source?.toUpperCase()}
                  </span>
                </div>

                {/* Section Snapshots */}
                <div>
                  <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".14em", marginBottom:12 }}>
                    SECTION SNAPSHOTS — CLICK TO EXPLORE
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {SECTIONS.map(sec => {
                      const d = briefing.sections?.[sec.id];
                      return (
                        <div key={sec.id} className="k-card clickable"
                          onClick={()=>{ setTab("sections"); setActiveSection(sec.id); }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <span style={{ fontSize:14 }}>{sec.icon}</span>
                            <div style={{ width:5, height:5, borderRadius:"50%", background:sec.color, opacity:.9, marginTop:2 }} />
                          </div>
                          <div className="mono" style={{ fontSize:9, color:sec.color, letterSpacing:".12em", margin:"10px 0 5px" }}>
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
                  padding:"10px 14px", background:"#121315", border:"1px solid #1c1c1e", borderRadius:3 }}>
                  <span className="mono" style={{ fontSize:9, color:"#333" }}>
                    📡 {rawCount} HEADLINES · 10 FREE SOURCES · NO PAYWALL
                  </span>
                  <span className="mono" style={{ fontSize:9, color:"#2a2a2a" }}>{briefTime}</span>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ══ SECTIONS ══════════════════════════════════════════════════════ */}
        {tab==="sections" && (
          <div>
            {!briefing ? (
              <EmptyState
                message="GENERATE A BRIEFING FIRST"
                action="Generate Now"
                onAction={()=>{ generateBriefing(); setTab("briefing"); }}
              />
            ) : (
              <div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:22 }}>
                  {SECTIONS.map(sec => (
                    <button key={sec.id} className={`k-pill ${activeSection===sec.id?"on":""}`}
                      style={activeSection===sec.id?{background:sec.color}:{}}
                      onClick={()=>setActiveSection(sec.id)}>
                      {sec.icon} {sec.label}
                    </button>
                  ))}
                </div>
                {SECTIONS.filter(s=>s.id===activeSection).map(sec => {
                  const d = briefing.sections?.[sec.id];
                  return (
                    <div key={sec.id}>
                      <h3 className="display" style={{ fontSize:22, fontWeight:700, color:sec.color, marginBottom:5 }}>
                        {sec.icon} {sec.label}
                      </h3>
                      <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555", marginBottom:18 }}>
                        {d?.snapshot}
                      </p>
                      <div style={{ background:"#121315", border:"1px solid #1c1c1e", borderRadius:3, padding:"2px 18px" }}>
                        {(d?.headlines||[]).map((h,i) => (
                          <div key={i} className="hl-row">
                            <SignalDot signal={h.signal} />
                            <div style={{ flex:1 }}>
                              <p className="serif" style={{ fontSize:13, color:"#ccc", lineHeight:1.55 }}>{h.title}</p>
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
            <div style={{ marginBottom:20 }}>
              <h2 className="display" style={{ fontSize:22, fontWeight:700, color:"#e2ddd4", marginBottom:5 }}>Areas of Focus</h2>
              <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                Six standing lenses — tap any card for live insight from today's briefing
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:22 }}>
              {FOCUS_AREAS.map(fa => (
                <div key={fa.id} className={`k-fcard ${activeFocus===fa.id?"on":""}`}
                  onClick={()=>setActiveFocus(activeFocus===fa.id?null:fa.id)}>
                  <div style={{ fontSize:17, marginBottom:8 }}>{fa.icon}</div>
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
                            Generate a briefing to see live insights here.
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
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
              marginBottom:22, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 className="display" style={{ fontSize:22, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  My Watchlist
                </h2>
                <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                  Select stocks, indices and FX pairs to track
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
              <div style={{ marginBottom:26 }}>
                <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:10 }}>
                  TRACKING {watchlist.length} SYMBOL{watchlist.length!==1?"S":""}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {watchlist.map(w => (
                    <div key={w.ticker} style={{
                      display:"flex", alignItems:"center", gap:5,
                      background:"#121315",
                      border:`1px solid ${GROUP_COLORS[w.group]||"#222"}33`,
                      borderRadius:40, padding:"4px 10px 4px 12px"
                    }}>
                      <span className="mono" style={{ fontSize:10, color:GROUP_COLORS[w.group]||"#aaa" }}>
                        {flagFor(w.group)} {w.ticker}
                      </span>
                      <span className="serif" style={{ fontSize:11, color:"#444" }}>{w.name}</span>
                      <button className="k-rm" onClick={()=>toggleWatchlist(w)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ marginBottom:22 }}>
              <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:8 }}>
                SEARCH BY NAME OR TICKER
              </div>
              <input className="k-input" placeholder="e.g. Apple, BBRI, gold, Nasdaq…"
                value={search} onChange={e=>setSearch(e.target.value)} />
              {searchResults.length > 0 && (
                <div style={{ marginTop:7, display:"flex", flexDirection:"column", gap:3 }}>
                  {searchResults.map(s => (
                    <div key={s.ticker} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      background:"#121315", border:"1px solid #1c1c1e", borderRadius:2, padding:"8px 13px"
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span className="mono" style={{ fontSize:11, color:GROUP_COLORS[s.group]||"#aaa" }}>
                          {flagFor(s.group)} {s.ticker}
                        </span>
                        <span className="serif" style={{ fontSize:13, color:"#ccc" }}>{s.name}</span>
                        <span className="mono" style={{ fontSize:9, color:"#333" }}>{s.group}</span>
                      </div>
                      <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`}
                        onClick={()=>toggleWatchlist(s)}>
                        {inWatchlist(s.ticker)?"✓":"+"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Browse by group */}
            <div className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:9 }}>
              BROWSE BY CATEGORY
            </div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
              {Object.keys(STOCK_UNIVERSE).map(g => (
                <button key={g} className={`k-gtab ${activeGroup===g?"on":""}`}
                  onClick={()=>setActiveGroup(g)}>
                  {flagFor(g)} {g}
                </button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
              {(STOCK_UNIVERSE[activeGroup]||[]).map(s => (
                <div key={s.ticker} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  background:"#121315",
                  border:`1px solid ${inWatchlist(s.ticker)?"#5ecf7a22":"#1c1c1e"}`,
                  borderRadius:3, padding:"9px 11px"
                }}>
                  <div>
                    <div className="mono" style={{ fontSize:10,
                      color: inWatchlist(s.ticker) ? "#5ecf7a" : (GROUP_COLORS[activeGroup]||"#aaa") }}>
                      {s.ticker}
                    </div>
                    <div className="serif" style={{ fontSize:10, color:"#555", marginTop:2, lineHeight:1.3 }}>
                      {s.name}
                    </div>
                  </div>
                  <button className={`k-add ${inWatchlist(s.ticker)?"in":""}`}
                    onClick={()=>toggleWatchlist(s)}>
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
              marginBottom:22, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 className="display" style={{ fontSize:22, fontWeight:700, color:"#e2ddd4", marginBottom:4 }}>
                  Earnings Watch
                </h2>
                <p className="serif" style={{ fontStyle:"italic", fontSize:12, color:"#555" }}>
                  Live prices · earnings results · upcoming dates · analyst sentiment
                </p>
                {earningsTime && (
                  <p className="mono" style={{ fontSize:9, color:"#333", marginTop:6, letterSpacing:".1em" }}>
                    LAST UPDATED · {earningsTime.toUpperCase()}
                  </p>
                )}
              </div>
              <div style={{ display:"flex", gap:7 }}>
                <button className="k-btn ghost sm" onClick={()=>setTab("watchlist")}>Edit Watchlist</button>
                {watchlist.length > 0 && (
                  <button className="k-btn sm" onClick={runEarningsWatch}
                    disabled={earningsPhase==="loading"}>
                    {earningsPhase==="loading" ? "Loading…" : earningsPhase==="done" ? "↻ Refresh" : "Run Now"}
                  </button>
                )}
              </div>
            </div>

            {watchlist.length===0 && (
              <EmptyState
                message="YOUR WATCHLIST IS EMPTY"
                action="Build Watchlist →"
                onAction={()=>setTab("watchlist")}
              />
            )}

            {watchlist.length>0 && earningsPhase==="idle" && (
              <div style={{ textAlign:"center", padding:"52px 0" }}>
                <div className="display" style={{ fontSize:22, color:"#333", fontStyle:"italic", marginBottom:10 }}>
                  {watchlist.length} symbol{watchlist.length!==1?"s":""} ready
                </div>
                <p className="mono" style={{ fontSize:9, color:"#333", letterSpacing:".12em", marginBottom:28 }}>
                  CLAUDE SEARCHES LIVE DATA FOR EACH SYMBOL
                </p>
                <button className="k-btn" onClick={runEarningsWatch}>Run Earnings Watch</button>
              </div>
            )}

            {earningsPhase==="loading" && (
              <Spinner label={`SEARCHING LIVE DATA FOR ${watchlist.length} SYMBOL${watchlist.length!==1?"S":""}…`} />
            )}

            {earningsPhase==="error" && (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <p className="mono" style={{ fontSize:10, color:"#e87070", marginBottom:16 }}>Something went wrong. Please retry.</p>
                <button className="k-btn" onClick={runEarningsWatch}>Retry</button>
              </div>
            )}

            {earningsPhase==="done" && earningsData && (
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

                {/* Summary */}
                <div style={{ background:"#14120a", border:"1px solid #c9a84c22",
                  borderLeft:"2px solid #c9a84c", borderRadius:3, padding:"14px 18px" }}>
                  <div className="mono" style={{ fontSize:9, color:"#c9a84c", letterSpacing:".14em", marginBottom:8 }}>
                    📊 WATCHLIST SNAPSHOT
                  </div>
                  <p className="serif" style={{ fontSize:13, color:"#aaa", lineHeight:1.75 }}>
                    {earningsData.summary}
                  </p>
                </div>

                {/* Cards grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  {(earningsData.stocks||[]).map((s,i) => {
                    const wl  = watchlist.find(w=>w.ticker===s.ticker);
                    const gc  = GROUP_COLORS[wl?.group]||"#8a8a8a";
                    const isUp   = s.direction==="up";
                    const isDown = s.direction==="down";
                    const chgClr = isUp?"#5ecf7a":isDown?"#e87070":"#8a8a8a";
                    const sigClr = signalColor(s.signal);
                    return (
                      <div key={i} className="k-card"
                        style={{ borderColor:`${sigClr}18` }}>
                        {/* Top row */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                          <div>
                            <div className="mono" style={{ fontSize:12, color:gc, letterSpacing:".05em" }}>
                              {flagFor(wl?.group||"")} {s.ticker}
                            </div>
                            <div className="serif" style={{ fontSize:10, color:"#555", marginTop:2 }}>{s.name}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div className="mono" style={{ fontSize:15, color:"#e2ddd4", letterSpacing:"-.01em" }}>
                              {s.currency==="IDR"?"Rp":s.currency==="USD"?"$":""}{s.price}
                            </div>
                            <div className="mono" style={{ fontSize:10, color:chgClr, marginTop:2 }}>
                              {isUp?"▲":isDown?"▼":"—"} {s.change}
                            </div>
                          </div>
                        </div>

                        {/* Signal */}
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
                            <div className="mono" style={{ fontSize:8, color:"#333", letterSpacing:".1em", marginBottom:3 }}>
                              RECENT EARNINGS
                            </div>
                            <p className="serif" style={{ fontSize:11, color:"#888", lineHeight:1.5 }}>
                              {s.recentEarnings}
                            </p>
                          </div>
                        )}

                        {s.nextEarnings && (
                          <div style={{ marginBottom:8 }}>
                            <div className="mono" style={{ fontSize:8, color:"#333", letterSpacing:".1em", marginBottom:3 }}>
                              NEXT EARNINGS
                            </div>
                            <span className="mono" style={{ fontSize:9, color:"#c9a84c" }}>
                              📅 {s.nextEarnings}
                            </span>
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

                <p className="mono" style={{ fontSize:8, color:"#2a2a2a", textAlign:"center", paddingTop:4, letterSpacing:".1em" }}>
                  DATA VIA CLAUDE WEB SEARCH · FOR INFORMATION ONLY · NOT FINANCIAL ADVICE
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Live clock component ──────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useState(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  });
  return (
    <div style={{ textAlign:"right" }}>
      <div className="mono" style={{ fontSize:18, color:"#e2ddd4", letterSpacing:".04em", fontFamily:"'DM Mono',monospace" }}>
        {time.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
      </div>
      <div className="mono" style={{ fontSize:9, color:"#333", marginTop:3, letterSpacing:".1em", fontFamily:"'DM Mono',monospace" }}>
        {time.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).toUpperCase()}
      </div>
    </div>
  );
}
