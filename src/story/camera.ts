// Camera plan: hard cuts between shots, smootherstep glides inside them, and a slow creep on every hold
// (camera grammar borrowed from the reference toolkit's story.ts: no static holds, decaying flip-shakes on impacts).
import { F, sec } from "./timeline.ts";
import { pipPose, junoPose } from "./acting.ts";
import { type V3, lerp, lerp3, smoother, clamp01 } from "./math.ts";

export type CamState = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = { name: string; a: number; b: number; cam: (f: number) => CamState };

const glide = (f: number, a: number, b: number, from: CamState, to: CamState): CamState => {
  const t = smoother((f - a) / Math.max(1, b - a));
  return { pos: lerp3(from.pos, to.pos, t), look: lerp3(from.look, to.look, t), fov: lerp(from.fov, to.fov, t), roll: lerp(from.roll, to.roll, t) };
};
const C = (pos: V3, look: V3, fov = 45, roll = 0): CamState => ({ pos, look, fov, roll });
const between = (s: Shot, from: CamState, to: CamState) => (f: number) => glide(f, s.a, s.b, from, to);

const shot = (name: string, a: number, b: number, from: CamState, to: CamState): Shot => {
  const s: Shot = { name, a, b, cam: () => from };
  s.cam = between(s, from, to);
  return s;
};

// NOTE: the frame is 9:16, so the horizontal field of view is only ~0.56x the vertical one.
// At fov 60 a subject 10 studs wide fills the frame from ~15 studs away.

/** Leading camera in front of walking Pip: sees his face while he walks away from the mansion. */
const pipWalkCam = (f: number): CamState => {
  const p = pipPose(f);
  const dir: [number, number] = [0.59, 0.81];
  const lead = C([p.pos[0] + dir[0] * 10.5 + 2.6, 4.6, p.pos[2] + dir[1] * 10.5 - 1.4], [p.pos[0], 3.9, p.pos[2]], 58, 0);
  const end = C([12.6, 4.4, 21.5], [14, 2.9, 7.2], 58, 0);
  return glide(f, sec(7.9), sec(9.7), lead, end);
};

/** The kindness walk: wide from the bench side, Juno crossing toward camera, Pip alone in the foreground. */
const junoFollowCam = (f: number): CamState => {
  const j = junoPose(f);
  const look: V3 = [lerp(j.pos[0], 14.5, 0.5), 3.2, lerp(j.pos[2], 7, 0.5)];
  return glide(f, F.junoWalk, F.junoArrive, C([5.5, 6.2, 26], look, 60), C([9, 5.2, 25], look, 58));
};

export const SHOTS: Shot[] = [
  // 0-3 s: blocked at the rope. Over Pip's shoulder toward the smug rich avatar and his mansion.
  shot("ots-blocked", 0, sec(3), C([5.6, 4.6, 6.0], [-0.6, 4.4, -7.2], 60, -0.03), C([4.9, 4.4, 4.4], [-0.5, 4.4, -7.2], 58, -0.04)),
  // 3-5 s: the VIP crowd laughs. High wide that keeps Pip small in the foreground.
  shot("crowd-laughs", sec(3), F.pipTurn, C([-9, 9.5, 12.5], [0, 3.4, -9], 62, 0.03), C([-7.6, 8.6, 10.6], [0, 3.4, -9.5], 60, 0.04)),
  // 5-10 s: Pip turns away and walks to the bench alone (leading track), ends on the lonely bench.
  { name: "pip-walks-away", a: F.pipTurn, b: sec(10), cam: (f) => pipWalkCam(f) },
  // 10-13.3 s: Juno follows.
  { name: "juno-follows", a: sec(10), b: sec(13.3), cam: junoFollowCam },
  // 13.3-18 s: the offer, and Juno sits beside him.
  shot("bench-offer", sec(13.3), sec(18), C([16.4, 5.0, 26.5], [16.4, 3.4, 8.2], 60), C([16.2, 4.7, 24.2], [16.2, 3.3, 8.0], 58)),
  // 18-21.6 s: the notification. Close on Pip looking up, slightly low.
  shot("transfer-cu", sec(18), F.pipStand, C([10.6, 3.0, 16.2], [13, 4.6, 7.3], 56, 0.03), C([11, 3.1, 14.6], [13, 4.7, 7.3], 54, 0.04)),
  // 21.6-27 s: he stands and thanks Juno. Three-quarter two-shot from Juno's side.
  shot("thanks-two-shot", F.pipStand, sec(27), C([19.6, 4.8, 20.5], [15.2, 3.9, 8.0], 58), C([19.0, 4.7, 18.6], [15.0, 4.0, 8.0], 56)),
  // 27-29.2 s: hero low angle as the OWNER tag ignites over Pip.
  shot("owner-reveal", F.reveal, sec(29.2), C([5.6, 1.5, -8.4], [0.3, 5.8, -3.6], 62, 0.07), C([5.2, 1.6, -8.0], [0.2, 6.2, -3.6], 60, 0.08)),
  // 29.2-31.5 s: the frozen crowd, OWNER tag in the foreground.
  shot("crowd-frozen", sec(29.2), sec(31.5), C([-3.2, 9, 9.5], [0, 3.6, -10], 58, -0.02), C([-2.8, 8.4, 8], [0, 3.6, -10], 56, -0.02)),
  // 31.5-35 s: Goldie's jaw drop.
  shot("goldie-cu", sec(31.5), sec(35), C([-4.4, 4.2, -0.6], [0, 4.7, -7.2], 46, 0), C([-3.9, 4.3, -1.5], [0, 4.8, -7.2], 42, 0)),
  // 35-39 s: the doors swing open. Crane up from behind Pip.
  shot("doors-open", sec(35), sec(39), C([3.4, 5.2, 9.5], [0, 5.6, -13], 60), C([0.6, 11.5, 19], [0, 5.6, -13], 60)),
  // 39-42 s: everyone walks in. Side wide.
  shot("everyone-in", sec(39), sec(42), C([-22, 6.5, 7], [0, 3.2, -8], 58), C([-18.5, 6, 3], [0, 3.4, -9], 56)),
  // 42-45 s: CO-OWNER. Two-shot, mansion glowing behind.
  shot("co-owner", sec(42), sec(45), C([2.3, 4.8, 13], [2.3, 5.6, -3.3], 60), C([2.3, 4.7, 11], [2.3, 5.8, -3.3], 58)),
];

/** impact kicks: sign-flipping vertical shake decaying over 7 frames */
export const KICKS: { f: number; amp: number }[] = [
  { f: F.ownerTag, amp: 0.12 },
  { f: F.freeze, amp: 0.06 },
  { f: F.doorsOpen, amp: 0.14 },
  { f: F.coOwner, amp: 0.08 },
];

export const shotAt = (f: number): Shot => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

export const cameraAt = (f: number): CamState => {
  const s = shotAt(f);
  const c = s.cam(f);
  let shake = 0;
  for (const k of KICKS) {
    const d = f - k.f;
    if (d >= 0 && d < 7) shake += k.amp * (d % 2 ? -1 : 1) * (1 - clamp01(d / 7));
  }
  return { ...c, pos: [c.pos[0], c.pos[1] + shake, c.pos[2]] };
};
