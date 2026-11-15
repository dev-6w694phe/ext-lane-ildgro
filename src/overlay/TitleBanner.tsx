// Story title shown over the opening seconds, top of frame (clear of the dialogue caption).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../scene/textures.ts";

export const TitleBanner: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, 80, 90], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 110, pointerEvents: "none", opacity: o }}>
      <div style={{
        fontFamily: FONT, fontWeight: 900, fontSize: 60, lineHeight: 1.05, color: "#ffd23f", textAlign: "center", maxWidth: 900,
        WebkitTextStroke: "3px #1a1530", paintOrder: "stroke fill", textShadow: "0 7px 0 #1a1530",
      }}>THE BACON HAIR WHO<br />OWNED THE SERVER</div>
    </AbsoluteFill>
  );
};
