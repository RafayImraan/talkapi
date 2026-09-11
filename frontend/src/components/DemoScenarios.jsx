import React from "react";

const SCENARIOS = [
  { icon: "☁️", text: "What's the weather in Karachi?", category: "Utility" },
  { icon: "💻", text: "Search GitHub for react", category: "Dev Tools" },
  { icon: "🛒", text: "Search for hoodies in the store", category: "E-commerce" },
  { icon: "💰", text: "What's the price of Bitcoin?", category: "Finance" },
  { icon: "💱", text: "Convert 100 dollars to PKR", category: "Finance" },
  { icon: "📰", text: "What's the latest news on AI?", category: "News" },
  { icon: "📈", text: "What's Apple's stock price?", category: "Finance" },
  { icon: "🌐", text: "Translate hello to Urdu", category: "Translation" },
];

export default function DemoScenarios({ onStart }) {
  return (
    <div className="demo-scenarios">
      <p className="demo-title">Try saying:</p>
      <div className="demo-grid">
        {SCENARIOS.map((s, i) => (
          <div key={i} className="demo-card">
            <span className="demo-icon">{s.icon}</span>
            <span className="demo-text">"{s.text}"</span>
            <span className="demo-category">{s.category}</span>
          </div>
        ))}
      </div>
      <p className="demo-hint">Press the mic button or hit Space to start</p>
    </div>
  );
}
