export default async function handler(req, res) {
  const RSS2JSON = "https://api.rss2json.com/v1/api.json?count=6&rss_url=";

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

  try {
    const results = await Promise.allSettled(
      RSS_SOURCES.map(async (src) => {
        try {
          const r    = await fetch(`${RSS2JSON}${encodeURIComponent(src.url)}`);
          const data = await r.json();
          if (data.status !== "ok") return [];
          return (data.items || []).slice(0, 5).map(item => ({
            title:   item.title?.trim() || "",
            desc:    (item.description || "").replace(/<[^>]+>/g, "").trim().slice(0, 180),
            source:  src.name,
            section: src.section,
          }));
        } catch { return []; }
      })
    );

    const items = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}