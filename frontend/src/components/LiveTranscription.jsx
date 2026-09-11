import React from "react";

export default function LiveTranscription({ text }) {
  return (
    <div className="live-transcription">
      <div className="live-dot" />
      <span className="live-text">{text}</span>
    </div>
  );
}
