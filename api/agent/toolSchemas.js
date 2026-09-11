const WEATHER_TOOLS = [
  {
    type: "function",
    name: "get_weather",
    description:
      "Get the current weather and temperature for a city. Call this whenever the user asks about weather, temperature, rain, sun, wind, or current conditions in any location.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description:
            "The city name to get weather for (e.g. 'Karachi', 'London', 'New York').",
          examples: ["Karachi", "London", "Tokyo", "New York"],
        },
      },
      required: ["city"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const GITHUB_TOOLS = [
  {
    type: "function",
    name: "search_github_repos",
    description:
      "Search for public GitHub repositories by keyword. Call this when the user wants to find repos but doesn't know the exact owner/repo name. Returns top 5 results with stars, description, and language.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search keywords to find repositories (e.g. 'react', 'machine learning', 'chat app').",
          examples: ["react", "machine learning", "chat app", "portfolio"],
        },
      },
      required: ["query"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
  {
    type: "function",
    name: "get_github_repo_info",
    description:
      "Get information about a public GitHub repository — stars, description, primary language, open issues count, forks, and last push date. Call this when the user asks about a specific repo.",
    parameters: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description:
            "The GitHub username or organization that owns the repository (e.g. 'facebook', 'torvalds').",
          examples: ["facebook", "torvalds", "vercel"],
        },
        repo: {
          type: "string",
          description:
            "The repository name (e.g. 'react', 'linux', 'next.js').",
          examples: ["react", "linux", "next.js"],
        },
      },
      required: ["owner", "repo"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
  {
    type: "function",
    name: "get_github_issues",
    description:
      "Get a list of issues for a public GitHub repository. Call this when the user asks to see issues, bugs, or problem reports for a repo.",
    parameters: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "The GitHub username or organization that owns the repo.",
          examples: ["facebook", "vercel"],
        },
        repo: {
          type: "string",
          description: "The repository name.",
          examples: ["react", "next.js"],
        },
        state: {
          type: "string",
          description: "Filter by issue state.",
          enum: ["open", "closed"],
        },
      },
      required: ["owner", "repo"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const SHOPPING_TOOLS = [
  {
    type: "function",
    name: "search_products",
    description:
      "Search for products in the store catalog by name or category. Call this when the user wants to browse or find items like clothing, electronics, or accessories.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "A search term to match against product titles or categories (e.g. 'hoodie', 'electronics', 'jewelry').",
          examples: ["hoodie", "laptop", "jewelry", "shoes"],
        },
      },
      required: ["query"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
  {
    type: "function",
    name: "manage_cart",
    description:
      "Add, remove, view, or clear items in the shopping cart. Use 'add' to put items in the cart, 'view' to see cart contents, 'remove' to take items out, 'clear' to empty the entire cart.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "The cart action to perform.",
          enum: ["add", "view", "remove", "clear"],
        },
        product_query: {
          type: "string",
          description:
            "For add/remove: a search term to find the product by title (e.g. 'hoodie', 't-shirt'). Not needed for view or clear.",
          examples: ["hoodie", "samsung phone", "gold ring"],
        },
        quantity: {
          type: "number",
          description:
            "Number of items to add or remove. Defaults to 1 if not specified.",
        },
      },
      required: ["action"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const CRYPTO_TOOLS = [
  {
    type: "function",
    name: "get_crypto_price",
    description:
      "Get the current price of a cryptocurrency in USD. Call this when the user asks about Bitcoin, Ethereum, or any crypto price.",
    parameters: {
      type: "object",
      properties: {
        coin: {
          type: "string",
          description:
            "The CoinGecko coin ID in lowercase (e.g. 'bitcoin', 'ethereum', 'solana', 'dogecoin').",
          enum: [
            "bitcoin",
            "ethereum",
            "solana",
            "dogecoin",
            "cardano",
            "ripple",
            "polkadot",
            "avalanche-2",
            "chainlink",
            "litecoin",
          ],
          examples: ["bitcoin", "ethereum", "solana"],
        },
      },
      required: ["coin"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const FOREX_TOOLS = [
  {
    type: "function",
    name: "get_exchange_rate",
    description:
      "Get the current exchange rate between two currencies. Call this when the user asks how much one currency is worth in another.",
    parameters: {
      type: "object",
      properties: {
        from_currency: {
          type: "string",
          description:
            "The base currency code in uppercase ISO 4217 format (e.g. 'USD', 'EUR', 'GBP').",
          examples: ["USD", "EUR", "GBP", "JPY"],
        },
        to_currency: {
          type: "string",
          description:
            "The target currency code in uppercase ISO 4217 format (e.g. 'PKR', 'EUR', 'GBP').",
          examples: ["PKR", "EUR", "GBP", "INR"],
        },
      },
      required: ["from_currency", "to_currency"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const KNOWLEDGE_TOOLS = [
  {
    type: "function",
    name: "search_knowledge_base",
    description:
      "Search Nimbus Cloud's internal knowledge base for answers about pricing, features, support, integrations, or security. Call this when the user asks about Nimbus Cloud services, plans, or capabilities.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "A search keyword or phrase to find relevant FAQ entries (e.g. 'pricing', 'API access', 'data retention').",
          examples: ["pricing", "API access", "support hours", "SSO"],
        },
      },
      required: ["query"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const NEWS_TOOLS = [
  {
    type: "function",
    name: "get_news",
    description:
      "Get the latest news articles on any topic. Call this when the user asks about current events, news, or what's happening in the world.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search keywords for news topics (e.g. 'artificial intelligence', 'cricket', 'elections').",
          examples: ["artificial intelligence", "cricket world cup", "tech layoffs"],
        },
        language: {
          type: "string",
          description: "Language code for news articles.",
          enum: ["en", "ur", "hi", "es", "fr", "de", "zh", "ja", "ar"],
        },
      },
      required: ["query"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const TRANSLATE_TOOLS = [
  {
    type: "function",
    name: "translate_text",
    description:
      "Translate text from one language to another. Call this when the user wants to translate something or asks what something means in another language.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to translate.",
          examples: ["Hello, how are you?", "Good morning", "Thank you very much"],
        },
        from_language: {
          type: "string",
          description:
            "Source language name or code. Use 'auto' to detect automatically.",
          enum: [
            "auto",
            "english",
            "urdu",
            "hindi",
            "spanish",
            "french",
            "german",
            "chinese",
            "japanese",
            "korean",
            "arabic",
            "portuguese",
            "russian",
          ],
        },
        to_language: {
          type: "string",
          description: "Target language name or code to translate into.",
          enum: [
            "english",
            "urdu",
            "hindi",
            "spanish",
            "french",
            "german",
            "chinese",
            "japanese",
            "korean",
            "arabic",
            "portuguese",
            "russian",
            "turkish",
            "italian",
          ],
        },
      },
      required: ["text", "to_language"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

const STOCK_TOOLS = [
  {
    type: "function",
    name: "get_stock_price",
    description:
      "Get the current stock price and daily change for a company. Call this when the user asks about stock prices, share prices, or how a company's stock is doing.",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description:
            "The stock ticker symbol (e.g. 'AAPL' for Apple, 'GOOGL' for Google, 'MSFT' for Microsoft).",
          examples: ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"],
        },
      },
      required: ["symbol"],
    },
    execution_mode: "interactive",
    timeout_seconds: 30,
  },
];

// All tools combined for the agent
const ALL_TOOLS = [
  ...WEATHER_TOOLS,
  ...GITHUB_TOOLS,
  ...SHOPPING_TOOLS,
  ...CRYPTO_TOOLS,
  ...FOREX_TOOLS,
  ...KNOWLEDGE_TOOLS,
  ...NEWS_TOOLS,
  ...TRANSLATE_TOOLS,
  ...STOCK_TOOLS,
];

// Progressive tool reveal tiers
const TIER_1 = [
  WEATHER_TOOLS[0],
  CRYPTO_TOOLS[0],
  FOREX_TOOLS[0],
  KNOWLEDGE_TOOLS[0],
  GITHUB_TOOLS[0],
  NEWS_TOOLS[0],
];

const TIER_2 = [
  ...TIER_1,
  GITHUB_TOOLS[1],
  GITHUB_TOOLS[2],
  STOCK_TOOLS[0],
  TRANSLATE_TOOLS[0],
];

const TIER_3 = ALL_TOOLS;

module.exports = {
  ALL_TOOLS,
  TIER_1,
  TIER_2,
  TIER_3,
  WEATHER_TOOLS,
  GITHUB_TOOLS,
  SHOPPING_TOOLS,
  CRYPTO_TOOLS,
  FOREX_TOOLS,
  KNOWLEDGE_TOOLS,
  NEWS_TOOLS,
  TRANSLATE_TOOLS,
  STOCK_TOOLS,
};
