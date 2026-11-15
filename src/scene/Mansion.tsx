// The VIP mansion: hollow entrance hall, hinged double doors, columns, glowing windows, rope line and sign.
import React, { useMemo } from "react";
import * as THREE from "three";
import { MANSION, ROPE_Z } from "../story/layout.ts";
import { F } from "../story/timeline.ts";
import { ramp } from "../story/math.ts";
import { block, gold, plastic } from "./materials.ts";
import { interiorTexture, labelTexture, tileTexture } from "./textures.ts";

const M = MANSION;
const WALL = "#f4ead8";
const TRIM = "#d9c7a6";
const ROOF = "#5b3a8c";

let ped: THREE.BufferGeometry | null = null;
/** triangular pediment over the portico */
const pediment = () => {
  if (!ped) {
    const sh = new THREE.Shape([new THREE.Vector2(-10, 0), new THREE.Vector2(10, 0), new THREE.Vector2(0, 3.6)]);
    ped = new THREE.ExtrudeGeometry(sh, { depth: 1.4, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 });
  }
  return ped;
};

export const doorOpenAmount = (f: number) => ramp(f, F.doorsOpen, F.doorsOpen + 36);

const Window: React.FC<{ x: number; y: number; z: number; glow: number }> = ({ x, y, z, glow }) => (
  <group position={[x, y, z]}>
    <mesh geometry={block(3, 3.8, 0.4, 0.08)} material={plastic("#ffffff")} />
    <mesh position={[0, 0, 0.12]} geometry={block(2.4, 3.2, 0.3, 0.04)}
      material={plastic("#9fd3ff", { rough: 0.15, metal: 0.2, emissive: "#ffd98a", emissiveIntensity: 0.25 + glow })} />
    <mesh position={[0, 0, 0.3]} geometry={block(0.16, 3.2, 0.1, 0.03)} material={plastic("#ffffff")} />
    <mesh position={[0, 0, 0.3]} geometry={block(2.4, 0.16, 0.1, 0.03)} material={plastic("#ffffff")} />
    <mesh position={[0, -2.1, 0.35]} geometry={block(3.4, 0.3, 0.8, 0.06)} material={plastic(TRIM)} />
  </group>
);

const Column: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, M.plinthTop, M.facadeZ + 1.1]}>
    <mesh castShadow receiveShadow geometry={block(1.6, 0.6, 1.6, 0.06)} material={plastic(TRIM)} position={[0, 0.3, 0]} />
    <mesh castShadow receiveShadow position={[0, 6.2, 0]} material={plastic("#ffffff", { rough: 0.4 })}>
      <cylinderGeometry args={[0.55, 0.62, 11.2, 16]} />
    </mesh>
    <mesh castShadow geometry={block(1.7, 0.6, 1.7, 0.06)} material={gold()} position={[0, 12, 0]} />
  </group>
);

const Door: React.FC<{ side: -1 | 1; open: number }> = ({ side, open }) => (
  <group position={[side * (M.doorW / 2), M.plinthTop, M.facadeZ]} rotation={[0, -side * open * 1.75, 0]}>
    <group position={[-side * (M.doorW / 4), M.doorH / 2, 0]}>
      <mesh castShadow geometry={block(M.doorW / 2 - 0.06, M.doorH, 0.4, 0.05)} material={plastic("#6b3b1f", { rough: 0.45 })} />
      {[2, -1.4].map((y) => (
        <mesh key={y} position={[0, y, 0.22]} geometry={block(M.doorW / 2 - 0.8, y > 0 ? 3 : 4, 0.08, 0.04)} material={plastic("#7d4a28", { rough: 0.4 })} />
      ))}
      <mesh position={[side * (M.doorW / 4 - 0.45), 0, 0.3]} geometry={block(0.22, 1.2, 0.2, 0.08)} material={gold()} />
    </group>
  </group>
);

/** Velvet rope between two gold posts; unhooks and drops when the doors open. */
const RopeLine: React.FC<{ f: number }> = ({ f }) => {
  const k = ramp(f, F.doorsOpen - 4, F.doorsOpen + 26);
  const postX = 3.3 + k * 3.2;
  const rope = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-3.3, 2.7, 0), new THREE.Vector3(0, 1.9, 0.05), new THREE.Vector3(3.3, 2.7, 0)]);
    return new THREE.TubeGeometry(curve, 24, 0.12, 8, false);
  }, []);
  return (
    <group position={[0, 0, ROPE_Z]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * postX, 0, 0]}>
          <mesh castShadow geometry={block(1, 0.25, 1, 0.08)} material={gold()} position={[0, 0.12, 0]} />
          <mesh castShadow material={gold()} position={[0, 1.45, 0]}><cylinderGeometry args={[0.16, 0.16, 2.6, 12]} /></mesh>
          <mesh castShadow material={gold()} position={[0, 2.85, 0]}><sphereGeometry args={[0.28, 16, 12]} /></mesh>
        </group>
      ))}
      {k < 0.35 && <mesh castShadow geometry={rope} material={plastic("#b3122e", { rough: 0.7 })} scale={[1 + k, 1 - k * 2, 1]} />}
    </group>
  );
};

export const Mansion: React.FC<{ f: number }> = ({ f }) => {
  const open = doorOpenAmount(f);
  const sideW = (M.width - M.doorW) / 2;
  const sideX = M.doorW / 2 + sideW / 2;
  const h = M.height;
  const backZ = M.facadeZ - 7; // the entrance hall is 7 deep
  const tile = tileTexture("#e9e1d3");
  const welcome = f > F.doorsOpen + 18;
  const sign = welcome
    ? labelTexture("sign-open", "OPEN TO ALL", { w: 1024, h: 256, bg: "#2a9d5c", fg: "#ffffff", border: "#ffd23f", size: 120 })
    : labelTexture("sign-vip", "VIP ONLY", { w: 1024, h: 256, bg: "#5b2a9c", fg: "#ffd23f", border: "#ffd23f", size: 130 });
  const stand = welcome
    ? labelTexture("stand-open", "FREE ENTRY", { w: 512, h: 320, bg: "#ffffff", fg: "#2a9d5c", border: "#2a9d5c", size: 70 })
    : labelTexture("stand-vip", "10,000 R$", { w: 512, h: 320, bg: "#ffffff", fg: "#5b2a9c", border: "#ffd23f", size: 76 });
  return (
    <group>
      {/* terrace + step */}
      <mesh receiveShadow castShadow position={[0, M.plinthTop / 2, (M.facadeZ + M.terraceFrontZ) / 2 - 0.5]}>
        <boxGeometry args={[M.width + 4, M.plinthTop, M.facadeZ * -1 + M.terraceFrontZ + 1]} />
        <meshStandardMaterial map={tile} color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh receiveShadow position={[0, M.plinthTop / 4, M.terraceFrontZ + 0.5]} geometry={block(M.width + 4, M.plinthTop / 2, 1, 0.04)} material={plastic("#ddd2bf")} />
      {/* walls around the hall */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow receiveShadow position={[s * sideX, M.plinthTop + h / 2, M.facadeZ - M.depth / 2]}>
          <boxGeometry args={[sideW, h, M.depth]} />
          <meshStandardMaterial color={WALL} roughness={0.8} />
        </mesh>
      ))}
      <mesh castShadow position={[0, M.plinthTop + M.doorH + (h - M.doorH) / 2, M.facadeZ - M.depth / 2]}>
        <boxGeometry args={[M.doorW, h - M.doorH, M.depth]} />
        <meshStandardMaterial color={WALL} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, M.plinthTop + M.doorH / 2, backZ - (M.depth - 7) / 2]}>
        <boxGeometry args={[M.doorW, M.doorH, M.depth - 7]} />
        <meshStandardMaterial color={WALL} roughness={0.8} />
      </mesh>
      {/* warm hall interior */}
      <mesh position={[0, M.plinthTop + M.doorH / 2, backZ + 0.02]}>
        <planeGeometry args={[M.doorW, M.doorH]} />
        <meshBasicMaterial map={interiorTexture()} toneMapped={false} color={new THREE.Color(1.15, 1.1, 1.0)} />
      </mesh>
      <mesh position={[0, M.plinthTop + 0.02, M.facadeZ - 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 7]} />
        <meshStandardMaterial color="#b8321f" />
      </mesh>
      <pointLight position={[0, M.plinthTop + 5, M.facadeZ - 4]} color="#ffcf7a" intensity={30 + 220 * open} distance={30} decay={1.6} />
      {/* roof: cornice, slab and pediment */}
      <mesh castShadow position={[0, M.plinthTop + h + 0.4, M.facadeZ - M.depth / 2 + 0.6]} geometry={block(M.width + 2, 0.8, M.depth + 2.2, 0.1)} material={plastic(TRIM)} />
      <mesh castShadow position={[0, M.plinthTop + h + 1.3, M.facadeZ - M.depth / 2 + 0.4]} geometry={block(M.width + 1, 1, M.depth + 1.4, 0.1)} material={plastic(ROOF, { rough: 0.5 })} />
      <mesh castShadow geometry={pediment()} position={[0, M.plinthTop + h + 0.8, M.facadeZ + 0.6]}>
        <meshStandardMaterial color={WALL} roughness={0.8} />
      </mesh>
      <mesh position={[0, M.plinthTop + h + 0.9, M.facadeZ + 1.2]} geometry={block(M.width + 2.4, 0.35, 0.6, 0.08)} material={gold()} />
      {/* columns + portico beam */}
      {[-11, -5.5, 5.5, 11].map((x) => <Column key={x} x={x} />)}
      <mesh castShadow position={[0, M.plinthTop + 12.6, M.facadeZ + 1.1]} geometry={block(25, 0.8, 2.2, 0.08)} material={plastic(TRIM)} />
      {/* windows */}
      {[-14, -8.3, 8.3, 14].flatMap((x) => [4.3, 10].map((y) => (
        <Window key={`${x}:${y}`} x={x} y={M.plinthTop + y} z={M.facadeZ + 0.2} glow={0.9 * open} />
      )))}
      {/* door frame + doors */}
      <mesh position={[0, M.plinthTop + M.doorH + 0.35, M.facadeZ + 0.25]} geometry={block(M.doorW + 1.4, 0.7, 0.6, 0.08)} material={gold()} />
      {[-1, 1].map((s) => <mesh key={s} position={[s * (M.doorW / 2 + 0.35), M.plinthTop + M.doorH / 2, M.facadeZ + 0.25]} geometry={block(0.7, M.doorH, 0.6, 0.08)} material={gold()} />)}
      <Door side={-1} open={open} />
      <Door side={1} open={open} />
      {/* sign */}
      <mesh position={[0, M.plinthTop + M.doorH + 2.2, M.facadeZ + 0.3]}>
        <planeGeometry args={[8.4, 2.1]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* red carpet down the steps and through the rope */}
      <mesh receiveShadow position={[0, 0.03, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 14]} />
        <meshStandardMaterial color="#b8321f" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[0, M.plinthTop + 0.03, M.facadeZ + 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial color="#b8321f" roughness={0.9} />
      </mesh>
      <RopeLine f={f} />
      {/* price stand next to the rope */}
      <group position={[-6.2, 0, ROPE_Z + 1.4]} rotation={[0, 0.35, 0]}>
        <mesh castShadow material={gold()} position={[0, 1.2, 0]}><cylinderGeometry args={[0.12, 0.12, 2.4, 10]} /></mesh>
        <mesh position={[0, 2.9, 0.05]}><planeGeometry args={[2.6, 1.6]} /><meshBasicMaterial map={stand} toneMapped={false} /></mesh>
      </group>
      {/* hedges */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow receiveShadow position={[s * 12.5, 1, M.terraceFrontZ + 2.2]} geometry={block(9, 2, 1.8, 0.4)} material={plastic("#2f8f3a", { rough: 0.9 })} />
      ))}
    </group>
  );
};
