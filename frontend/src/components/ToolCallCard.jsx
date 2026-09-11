import React from "react";

const TOOL_ICONS = {
  get_weather: "☁️",
  search_github_repos: "🔍",
  get_github_repo_info: "💻",
  get_github_issues: "🐛",
  search_products: "🔍",
  manage_cart: "🛒",
  get_crypto_price: "💰",
  get_exchange_rate: "💱",
  search_knowledge_base: "📚",
  get_news: "📰",
  translate_text: "🌐",
  get_stock_price: "📈",
};

export default function ToolCallCard({ name, args, result, status }) {
  const icon = TOOL_ICONS[name] || "🔧";
  const displayName = name.replace(/_/g, " ");

  const argsList = args
    ? Object.entries(args)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : "";

  const resultText = result?.spoken_summary || result?.error || "";
  const isSuccess = result?.success !== false && status === "done";

  return (
    <div className={`tool-call-card ${status === "done" ? (isSuccess ? "success" : "error") : ""}`}>
      <div className="tool-card-header">
        <span className="tool-icon">{icon}</span>
        <span className="tool-name">{displayName}</span>
        <span className="tool-reaction">
          {status === "done" ? (isSuccess ? "✅" : "❌") : "⏳"}
        </span>
        <span className={`tool-status ${status}`}>
          {status === "pending" ? "Running..." : "Done"}
        </span>
      </div>

      {argsList && <div className="tool-args">{argsList}</div>}

      {resultText && status === "done" && (
        <div className="tool-result">{resultText}</div>
      )}
    </div>
  );
}
