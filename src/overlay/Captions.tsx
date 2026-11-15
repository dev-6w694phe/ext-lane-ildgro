// Dialogue captions: speaker chip + line, popped in and held well inside the vertical safe area.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS, CHARACTERS, TOTAL_FRAMES } from "../story/timeline.ts";
import { FONT } from "../scene/textures.ts";

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cap = CAPTIONS.find((c) => c.speaker && t >= c.from && t < c.to);
  if (!cap || !cap.speaker) return null;
  const who = CHARACTERS[cap.speaker];
  const start = Math.round(cap.from * fps), end = Math.round(cap.to * fps);
  const pop = spring({ frame: frame - start, fps, config: { damping: 13, stiffness: 180, mass: 0.6 } });
  // the last line holds to the final frame instead of fading
  const out = end >= TOTAL_FRAMES ? 1 : interpolate(frame, [end - 6, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // words land one after another over the first ~0.45 s, then the full line holds
  const words = cap.text.split(" ");
  const shown = Math.min(words.length, Math.floor(((frame - start) / (fps * 0.45)) * words.length) + 1);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 1235, pointerEvents: "none" }}>
      <div style={{ opacity: out, transform: `translateY(${(1 - pop) * 40}px) scale(${0.85 + 0.15 * pop})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, maxWidth: 940 }}>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: 1, color: "#16141c", background: who.color,
          padding: "6px 22px", borderRadius: 999, boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
        }}>{who.name}</div>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 66, lineHeight: 1.12, textAlign: "center", color: "#ffffff",
          background: "rgba(14, 12, 24, 0.72)", padding: "22px 34px 26px", borderRadius: 34, border: `5px solid ${who.color}`,
          WebkitTextStroke: "2px #0b0a12", paintOrder: "stroke fill", textShadow: "0 5px 0 rgba(0,0,0,0.55)",
        }}>
          {words.map((w, i) => <span key={i} style={{ opacity: i < shown ? 1 : 0 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
