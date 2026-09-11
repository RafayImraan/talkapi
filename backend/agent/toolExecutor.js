const path = require("path");
const toolsDir = path.join(__dirname, "..", "tools");

const getWeather = require(path.join(toolsDir, "weather"));
const { searchGithubRepos, getGithubRepoInfo, getGithubIssues } = require(path.join(toolsDir, "github"));
const { searchProducts, manageCart } = require(path.join(toolsDir, "shopping"));
const getCryptoPrice = require(path.join(toolsDir, "crypto"));
const getExchangeRate = require(path.join(toolsDir, "forex"));
const searchKnowledgeBase = require(path.join(toolsDir, "knowledgeBase"));
const getNews = require(path.join(toolsDir, "news"));
const translateText = require(path.join(toolsDir, "translate"));
const getStockPrice = require(path.join(toolsDir, "stock"));

const toolHandlers = {
  get_weather: getWeather,
  search_github_repos: searchGithubRepos,
  get_github_repo_info: getGithubRepoInfo,
  get_github_issues: getGithubIssues,
  search_products: searchProducts,
  manage_cart: manageCart,
  get_crypto_price: getCryptoPrice,
  get_exchange_rate: getExchangeRate,
  search_knowledge_base: searchKnowledgeBase,
  get_news: getNews,
  translate_text: translateText,
  get_stock_price: getStockPrice,
};

async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  if (!handler) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      spoken_summary: `I don't have a tool called "${toolName}".`,
    };
  }

  try {
    return await handler(args);
  } catch (err) {
    console.error(`[ToolExecutor] Error in ${toolName}:`, err.message);
    return {
      success: false,
      error: `Tool execution failed: ${err.message}`,
      spoken_summary: `Sorry, something went wrong while trying to ${toolName.replace(/_/g, " ")}. Please try again.`,
    };
  }
}

module.exports = executeTool;
