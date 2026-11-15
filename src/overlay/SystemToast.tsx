// The "Ownership transfer complete." system notification (an in-game style toast, not a speech caption).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS } from "../story/timeline.ts";
import { FONT } from "../scene/textures.ts";

export const SystemToast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const msg = CAPTIONS.find((c) => c.speaker === null && t >= c.from && t < c.to);
  if (!msg) return null;
  const start = Math.round(msg.from * fps), end = Math.round(msg.to * fps);
  const drop = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 140 } });
  const out = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = interpolate(frame, [start + 4, start + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = bar >= 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 250, pointerEvents: "none" }}>
      <div style={{
        opacity: out, transform: `translateY(${(drop - 1) * 180}px)`, width: 900, padding: "30px 36px", borderRadius: 30,
        background: "linear-gradient(180deg, #2b2346 0%, #1a1530 100%)", border: "6px solid #ffd23f",
        boxShadow: "0 0 60px rgba(255, 210, 63, 0.55), 0 12px 0 rgba(0,0,0,0.4)", display: "flex", gap: 28, alignItems: "center",
      }}>
        <div style={{
          width: 110, height: 110, borderRadius: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: done ? "#2a9d5c" : "#5b2a9c", fontFamily: FONT, fontSize: 70, color: "#fff", fontWeight: 900,
        }}>{done ? "✓" : "★"}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 900, letterSpacing: 3, color: "#ffd23f" }}>SERVER NOTICE</div>
          <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 900, lineHeight: 1.08, color: "#fff" }}>{msg.text}</div>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: "#c8bfe6" }}>New owner: Pip • VIP Mansion</div>
          <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${bar * 100}%`, height: "100%", background: "linear-gradient(90deg, #ffd23f, #ff9f1c)" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
