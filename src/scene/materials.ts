import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const mats = new Map<string, THREE.Material>();
/** Cached plastic-like block material. */
export const plastic = (color: string, opts: { rough?: number; metal?: number; emissive?: string; emissiveIntensity?: number } = {}) => {
  const key = `${color}:${opts.rough ?? 0.55}:${opts.metal ?? 0}:${opts.emissive ?? ""}:${opts.emissiveIntensity ?? 0}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color, roughness: opts.rough ?? 0.55, metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? "#000000", emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
    mats.set(key, m);
  }
  return m;
};
export const gold = () => plastic("#ffcb3d", { rough: 0.28, metal: 0.65 });

const geos = new Map<string, THREE.BufferGeometry>();
/** Cached rounded box ("block") geometry. */
export const block = (w: number, h: number, d: number, r = 0.12) => {
  const key = `${w}:${h}:${d}:${r}`;
  let g = geos.get(key);
  if (!g) { g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)); geos.set(key, g); }
  return g;
};
