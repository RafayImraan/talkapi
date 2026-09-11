import React, { useRef, useEffect } from "react";

export default function AudioVisualizer({ analyser, status }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = value * centerY * 0.9;

        const hue = 250 + (i / barCount) * 30;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.5 + value * 0.5})`;
        ctx.fillRect(
          i * (barWidth + 2),
          centerY - barHeight,
          barWidth,
          barHeight * 2
        );
      }
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyser]);

  if (status === "disconnected") return null;

  return (
    <div className="audio-visualizer">
      <canvas ref={canvasRef} width={300} height={60} />
    </div>
  );
}
