async function getCryptoPrice({ coin }) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);

  if (!res.ok) {
    return {
      success: false,
      error: `CoinGecko API error: ${res.status}`,
      spoken_summary: `Sorry, I couldn't fetch the price for ${coin}. The API might be temporarily unavailable.`,
    };
  }

  const data = await res.json();

  if (!data[coin]) {
    return {
      success: false,
      error: `Coin "${coin}" not found on CoinGecko.`,
      spoken_summary: `I couldn't find a cryptocurrency called "${coin}". Try names like "bitcoin", "ethereum", or "solana".`,
    };
  }

  const price = data[coin].usd;
  const change24h = data[coin].usd_24h_change;
  const changeStr =
    change24h !== undefined
      ? ` It's ${change24h >= 0 ? "up" : "down"} ${Math.abs(change24h).toFixed(2)}% in the last 24 hours.`
      : "";

  return {
    success: true,
    data: {
      coin,
      price_usd: price,
      change_24h_percent: change24h,
    },
    spoken_summary: `The current price of ${coin.charAt(0).toUpperCase() + coin.slice(1)} is $${price.toLocaleString()} USD.${changeStr}`,
  };
}

module.exports = getCryptoPrice;
