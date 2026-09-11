async function getStockPrice({ symbol }) {
  const ticker = symbol.toUpperCase().replace(/\s+/g, "");

  // Use Yahoo Finance v8 API (no key needed)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "TalkAPI-Voice-Agent/1.0" },
  });

  if (!res.ok) {
    return {
      success: false,
      error: `Stock API error: ${res.status}`,
      spoken_summary: `I couldn't find stock data for "${symbol}". Make sure you're using the correct ticker symbol like AAPL, GOOGL, or MSFT.`,
    };
  }

  const data = await res.json();
  const result = data.chart?.result?.[0];

  if (!result) {
    return {
      success: false,
      error: `No data for "${symbol}"`,
      spoken_summary: `I couldn't find stock data for "${symbol}". Check the ticker symbol.`,
    };
  }

  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose || meta.previousClose;
  const change = prevClose ? price - prevClose : 0;
  const changePercent = prevClose ? ((change / prevClose) * 100).toFixed(2) : "0";

  return {
    success: true,
    data: {
      symbol: ticker,
      name: meta.shortName || meta.symbol,
      price,
      currency: meta.currency,
      change: Math.round(change * 100) / 100,
      change_percent: parseFloat(changePercent),
    },
    spoken_summary: `${meta.shortName || ticker} is trading at ${price} ${meta.currency}. ${change >= 0 ? "Up" : "Down"} ${Math.abs(change).toFixed(2)} (${changePercent}%).`,
  };
}

module.exports = getStockPrice;
