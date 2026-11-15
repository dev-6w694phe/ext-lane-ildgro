import React from "react";
import { Composition } from "remotion";
import { BaconHairOwner } from "./Video.tsx";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./story/timeline.ts";

export const RemotionRoot: React.FC = () => (
  <Composition id="BaconHairOwner" component={BaconHairOwner} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
