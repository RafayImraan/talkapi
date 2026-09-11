async function getNews({ query, language = "en" }) {
  const lang = language.toLowerCase().slice(0, 2);
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&max=5&apikey=${process.env.GNEWS_API_KEY || ""}`;

  // Fallback: use free RSS-to-JSON if no API key
  if (!process.env.GNEWS_API_KEY) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${lang.toUpperCase()}&ceid=${lang.toUpperCase()}:en`;
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
      );
      const data = await res.json();

      if (data.status !== "ok" || !data.items) {
        return {
          success: true,
          data: { articles: [], count: 0, query },
          spoken_summary: `No news articles found for "${query}".`,
        };
      }

      const articles = data.items.slice(0, 5).map((a) => ({
        title: a.title,
        source: a.author,
        published: a.pubDate,
        url: a.link,
      }));

      return {
        success: true,
        data: { articles, count: articles.length, query },
        spoken_summary: `Here are the latest news on "${query}": ${articles.map((a) => `${a.title} from ${a.source}`).join(". ")}.`,
      };
    } catch (err) {
      return {
        success: false,
        error: `News fetch failed: ${err.message}`,
        spoken_summary: `Sorry, I couldn't fetch news right now.`,
      };
    }
  }

  // With GNews API key
  const res = await fetch(url);
  if (!res.ok) {
    return {
      success: false,
      error: `News API error: ${res.status}`,
      spoken_summary: `Sorry, I couldn't fetch news right now.`,
    };
  }

  const data = await res.json();
  const articles = (data.articles || []).slice(0, 5).map((a) => ({
    title: a.title,
    source: a.source?.name,
    published: a.publishedAt,
    url: a.url,
  }));

  return {
    success: true,
    data: { articles, count: articles.length, query },
    spoken_summary: `Here are the latest news on "${query}": ${articles.map((a) => `${a.title} from ${a.source}`).join(". ")}.`,
  };
}

module.exports = getNews;
