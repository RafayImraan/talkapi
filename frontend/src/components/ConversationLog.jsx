import React, { useEffect, useRef } from "react";
import ToolCallCard from "./ToolCallCard";

export default function ConversationLog({ events }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const renderEntries = () => {
    const entries = [];

    for (const event of events) {
      switch (event.type) {
        case "user_speech":
          entries.push(
            <div key={event.id} className="log-entry user">
              <div className="label">You</div>
              {event.text}
            </div>
          );
          break;

        case "agent_speech":
          entries.push(
            <div key={event.id} className="log-entry agent">
              <div className="label">Agent</div>
              {event.text}
            </div>
          );
          break;

        case "tool_call":
          entries.push(
            <div key={event.id} className="log-entry system">
              <ToolCallCard
                name={event.name}
                args={event.arguments}
                status="pending"
              />
            </div>
          );
          break;

        case "tool_result":
          entries.push(
            <div key={event.id} className="log-entry system">
              <ToolCallCard
                name={event.name}
                result={event.result}
                status="done"
              />
            </div>
          );
          break;

        case "system":
          entries.push(
            <div key={event.id} className="log-entry system">
              {event.text}
            </div>
          );
          break;

        case "error":
          entries.push(
            <div
              key={event.id}
              className="log-entry system"
              style={{ color: "var(--error)" }}
            >
              Error: {event.message}
            </div>
          );
          break;

        default:
          break;
      }
    }

    return entries;
  };

  return (
    <div className="conversation-log">
      <div className="log-header">Conversation</div>
      <div className="log-entries" ref={logRef}>
        {events.length === 0 && (
          <div className="log-entry system">
            Press the mic button to start a voice session...
          </div>
        )}
        {renderEntries()}
      </div>
    </div>
  );
}
