// Small deterministic animation helpers (no randomness at render time).
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (u * 6 - 15) + 10); };
export const easeOutBack = (x: number) => { const u = clamp01(x); const c = 1.70158; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };
/** 0 before a, ramps to 1 over [a, b] with smootherstep */
export const ramp = (f: number, a: number, b: number) => smoother((f - a) / Math.max(1, b - a));
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** shortest-path angle interpolation */
export const lerpAngle = (a: number, b: number, t: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};
/** stable pseudo-random in [0,1) from an integer seed */
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export type Key<T> = { f: number; v: T };
/** keyframed value with smootherstep between keys */
export const keyed = (f: number, keys: Key<number>[]): number => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) if (f <= keys[i].f) {
    const a = keys[i - 1], b = keys[i];
    return lerp(a.v, b.v, smoother((f - a.f) / Math.max(1, b.f - a.f)));
  }
  return keys[keys.length - 1].v;
};
export const keyedAngle = (f: number, keys: Key<number>[]): number => {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) if (f <= keys[i].f) {
    const a = keys[i - 1], b = keys[i];
    return lerpAngle(a.v, b.v, smoother((f - a.f) / Math.max(1, b.f - a.f)));
  }
  return keys[keys.length - 1].v;
};
