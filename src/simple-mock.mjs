/** Mock API: Demonstrates how supervisor routes questions to different sub-agents */

function normCity(city) {
  return String(city).trim();
}

const weatherTable = {
  Hangzhou: { summary: "Cloudy to light rain", tempHighC: 22, tempLowC: 15, aqi: "Good" },
  Beijing: { summary: "Sunny", tempHighC: 26, tempLowC: 12, aqi: "Light pollution" },
  Shanghai: { summary: "Overcast", tempHighC: 20, tempLowC: 16, aqi: "Good" },
};

const triviaTable = {
  Hangzhou: "The West Lake Cultural Landscape is a UNESCO World Heritage site.",
  Beijing: "The Forbidden City is one of the largest ancient palatial structures in the world.",
  Shanghai: "The Bund is a microcosm of modern urban history with its diverse architectural styles.",
};

/** Lookup daily weather summary for a city (Mock) */
export function lookupWeather(city) {
  const c = normCity(city);
  const w = weatherTable[c];
  if (!w) {
    return JSON.stringify({
      city: c,
      summary: "No data for this city, placeholder below",
      tempHighC: 20,
      tempLowC: 12,
      aqi: "—",
    });
  }
  return JSON.stringify({ city: c, ...w });
}

/** Lookup a piece of trivia for a city (Mock) */
export function lookupCityTrivia(city) {
  const c = normCity(city);
  const line = triviaTable[c];
  return JSON.stringify({
    city: c,
    trivia: line ?? `No built-in trivia for "${c}", try Hangzhou/Beijing/Shanghai.`,
  });
}