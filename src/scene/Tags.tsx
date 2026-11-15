// World-space labels that always face the camera: username tags, the glowing OWNER / CO-OWNER tags, chat bubbles.
import React from "react";
import * as THREE from "three";
import { cameraAt } from "../story/camera.ts";
import type { V3 } from "../story/math.ts";
import { easeOutBack, ramp } from "../story/math.ts";
import { glowTexture, labelTexture } from "./textures.ts";

const m = new THREE.Matrix4();
const up = new THREE.Vector3(0, 1, 0);
const quatFor = (f: number) => {
  const c = cameraAt(f);
  m.lookAt(new THREE.Vector3(...c.pos), new THREE.Vector3(...c.look), up);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  return q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), c.roll));
};

export const Billboard: React.FC<{ f: number; position: V3; children: React.ReactNode }> = ({ f, position, children }) => (
  <group position={position} quaternion={quatFor(f)}>{children}</group>
);

/** Small username above an avatar. */
export const NameTag: React.FC<{ f: number; position: V3; name: string; color?: string }> = ({ f, position, name, color = "#ffffff" }) => {
  const tex = labelTexture(`name:${name}:${color}`, name, { w: 512, h: 128, bg: "rgba(20,20,30,0.55)", fg: color, size: 64, radius: 40 });
  return (
    <Billboard f={f} position={position}>
      <mesh renderOrder={10}><planeGeometry args={[2.0, 0.5]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>
    </Billboard>
  );
};

/** Glowing rank tag that pops in at `from` and pulses afterwards. */
export const RankTag: React.FC<{ f: number; from: number; position: V3; text: string; color: string; glow: string }> = ({ f, from, position, text, color, glow }) => {
  if (f < from) return null;
  const pop = easeOutBack(ramp(f, from, from + 14) * 1.0001);
  const pulse = 1 + 0.06 * Math.sin((f - from) * 0.25);
  const tex = labelTexture(`rank:${text}`, `★ ${text} ★`, { w: 1024, h: 288, bg: color, fg: "#ffffff", border: "#ffffff", size: 120, radius: 70, glow });
  const halo = glowTexture(glow);
  const w = text.length > 6 ? 5.4 : 4.4;
  return (
    <Billboard f={f} position={position}>
      <group scale={pop * pulse}>
        <mesh renderOrder={11} position={[0, 0, -0.05]} scale={[1.5, 2.6, 1]}>
          <planeGeometry args={[w, w * 0.28]} />
          <meshBasicMaterial map={halo} color={new THREE.Color(glow).multiplyScalar(2.2)} transparent opacity={0.55 + 0.25 * Math.sin((f - from) * 0.2)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh renderOrder={12}>
          <planeGeometry args={[w, w * 0.28]} />
          <meshBasicMaterial map={tex} color={new THREE.Color(1.25, 1.25, 1.25)} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </Billboard>
  );
};

/** In-game style chat bubble with a little tail. */
export const ChatBubble: React.FC<{ f: number; from: number; to: number; position: V3; text: string }> = ({ f, from, to, position, text }) => {
  if (f < from || f >= to) return null;
  const s = easeOutBack(ramp(f, from, from + 8)) * (1 - ramp(f, to - 6, to));
  const tex = labelTexture(`bubble:${text}`, text, { w: 512, h: 192, bg: "#ffffff", fg: "#1d1a22", size: 78, radius: 60 });
  return (
    <Billboard f={f} position={position}>
      <group scale={s}>
        <mesh renderOrder={9}><planeGeometry args={[2.8, 1.05]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>
        <mesh renderOrder={9} position={[0, -0.6, 0]} rotation={[0, 0, Math.PI]}><circleGeometry args={[0.22, 3]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      </group>
    </Billboard>
  );
};
