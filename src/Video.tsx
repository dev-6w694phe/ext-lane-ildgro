// Composition: the procedural 3D scene (three.js via @remotion/three) plus 2D caption overlays.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { StoryScene } from "./scene/StoryScene.tsx";
import { Captions } from "./overlay/Captions.tsx";
import { SystemToast } from "./overlay/SystemToast.tsx";
import { TitleBanner } from "./overlay/TitleBanner.tsx";
import { F } from "./story/timeline.ts";

export const BaconHairOwner: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // short white flash on the reveal cut and the co-owner moment
  const flashAt = (a: number) => (frame >= a && frame < a + 4 ? [0.85, 0.55, 0.3, 0.12][frame - a] : 0);
  const flash = Math.max(flashAt(F.ownerTag), flashAt(F.coOwner + 4));
  return (
    <AbsoluteFill style={{ background: "#9fd0ff" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ fov: 45, near: 0.1, far: 1200, position: [0, 5, 10] }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping; gl.toneMappingExposure = 1.0; gl.shadowMap.type = THREE.PCFSoftShadowMap; }}
      >
        <StoryScene f={frame} />
      </ThreeCanvas>
      {/* soft vignette keeps the eye centred in the tall frame */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,8,30,0.35) 100%)", pointerEvents: "none" }} />
      <TitleBanner />
      <SystemToast />
      <Captions />
      {flash > 0 && <AbsoluteFill style={{ background: "#fff8dc", opacity: flash }} />}
    </AbsoluteFill>
  );
};
