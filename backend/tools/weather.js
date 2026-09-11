async function getWeather({ city }) {
  // Step 1: Geocode the city name to get lat/lon
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    return {
      success: false,
      error: `Could not find location: "${city}". Please check the city name.`,
      spoken_summary: `I couldn't find a city called ${city}. Could you double-check the name?`,
    };
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  // Step 2: Fetch current weather
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await fetch(weatherUrl);
  const weatherData = await weatherRes.json();

  const { temperature, windspeed, weathercode } = weatherData.current_weather;

  // Map weather code to description
  const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };

  const description = weatherDescriptions[weathercode] || "Unknown conditions";

  return {
    success: true,
    data: {
      city: name,
      country,
      temperature_celsius: temperature,
      temperature_fahrenheit: Math.round((temperature * 9) / 5 + 32),
      windspeed_kmh: windspeed,
      conditions: description,
    },
    spoken_summary: `The weather in ${name}, ${country} is ${description.toLowerCase()} with a temperature of ${temperature}°C (${Math.round((temperature * 9) / 5 + 32)}°F) and wind at ${windspeed} km/h.`,
  };
}

module.exports = getWeather;
