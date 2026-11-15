// The game-world park around the mansion: gradient sky, studded baseplate, paths, blocky trees, bench, lamps, clouds.
import React, { useMemo } from "react";
import * as THREE from "three";
import { BENCH } from "../story/layout.ts";
import { hash } from "../story/math.ts";
import { block, plastic } from "./materials.ts";
import { studTexture, tileTexture } from "./textures.ts";

const Sky: React.FC<{ warm: number }> = ({ warm }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, toneMapped: false,
    uniforms: { top: { value: new THREE.Color("#2f86e8") }, horizon: { value: new THREE.Color("#c9e8ff") }, warm: { value: 0 } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform float warm; varying vec3 vP;
      void main(){ float h = clamp(vP.y * 1.6, 0.0, 1.0); vec3 c = mix(horizon, top, pow(h, 0.7));
        c = mix(c, c * vec3(1.08, 0.98, 0.9) + vec3(0.06, 0.03, 0.0), warm * (1.0 - h));
        gl_FragColor = vec4(c, 1.0); }`,
  }), []);
  mat.uniforms.warm.value = warm;
  return <mesh material={mat} renderOrder={-1}><sphereGeometry args={[450, 32, 16]} /></mesh>;
};

const Tree: React.FC<{ x: number; z: number; s: number; seed: number }> = ({ x, z, s, seed }) => {
  const greens = ["#2f9e44", "#37b24d", "#2b8a3e"];
  return (
    <group position={[x, 0, z]} scale={s} rotation={[0, hash(seed) * Math.PI, 0]}>
      <mesh castShadow receiveShadow geometry={block(1.2, 5, 1.2, 0.1)} material={plastic("#7a4b2a", { rough: 0.9 })} position={[0, 2.5, 0]} />
      <mesh castShadow receiveShadow geometry={block(5, 3.4, 5, 0.5)} material={plastic(greens[seed % 3], { rough: 0.85 })} position={[0, 6, 0]} />
      <mesh castShadow geometry={block(3.4, 2.4, 3.4, 0.45)} material={plastic(greens[(seed + 1) % 3], { rough: 0.85 })} position={[0.3, 8.4, -0.2]} />
    </group>
  );
};

const Bench: React.FC = () => {
  const [x, y, z] = BENCH.pos;
  const wood = plastic("#a8642f", { rough: 0.7 });
  const iron = plastic("#33363d", { rough: 0.4, metal: 0.5 });
  return (
    <group position={[x, y, z]}>
      {[-0.55, 0, 0.55].map((dz) => <mesh key={dz} castShadow receiveShadow geometry={block(BENCH.length, 0.22, 0.5, 0.06)} material={wood} position={[0, BENCH.seat - 0.11, dz + 0.1]} />)}
      {[1.6, 2.4].map((dy) => <mesh key={dy} castShadow geometry={block(BENCH.length, 0.5, 0.2, 0.06)} material={wood} position={[0, dy, -0.75]} rotation={[-0.12, 0, 0]} />)}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (BENCH.length / 2 - 0.4), 0, 0]}>
          <mesh castShadow geometry={block(0.25, BENCH.seat, 0.25, 0.04)} material={iron} position={[0, BENCH.seat / 2, 0.6]} />
          <mesh castShadow geometry={block(0.25, 2.8, 0.25, 0.04)} material={iron} position={[0, 1.4, -0.75]} />
          <mesh castShadow geometry={block(0.25, 0.2, 1.6, 0.04)} material={iron} position={[0, BENCH.seat + 0.6, 0]} />
        </group>
      ))}
    </group>
  );
};

const Lamp: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh castShadow material={plastic("#2d2f36", { rough: 0.4, metal: 0.5 })} position={[0, 3.5, 0]}><cylinderGeometry args={[0.15, 0.22, 7, 10]} /></mesh>
    <mesh geometry={block(0.9, 1.1, 0.9, 0.12)} material={plastic("#fff4cf", { emissive: "#ffe9a8", emissiveIntensity: 0.8 })} position={[0, 7.4, 0]} />
    <mesh geometry={block(1.1, 0.2, 1.1, 0.05)} material={plastic("#2d2f36")} position={[0, 8.05, 0]} />
  </group>
);

const Clouds: React.FC<{ f: number }> = ({ f }) => (
  <group position={[f * 0.02, 0, 0]}>
    {Array.from({ length: 14 }, (_, i) => {
      const x = -160 + hash(i) * 320, y = 55 + hash(i + 40) * 35, z = -60 - hash(i + 80) * 200;
      const w = 14 + hash(i + 7) * 18;
      return (
        <group key={i} position={[x, y, z]}>
          <mesh geometry={block(w, 4, 8, 1.6)} material={plastic("#ffffff", { rough: 1, emissive: "#ffffff", emissiveIntensity: 0.35 })} />
          <mesh geometry={block(w * 0.55, 3.6, 6, 1.5)} material={plastic("#ffffff", { rough: 1, emissive: "#ffffff", emissiveIntensity: 0.35 })} position={[w * 0.1, 3, 0]} />
        </group>
      );
    })}
  </group>
);

/** Far-off blocky builds give the vertical frames depth behind the mansion. */
const Skyline: React.FC = () => (
  <group>
    {Array.from({ length: 16 }, (_, i) => {
      const x = -120 + i * 16 + hash(i) * 6, z = -70 - hash(i + 3) * 40, h = 10 + hash(i + 5) * 26;
      const cols = ["#8fb8de", "#a3c4e8", "#b7cde6", "#9db7d6"];
      return <mesh key={i} position={[x, h / 2, z]} geometry={block(9 + hash(i + 9) * 8, h, 9, 0.3)} material={plastic(cols[i % 4], { rough: 1 })} />;
    })}
  </group>
);

const TREES: [number, number, number][] = [
  [-26, -6, 1.1], [-30, 6, 1.3], [-22, 14, 1], [26, -4, 1.2], [30, 8, 1.1], [31, 21, 1.3], [-3, 30, 0.9],
  [-12, 24, 1.2], [20, -22, 1.4], [-24, -24, 1.3], [36, -16, 1.2], [-38, -12, 1.1], [14, 30, 1.2], [-4, 34, 1.1],
];

export const World: React.FC<{ f: number; warm: number }> = ({ f, warm }) => {
  const grass = studTexture("#4fb548");
  const g = useMemo(() => { const t = grass.clone(); t.needsUpdate = true; t.repeat.set(150, 150); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }, [grass]);
  const path = useMemo(() => { const t = tileTexture("#c9c2b4").clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 9); return t; }, []);
  return (
    <group>
      <Sky warm={warm} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial map={g} roughness={0.9} />
      </mesh>
      {/* path from the mansion to the bench */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, -0.62]} position={[7.5, 0.02, 4]}>
        <planeGeometry args={[4.5, 24]} />
        <meshStandardMaterial map={path} roughness={0.8} />
      </mesh>
      <Bench />
      <Lamp x={BENCH.pos[0] + BENCH.length / 2 + 1.4} z={BENCH.pos[2] - 0.4} />
      <Lamp x={-7} z={-4} />
      <Lamp x={7} z={-4} />
      {TREES.map(([x, z, s], i) => <Tree key={i} x={x} z={z} s={s} seed={i} />)}
      {/* flower boxes by the bench */}
      {[-1, 1].map((s) => (
        <group key={s} position={[BENCH.pos[0] + s * 6.4, 0, BENCH.pos[2] - 0.6]}>
          <mesh castShadow geometry={block(2, 1, 2, 0.15)} material={plastic("#8c5a3c")} position={[0, 0.5, 0]} />
          {[[-0.5, -0.4, "#ff5d8f"], [0.4, 0.3, "#ffd23f"], [0.3, -0.5, "#ffffff"], [-0.4, 0.5, "#9b5de5"]].map(([x, z, c], i) => (
            <mesh key={i} geometry={block(0.5, 0.5, 0.5, 0.15)} material={plastic(c as string)} position={[x as number, 1.25, z as number]} />
          ))}
        </group>
      ))}
      <Skyline />
      <Clouds f={f} />
    </group>
  );
};
