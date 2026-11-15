// Procedural block-style avatar: legs, torso, arms and a cube head with a drawn face, plus hair and accessories.
// Pivots: legs at the hips, arms at the shoulders, head at the neck, so poses from story/acting.ts read clearly.
import React from "react";
import * as THREE from "three";
import type { Pose } from "../story/acting.ts";
import type { Look } from "./looks.ts";
import { block, gold, plastic } from "./materials.ts";
import { faceTexture } from "./textures.ts";

const HIP = 2;
const headCache = new Map<string, THREE.Material[]>();
/** six box-face materials; the drawn face goes on +z (index 4) */
const headMaterials = (skinColor: string, expr: Pose["expression"], blink: boolean) => {
  const key = `${skinColor}:${expr}:${blink}`;
  let mats = headCache.get(key);
  if (!mats) {
    const skin = plastic(skinColor, { rough: 0.6 });
    const face = new THREE.MeshStandardMaterial({ map: faceTexture(skinColor, expr, blink), roughness: 0.6 });
    mats = [skin, skin, skin, skin, face, skin];
    headCache.set(key, mats);
  }
  return mats;
};
const HEAD = 1.32;

const Hair: React.FC<{ look: Look }> = ({ look }) => {
  const c = look.hairColor;
  const top = HEAD / 2;
  switch (look.hair) {
    case "bacon": {
      // the classic wavy starter hair, built from alternating rippled strips
      const tones = [c, "#b5562b", c, "#c8693a", c, "#b5562b"];
      return (
        <group>
          {tones.map((t, i) => (
            <mesh key={i} castShadow geometry={block(0.26, 0.34, 1.52, 0.1)} material={plastic(t, { rough: 0.7 })}
              position={[-0.66 + i * 0.265, top + 0.08 + (i % 2) * 0.06, -0.03]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.12]} />
          ))}
          <mesh castShadow geometry={block(1.5, 0.9, 0.3, 0.1)} material={plastic(c, { rough: 0.7 })} position={[0, top - 0.32, -0.62]} />
          {[-1, 1].map((s) => (
            <mesh key={s} castShadow geometry={block(0.22, 0.75, 1.1, 0.08)} material={plastic(c, { rough: 0.7 })} position={[s * 0.72, top - 0.25, -0.12]} />
          ))}
          <mesh castShadow geometry={block(1.4, 0.22, 0.3, 0.08)} material={plastic("#b5562b", { rough: 0.7 })} position={[0, top - 0.02, 0.6]} rotation={[0.25, 0, 0]} />
        </group>
      );
    }
    case "messy":
      return (
        <group>
          <mesh castShadow geometry={block(1.48, 0.36, 1.48, 0.14)} material={plastic(c, { rough: 0.7 })} position={[0, top + 0.08, 0]} />
          {[-0.45, -0.1, 0.25, 0.55].map((x, i) => (
            <mesh key={i} castShadow geometry={block(0.38, 0.42, 0.34, 0.1)} material={plastic(c, { rough: 0.7 })} position={[x, top - 0.08 + (i % 2) * 0.06, 0.6]} rotation={[0.3, 0, (i - 1.5) * 0.25]} />
          ))}
          {[-0.4, 0.3].map((x, i) => (
            <mesh key={i} castShadow geometry={block(0.4, 0.4, 0.4, 0.1)} material={plastic(c, { rough: 0.7 })} position={[x, top + 0.32, -0.15 + i * 0.2]} rotation={[0.4, i, 0.5]} />
          ))}
        </group>
      );
    case "slick":
      return <mesh castShadow geometry={block(1.44, 0.3, 1.46, 0.14)} material={plastic(c, { rough: 0.2 })} position={[0, top + 0.02, -0.04]} />;
    case "spiky":
      return (
        <group>
          <mesh castShadow geometry={block(1.44, 0.24, 1.44, 0.1)} material={plastic(c)} position={[0, top + 0.04, 0]} />
          {[-0.45, 0, 0.45].flatMap((x) => [-0.35, 0.3].map((z) => (
            <mesh key={`${x}${z}`} castShadow material={plastic(c)} position={[x, top + 0.34, z]} rotation={[z * 0.6, 0, -x * 0.6]}>
              <coneGeometry args={[0.26, 0.6, 4]} />
            </mesh>
          )))}
        </group>
      );
    case "bob":
      return (
        <group>
          <mesh castShadow geometry={block(1.56, 0.4, 1.5, 0.16)} material={plastic(c)} position={[0, top + 0.06, -0.02]} />
          <mesh castShadow geometry={block(1.6, 1.0, 0.4, 0.14)} material={plastic(c)} position={[0, top - 0.45, -0.6]} />
          {[-1, 1].map((s) => <mesh key={s} castShadow geometry={block(0.24, 1.0, 1.3, 0.1)} material={plastic(c)} position={[s * 0.76, top - 0.42, -0.05]} />)}
        </group>
      );
    case "bun":
      return (
        <group>
          <mesh castShadow geometry={block(1.46, 0.3, 1.46, 0.14)} material={plastic(c)} position={[0, top + 0.04, 0]} />
          <mesh castShadow geometry={block(0.6, 0.55, 0.6, 0.25)} material={plastic(c)} position={[0, top + 0.42, -0.25]} />
        </group>
      );
    case "cap":
      return (
        <group>
          <mesh castShadow geometry={block(1.46, 0.42, 1.46, 0.16)} material={plastic(c)} position={[0, top + 0.1, 0]} />
          <mesh castShadow geometry={block(1.3, 0.1, 0.7, 0.04)} material={plastic(c)} position={[0, top - 0.05, 0.95]} />
        </group>
      );
    case "tophat":
      return (
        <group>
          <mesh castShadow geometry={block(1.8, 0.12, 1.8, 0.05)} material={plastic(c, { rough: 0.3 })} position={[0, top + 0.06, 0]} />
          <mesh castShadow geometry={block(1.15, 1.0, 1.15, 0.08)} material={plastic(c, { rough: 0.3 })} position={[0, top + 0.6, 0]} />
          <mesh geometry={block(1.18, 0.18, 1.18, 0.04)} material={gold()} position={[0, top + 0.22, 0]} />
        </group>
      );
    default:
      return null;
  }
};

const HeadAccessories: React.FC<{ look: Look }> = ({ look }) => {
  const top = HEAD / 2;
  return (
    <>
      {look.accessories.includes("crown") && (
        <group position={[0, top + 0.28, 0]}>
          <mesh castShadow geometry={block(1.1, 0.3, 1.1, 0.04)} material={gold()} />
          {[[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45], [0, 0.45], [0, -0.45]].map(([x, z], i) => (
            <mesh key={i} castShadow material={gold()} position={[x, 0.32, z]}><coneGeometry args={[0.14, 0.38, 4]} /></mesh>
          ))}
          <mesh geometry={block(0.2, 0.2, 0.08, 0.04)} material={plastic("#e83f6f", { rough: 0.2, emissive: "#e83f6f", emissiveIntensity: 0.4 })} position={[0, 0, 0.56]} />
        </group>
      )}
      {look.accessories.includes("shades") && (
        <group position={[0, 0.12, HEAD / 2 + 0.03]}>
          <mesh geometry={block(1.3, 0.08, 0.06, 0.02)} material={plastic("#111", { rough: 0.2 })} position={[0, 0.12, 0]} />
          {[-0.32, 0.32].map((x) => <mesh key={x} geometry={block(0.5, 0.32, 0.08, 0.06)} material={plastic("#16161c", { rough: 0.08, metal: 0.4 })} position={[x, 0, 0]} />)}
        </group>
      )}
      {look.accessories.includes("headphones") && (
        <group>
          <mesh castShadow geometry={block(1.62, 0.16, 0.24, 0.06)} material={plastic("#2b2d42")} position={[0, top + 0.22, 0]} />
          {[-1, 1].map((s) => <mesh key={s} castShadow geometry={block(0.26, 0.6, 0.6, 0.12)} material={plastic("#ff5d8f")} position={[s * 0.78, 0, 0]} />)}
        </group>
      )}
      {look.accessories.includes("bow") && (
        <group position={[0.45, top + 0.18, 0.3]} rotation={[0, 0, 0.3]}>
          {[-1, 1].map((s) => <mesh key={s} geometry={block(0.34, 0.3, 0.16, 0.08)} material={plastic("#f15bb5")} position={[s * 0.2, 0, 0]} rotation={[0, 0, s * 0.4]} />)}
        </group>
      )}
    </>
  );
};

const TorsoAccessories: React.FC<{ look: Look }> = ({ look }) => {
  const trim = look.trim ?? "#ffffff";
  return (
    <>
      {look.accessories.includes("jacket") && [-1, 1].map((s) => (
        <mesh key={s} geometry={block(0.55, 1.95, 0.08, 0.03)} material={plastic(trim, { rough: 0.35, metal: trim === "#ffd23f" ? 0.5 : 0 })} position={[s * 0.55, 1, 0.52]} rotation={[0, 0, s * -0.12]} />
      ))}
      {look.accessories.includes("chain") && (
        <group position={[0, 1.45, 0.53]}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI * (0.15 + (0.7 * i) / 6);
            return <mesh key={i} geometry={block(0.16, 0.16, 0.08, 0.05)} material={gold()} position={[Math.cos(a) * 0.55, -Math.sin(a) * 0.55 + 0.15, 0]} />;
          })}
          <mesh geometry={block(0.32, 0.38, 0.1, 0.06)} material={gold()} position={[0, -0.5, 0]} />
        </group>
      )}
      {look.accessories.includes("hoodie") && (
        <>
          <mesh geometry={block(1.2, 0.55, 0.08, 0.05)} material={plastic(trim)} position={[0, 0.5, 0.52]} />
          <mesh castShadow geometry={block(1.7, 0.45, 0.5, 0.15)} material={plastic(trim)} position={[0, 2.0, -0.35]} />
          {[-0.25, 0.25].map((x) => <mesh key={x} geometry={block(0.08, 0.5, 0.06, 0.02)} material={plastic("#ffffff")} position={[x, 1.6, 0.53]} />)}
        </>
      )}
      {look.accessories.includes("stripe") && (
        <mesh geometry={block(2.02, 0.32, 1.02, 0.08)} material={plastic(trim)} position={[0, 1.2, 0]} />
      )}
    </>
  );
};

export const BlockAvatar: React.FC<{ look: Look; pose: Pose; scale?: number }> = ({ look, pose, scale = 1 }) => {
  const headMats = headMaterials(look.skin, pose.expression, pose.blink);
  if (!pose.visible) return null;
  const swing = Math.sin(pose.walk) * 0.75 * pose.walkAmt;
  const sitLeg = (-Math.PI / 2) * pose.sit;
  const bob = Math.abs(Math.cos(pose.walk)) * 0.12 * pose.walkAmt;
  const shirt = plastic(look.shirt);
  const pants = plastic(look.pants);
  const shoes = plastic(look.shoes);
  return (
    <group position={pose.pos} rotation={[0, pose.rotY, 0]} scale={scale}>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.5, HIP + pose.bounce + bob, 0]} rotation={[sitLeg + s * swing * (1 - pose.sit), 0, 0]}>
          <mesh castShadow receiveShadow geometry={block(0.96, 1.7, 0.96)} material={pants} position={[0, -0.85, 0]} />
          <mesh castShadow geometry={block(0.98, 0.32, 1.04, 0.1)} material={shoes} position={[0, -1.84, 0.02]} />
        </group>
      ))}
      {/* upper body */}
      <group position={[0, HIP + pose.bounce + bob, 0]} rotation={[pose.lean, 0, 0]}>
        <mesh castShadow receiveShadow geometry={block(2, 2, 1, 0.14)} material={shirt} position={[0, 1, 0]} />
        <TorsoAccessories look={look} />
        {/* arms */}
        {([-1, 1] as const).map((s) => {
          const extra = s < 0 ? pose.armL : pose.armR;
          return (
            <group key={s} position={[s * 1.5, 1.9, 0]} rotation={[extra[0] - s * swing * (1 - pose.sit) * 0.8, 0, s * 0.04 + extra[1]]}>
              <mesh castShadow geometry={block(0.96, 1.45, 0.96)} material={shirt} position={[0, -0.6, 0]} />
              <mesh castShadow geometry={block(0.9, 0.55, 0.9, 0.16)} material={plastic(look.skin, { rough: 0.6 })} position={[0, -1.6, 0]} />
            </group>
          );
        })}
        {/* head */}
        <group position={[0, 2.02, 0]} rotation={new THREE.Euler(pose.headPitch, pose.headYaw, pose.headRoll, "YXZ")}>
          <mesh castShadow geometry={block(0.7, 0.2, 0.7, 0.06)} material={plastic(look.skin, { rough: 0.6 })} position={[0, 0.06, 0]} />
          <mesh castShadow geometry={block(HEAD, HEAD, HEAD, 0.22)} material={headMats} position={[0, HEAD / 2 + 0.1, 0]} />
          <group position={[0, HEAD / 2 + 0.1, 0]}>
            <Hair look={look} />
            <HeadAccessories look={look} />
          </group>
        </group>
      </group>
    </group>
  );
};

/** height of the top of the head above the avatar's root (for tags and bubbles) */
export const AVATAR_TOP = HIP + 2.02 + HEAD + 0.1;
