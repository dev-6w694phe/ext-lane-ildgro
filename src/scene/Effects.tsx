// Deterministic particle effects: ownership sparkles, a light pillar for the reveal, confetti, door light rays.
import React from "react";
import * as THREE from "three";
import type { V3 } from "../story/math.ts";
import { clamp01, hash, ramp } from "../story/math.ts";
import { block, plastic } from "./materials.ts";
import { glowTexture } from "./textures.ts";

const glowMat = (color: string, opacity: number) => (
  <meshBasicMaterial map={glowTexture(color)} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
);

/** Gold motes spiralling up around an avatar. */
export const Sparkles: React.FC<{ f: number; from: number; dur: number; at: V3; count?: number; color?: string }> = ({ f, from, dur, at, count = 36, color = "#ffd23f" }) => {
  const t = f - from;
  if (t < 0 || t > dur) return null;
  return (
    <group position={at}>
      {Array.from({ length: count }, (_, i) => {
        const life = clamp01((t - hash(i) * dur * 0.4) / (dur * 0.6));
        if (life <= 0 || life >= 1) return null;
        const a = hash(i + 50) * Math.PI * 2 + life * 5;
        const r = 2.2 - life * 0.8;
        const s = 0.5 * Math.sin(life * Math.PI);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.5 + life * 6.5, Math.sin(a) * r]} scale={[s, s, s]}>
            <planeGeometry args={[1, 1]} />
            {glowMat(color, 0.95)}
          </mesh>
        );
      })}
    </group>
  );
};

/** Vertical beam of light that flares when the OWNER tag appears. */
export const LightPillar: React.FC<{ f: number; from: number; at: V3; color?: string }> = ({ f, from, at, color = "#ffd76a" }) => {
  const t = f - from;
  if (t < 0 || t > 60) return null;
  const k = ramp(f, from, from + 6) * (1 - ramp(f, from + 20, from + 60));
  return (
    <group position={at}>
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[1.6 * (1 + t * 0.01), 2.4, 18, 24, 1, true]} />
        <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(1.0)} transparent opacity={0.18 * k} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={4 + t * 0.08}>
        <planeGeometry args={[1, 1]} />
        {glowMat(color, 0.6 * k)}
      </mesh>
    </group>
  );
};

const CONFETTI = ["#ff5d8f", "#ffd23f", "#4ee0c1", "#3a86ff", "#9b5de5", "#ffffff", "#ff7b00"];
/** Falling confetti blocks over an area. */
export const Confetti: React.FC<{ f: number; from: number; at: V3; count?: number; spread?: number; seed?: number }> = ({ f, from, at, count = 110, spread = 9, seed = 0 }) => {
  const t = (f - from) / 30;
  if (t < 0) return null;
  return (
    <group position={at}>
      {Array.from({ length: count }, (_, i) => {
        const k = i + seed * 1000;
        const delay = hash(k) * 0.5;
        const tt = t - delay;
        if (tt < 0) return null;
        const burst = Math.min(tt, 0.35);
        const x = (hash(k + 1) - 0.5) * spread * (0.4 + burst * 1.7) + Math.sin(tt * 3 + k) * 0.4;
        const z = (hash(k + 2) - 0.5) * spread * (0.4 + burst * 1.7);
        const y = 7 + hash(k + 3) * 5 + 14 * burst - 3.2 * Math.max(0, tt - 0.35) * (1 + hash(k + 4));
        if (y < 0) return null;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[tt * 6 + k, tt * 4 + k * 2, tt * 5]}
            geometry={block(0.28, 0.06, 0.18, 0.02)} material={plastic(CONFETTI[k % CONFETTI.length], { rough: 0.4, emissive: CONFETTI[k % CONFETTI.length], emissiveIntensity: 0.35 })} />
        );
      })}
    </group>
  );
};

/** Warm rays spilling out of the opened doors. */
export const DoorRays: React.FC<{ open: number; at: V3 }> = ({ open, at }) => {
  if (open <= 0.02) return null;
  return (
    <group position={at}>
      {[-0.5, 0, 0.5].map((a, i) => (
        <mesh key={i} position={[a * 2, 3.8, 5]} rotation={[-Math.PI / 2 + 0.25, 0, a * 0.5]}>
          <planeGeometry args={[4.5, 13]} />
          <meshBasicMaterial map={glowTexture("#ffd98a")} transparent opacity={0.28 * open} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0.8]}>
        <planeGeometry args={[11, 11]} />
        {glowMat("#ffcf7a", 0.6 * open)}
      </mesh>
    </group>
  );
};
