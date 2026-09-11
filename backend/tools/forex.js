async function getExchangeRate({ from_currency, to_currency }) {
  const from = from_currency.toUpperCase();
  const to = to_currency.toUpperCase();

  const url = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
  const res = await fetch(url);

  if (!res.ok) {
    return {
      success: false,
      error: `Exchange rate API error: ${res.status}`,
      spoken_summary: `Sorry, I couldn't fetch the exchange rate. The API might be temporarily unavailable.`,
    };
  }

  const data = await res.json();

  if (!data.rates || !data.rates[to]) {
    return {
      success: false,
      error: `Currency "${to}" not found.`,
      spoken_summary: `I couldn't find the currency code "${to}". Please check that it's a valid ISO 4217 code.`,
    };
  }

  const rate = data.rates[to];

  return {
    success: true,
    data: {
      from,
      to,
      rate,
    },
    spoken_summary: `The current exchange rate is 1 ${from} = ${rate} ${to}.`,
  };
}

module.exports = getExchangeRate;
