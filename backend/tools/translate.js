async function translateText({ text, from_language = "auto", to_language }) {
  if (!to_language) {
    return {
      success: false,
      error: "to_language is required",
      spoken_summary: "Which language should I translate to?",
    };
  }

  const langMap = {
    english: "en",
    urdu: "ur",
    hindi: "hi",
    spanish: "es",
    french: "fr",
    german: "de",
    chinese: "zh",
    japanese: "ja",
    korean: "ko",
    arabic: "ar",
    portuguese: "pt",
    russian: "ru",
    italian: "it",
    turkish: "tr",
    bengali: "bn",
    punjabi: "pa",
    tamil: "ta",
    thai: "th",
    vietnamese: "vi",
    indonesian: "id",
    malay: "ms",
    filipino: "tl",
    swahili: "sw",
    dutch: "nl",
    polish: "pl",
    czech: "cs",
    romanian: "ro",
    greek: "el",
    hebrew: "he",
    persian: "fa",
  };

    const toLang = langMap[to_language.toLowerCase()] || to_language.toLowerCase().slice(0, 2);
    const fromLang = langMap[from_language.toLowerCase()] || from_language.toLowerCase().slice(0, 2);

  // Use MyMemory Translation API (free, no key needed)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang === "auto" ? "autodetect" : fromLang}|${toLang}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.responseStatus !== 200 || !data.responseData) {
    return {
      success: false,
      error: `Translation failed: ${data.responseDetails || "unknown error"}`,
      spoken_summary: `Sorry, I couldn't translate that text.`,
    };
  }

  const translated = data.responseData.translatedText;
  const detectedLang = data.responseData.detectedLanguage || fromLang;

  return {
    success: true,
    data: {
      original: text,
      translated,
      from_language: detectedLang,
      to_language: toLang,
    },
    spoken_summary: `Translating from ${detectedLang} to ${toLang}: ${translated}`,
  };
}

module.exports = translateText;
