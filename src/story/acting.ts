// Character acting: every avatar's pose is a pure function of the frame number.
import { F, sec } from "./timeline.ts";
import { MANSION, PIP_AT_ROPE, GOLDIE_AT_ROPE, JUNO_SIDE, SEAT_PIP, SEAT_JUNO } from "./layout.ts";
import { type Key, type V3, clamp01, hash, keyed, keyedAngle, ramp } from "./math.ts";

export type Expression = "neutral" | "smile" | "grin" | "sad" | "laugh" | "shock" | "smug" | "happy" | "worried";

export type Pose = {
  pos: V3;
  rotY: number;
  /** walk cycle phase (radians) and amount 0..1 */
  walk: number;
  walkAmt: number;
  /** 0 = standing, 1 = seated */
  sit: number;
  bounce: number;
  /** body pitch, + leans forward */
  lean: number;
  headPitch: number; // - looks up
  headYaw: number; // + looks toward the avatar's left (+x when facing +z)
  headRoll: number;
  /** extra arm rotations [x, z]; x < 0 raises forward, z spreads outward */
  armL: [number, number];
  armR: [number, number];
  expression: Expression;
  blink: boolean;
  visible: boolean;
};

const base = (pos: V3, rotY: number): Pose => ({
  pos, rotY, walk: 0, walkAmt: 0, sit: 0, bounce: 0, lean: 0, headPitch: 0, headYaw: 0, headRoll: 0,
  armL: [0, 0], armR: [0, 0], expression: "neutral", blink: false, visible: true,
});

/** height of the walkable surface (terrace + step in front of the mansion) */
export const groundY = (x: number, z: number) => {
  if (Math.abs(x) > MANSION.width / 2) return 0;
  if (z < MANSION.terraceFrontZ) return MANSION.plinthTop;
  if (z < MANSION.terraceFrontZ + 1) return MANSION.plinthTop / 2;
  return 0;
};

type PathKey = { f: number; x: number; z: number };
/** keyed 2D path; returns position, walk phase (from distance travelled) and walk amount (from speed) */
const track = (f: number, keys: PathKey[], stride = 2.4) => {
  const xs: Key<number>[] = keys.map((k) => ({ f: k.f, v: k.x }));
  const zs: Key<number>[] = keys.map((k) => ({ f: k.f, v: k.z }));
  const at = (t: number): [number, number] => [keyed(t, xs), keyed(t, zs)];
  let dist = 0;
  let prev = at(keys[0].f);
  const end = Math.floor(f);
  for (let t = keys[0].f + 1; t <= end; t++) {
    const p = at(t);
    const d = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    if (d < 1) dist += d; // ignore teleports at cuts
    prev = p;
  }
  const p = at(f), q = at(f - 1);
  const speed = Math.hypot(p[0] - q[0], p[1] - q[1]);
  const walkAmt = speed > 1 ? 0 : clamp01(speed / 0.09);
  return { x: p[0], z: p[1], walk: (dist / stride) * Math.PI, walkAmt };
};

const blinkAt = (f: number, seed: number) => {
  const period = 55 + Math.floor(hash(seed) * 40);
  return (f + Math.floor(hash(seed + 9) * period)) % period < 4;
};

const laughMotion = (p: Pose, f: number, seed: number, strength = 1) => {
  const ph = f * 0.55 + seed * 1.7;
  p.bounce += Math.abs(Math.sin(ph)) * 0.18 * strength;
  p.headPitch += (-0.22 - 0.1 * Math.sin(ph * 2)) * strength;
  p.lean += -0.08 * strength;
  p.armL = [-0.55 * strength, -0.15 * strength];
  p.armR = [-0.55 * strength, 0.15 * strength];
  p.expression = "laugh";
};

const cheerMotion = (p: Pose, f: number, seed: number) => {
  const ph = f * 0.42 + seed * 2.1;
  p.bounce += Math.max(0, Math.sin(ph)) * 0.9;
  p.armL = [-2.7, -0.35];
  p.armR = [-2.7, 0.35];
  p.expression = "happy";
};

const face = (dx: number, dz: number) => Math.atan2(dx, dz);

// ------------------------------------------------------------------ Pip, the newcomer
const PIP_PATH: PathKey[] = [
  { f: 0, x: PIP_AT_ROPE[0], z: PIP_AT_ROPE[2] },
  { f: F.pipWalk, x: PIP_AT_ROPE[0], z: PIP_AT_ROPE[2] },
  { f: sec(8.4), x: 10, z: 10 },
  { f: sec(8.85), x: SEAT_PIP[0], z: 9.2 },
  { f: F.pipSit, x: SEAT_PIP[0], z: 9.2 },
  { f: F.pipSit + 20, x: SEAT_PIP[0], z: SEAT_PIP[2] },
  { f: F.pipStand, x: SEAT_PIP[0], z: SEAT_PIP[2] },
  { f: F.pipStand + 20, x: SEAT_PIP[0], z: 8.3 },
  { f: F.reveal - 1, x: SEAT_PIP[0], z: 8.3 },
  { f: F.reveal, x: PIP_AT_ROPE[0], z: PIP_AT_ROPE[2] }, // cut: time skip back to the mansion
  { f: F.coOwner, x: PIP_AT_ROPE[0], z: PIP_AT_ROPE[2] },
];
const PIP_FACE: Key<number>[] = [
  { f: 0, v: Math.PI },
  { f: F.pipTurn, v: Math.PI },
  { f: F.pipWalk, v: face(10, 13.6) },
  { f: sec(8.3), v: face(10, 13.6) },
  { f: sec(8.6), v: Math.PI / 2 },
  { f: sec(8.85), v: Math.PI / 2 },
  { f: F.pipSit, v: 0 },
  { f: F.pipStand + 20, v: 0 },
  { f: F.pipStand + 36, v: 0.9 }, // three-quarter toward Juno, head turned the rest of the way
  { f: F.reveal - 1, v: 0.9 },
  { f: F.reveal, v: Math.PI },
  { f: F.coOwner - 10, v: Math.PI },
  { f: F.coOwner + 6, v: face(4.6, 0.6) },
];

export const pipPose = (f: number): Pose => {
  const t = track(f, PIP_PATH);
  const p = base([t.x, groundY(t.x, t.z), t.z], keyedAngle(f, PIP_FACE));
  p.walk = t.walk; p.walkAmt = t.walkAmt; p.blink = blinkAt(f, 1);
  p.sit = keyed(f, [{ f: F.pipSit, v: 0 }, { f: F.pipSit + 20, v: 1 }, { f: F.pipStand, v: 1 }, { f: F.pipStand + 20, v: 0 }]);
  if (f < F.laughStart) {
    p.expression = "worried";
    p.headPitch = -0.12; // looking up at Goldie
  } else if (f < F.pipWalk) {
    p.expression = "sad";
    p.headPitch = keyed(f, [{ f: F.laughStart, v: -0.1 }, { f: F.laughStart + 30, v: 0.32 }]);
    p.lean = 0.05;
    p.armL = [0.08, 0.05]; p.armR = [0.08, -0.05];
  } else if (f < F.junoArrive) {
    p.expression = "sad";
    p.headPitch = 0.3;
    p.lean = 0.07;
    if (f > F.pipSit + 20) { p.headPitch = 0.42; p.armL = [-0.5, 0.1]; p.armR = [-0.5, -0.1]; } // slumped, hands in lap
  } else if (f < F.transfer) {
    p.headPitch = keyed(f, [{ f: F.junoArrive, v: 0.35 }, { f: F.junoArrive + 15, v: -0.05 }]);
    p.headYaw = keyed(f, [{ f: F.junoArrive, v: 0 }, { f: F.junoArrive + 15, v: 0.55 }, { f: F.junoSit + 20, v: 0.5 }]);
    p.expression = f < F.junoOffer + 20 ? "worried" : "smile";
    p.armL = [-0.5, 0.1]; p.armR = [-0.5, -0.1];
  } else if (f < F.reveal) {
    // the ownership notification pops; he looks up at it, stunned, then stands and thanks Juno
    const look = ramp(f, F.transfer, F.transfer + 10) * (1 - ramp(f, sec(21.4), sec(21.9)));
    p.headPitch = -0.38 * look;
    p.headYaw = f < F.pipStand ? 0.5 * (1 - look) : 0.4 * ramp(f, F.pipStand + 20, F.pipStand + 36);
    p.expression = f < F.transfer + 6 ? "smile" : f < sec(21.3) ? "shock" : "happy";
    p.armL = f < F.pipStand ? [-0.5, 0.1] : [0, 0];
    p.armR = f < F.pipStand ? [-0.5, -0.1] : [0, 0];
    if (f > sec(22.4)) { // hand over heart while saying thanks
      const k = ramp(f, sec(22.4), sec(22.9)) * (1 - ramp(f, sec(26.2), sec(26.8)));
      p.armR = [-1.25 * k, -0.55 * k];
      p.headRoll = 0.08 * k;
      p.headPitch = 0.05 * k;
    }
  } else if (f < F.coOwner) {
    p.expression = f < F.doorsCue ? "smile" : "grin";
    p.headPitch = -0.1;
    // big gesture at the doors: right arm sweeps up, then both arms open wide
    const up = ramp(f, F.doorsCue, F.doorsCue + 12) * (1 - ramp(f, F.doorsOpen + 30, F.doorsOpen + 45));
    const wide = ramp(f, F.doorsOpen + 30, F.doorsOpen + 45) * (1 - ramp(f, sec(41.2), sec(41.9)));
    p.armR = [-2.6 * up - 1.2 * wide, 1.1 * wide];
    p.armL = [-1.2 * wide, -1.1 * wide];
    p.bounce = 0.12 * Math.max(0, Math.sin((f - F.doorsOpen) * 0.3)) * wide;
  } else {
    p.expression = "happy";
    const k = ramp(f, F.coOwner + 4, F.coOwner + 14);
    p.armR = [-1.4 * k, 0.15 * k]; // offers his hand toward Juno
    p.headPitch = -0.05;
  }
  return p;
};

// ------------------------------------------------------------------ Juno, the kind player
const JUNO_PATH: PathKey[] = [
  { f: 0, x: JUNO_SIDE[0], z: JUNO_SIDE[2] },
  { f: F.junoWalk, x: JUNO_SIDE[0], z: JUNO_SIDE[2] },
  { f: F.junoArrive, x: 19.2, z: 9.6 },
  { f: F.junoSit - 14, x: 19.2, z: 9.6 },
  { f: F.junoSit, x: SEAT_JUNO[0], z: 9.2 },
  { f: F.junoSit + 20, x: SEAT_JUNO[0], z: SEAT_JUNO[2] },
  { f: F.reveal - 1, x: SEAT_JUNO[0], z: SEAT_JUNO[2] },
  { f: F.reveal, x: 4.6, z: -3.0 },
];
const JUNO_FACE: Key<number>[] = [
  { f: 0, v: face(-8.5, -1.1) },
  { f: F.pipWalk, v: face(-8.5, -1.1) },
  { f: sec(8.6), v: face(4, 10) }, // watches Pip walk away
  { f: F.junoWalk, v: face(10.7, 12.1) },
  { f: F.junoArrive - 4, v: face(10.7, 12.1) },
  { f: F.junoArrive + 10, v: face(-0.64, 0.77) }, // cheats three-quarter to camera, head turned to Pip
  { f: F.junoSit - 14, v: face(-0.64, 0.77) },
  { f: F.junoSit, v: 0 },
  { f: F.reveal - 1, v: 0 },
  { f: F.reveal, v: Math.PI },
  { f: F.coOwner - 6, v: Math.PI },
  { f: F.coOwner + 8, v: face(-4.6, -0.6) },
];

export const junoPose = (f: number): Pose => {
  const t = track(f, JUNO_PATH);
  const p = base([t.x, groundY(t.x, t.z), t.z], keyedAngle(f, JUNO_FACE));
  p.walk = t.walk; p.walkAmt = t.walkAmt; p.blink = blinkAt(f, 2);
  p.sit = keyed(f, [{ f: F.junoSit, v: 0 }, { f: F.junoSit + 20, v: 1 }, { f: F.reveal - 1, v: 1 }, { f: F.reveal, v: 0 }]);
  if (f < F.junoWalk) {
    p.expression = f < F.laughStart ? "neutral" : "worried";
    p.armL = [-0.3, 0]; p.armR = [-0.3, 0]; // hands together, uneasy
  } else if (f < F.junoSit) {
    p.expression = "smile";
    if (f > F.junoOffer) { // open-palm offer toward the empty bench seat
      const k = ramp(f, F.junoOffer, F.junoOffer + 12) * (1 - ramp(f, F.junoSit - 18, F.junoSit - 8));
      p.armL = [-1.3 * k, -0.45 * k];
      p.headRoll = 0.1 * k;
    }
    p.headYaw = -0.55 * ramp(f, F.junoArrive, F.junoArrive + 12);
  } else if (f < F.reveal) {
    p.expression = f > F.pipStand + 30 ? "happy" : "smile";
    p.headYaw = -0.5;
    if (f > F.pipStand + 10) { p.headPitch = -0.28; p.headYaw = -0.6; }
    p.armL = [-0.5, 0.1]; p.armR = [-0.5, -0.1];
  } else if (f < F.coOwner) {
    p.expression = f < F.freeze ? "smile" : f < F.doorsOpen ? "grin" : "happy";
    p.headYaw = f < F.doorsCue ? -0.35 : 0;
    if (f > F.doorsOpen + 20) cheerMotion(p, f, 2);
  } else {
    p.expression = "happy";
    const k = ramp(f, F.coOwner + 18, F.coOwner + 30);
    p.bounce = Math.max(0, Math.sin((f - F.coOwner - 18) * 0.35)) * 0.8 * k;
    p.armL = [-2.6 * k, -0.4 * k];
    p.armR = [-2.6 * k, 0.4 * k];
  }
  return p;
};

// ------------------------------------------------------------------ Goldie_VIP, the rich avatar
export const goldiePose = (f: number): Pose => {
  const x = keyed(f, [{ f: F.doorsOpen, v: GOLDIE_AT_ROPE[0] }, { f: F.doorsOpen + 30, v: -5.5 }]);
  const z = keyed(f, [{ f: F.doorsOpen, v: GOLDIE_AT_ROPE[2] }, { f: F.doorsOpen + 30, v: -6.6 }]);
  const moving = f > F.doorsOpen && f < F.doorsOpen + 30;
  const p = base([x, groundY(x, z), z], keyedAngle(f, [
    { f: 0, v: 0 }, { f: F.doorsOpen, v: 0 }, { f: F.doorsOpen + 8, v: face(-1, 0.4) }, { f: F.doorsOpen + 30, v: face(1, 0.6) },
  ]));
  p.blink = blinkAt(f, 3);
  if (moving) { p.walkAmt = 0.8; p.walk = (f - F.doorsOpen) * 0.45; }
  if (f < F.laughStart) {
    p.expression = "smug";
    const k = ramp(f, 4, 16);
    p.armR = [-1.55 * k, 0.1 * k]; // "stop" hand
    p.armL = [-0.15, -0.1];
    p.headPitch = 0.1; p.headRoll = -0.06;
  } else if (f < F.reveal) {
    laughMotion(p, f, 3, f < sec(10) ? 1 : 0.4);
  } else if (f < F.freeze) {
    laughMotion(p, f, 3, 0.8);
  } else if (f < F.doorsOpen) {
    // freezes, then the jaw drops
    laughMotion(p, F.freeze, 3, 0.8);
    if (f > F.freeze + 12) {
      p.expression = "shock";
      const k = ramp(f, F.freeze + 12, F.freeze + 20);
      p.lean = -0.12 * k; p.headPitch = -0.05;
      p.armL = [-0.9 * k, -0.6 * k]; p.armR = [-0.9 * k, 0.6 * k];
    }
  } else {
    p.expression = f < sec(39) ? "worried" : "smile";
    p.headPitch = 0.12;
  }
  return p;
};

// ------------------------------------------------------------------ the VIP crowd and the newcomers
export type CrowdLook = "vip" | "guest";
export type Extra = { id: number; look: CrowdLook; start: V3; rotY: number; pose: (f: number) => Pose };

const CROWD_SPOTS: V3[] = [
  [-9, 0, -12], [-6.2, 0, -12.6], [-3.4, 0, -11.6], [3.4, 0, -11.6], [6.2, 0, -12.6], [9, 0, -12], [-12.5, 0, -12.8], [12.5, 0, -12.8],
];

const crowdPose = (i: number, spot: V3) => (f: number): Pose => {
  const enter = F.guestsIn + i * 9;
  const inside = enter + 70;
  const path: PathKey[] = [
    { f: 0, x: spot[0], z: spot[2] },
    { f: enter, x: spot[0], z: spot[2] },
    { f: enter + 40, x: spot[0] * 0.25, z: -12.8 },
    { f: inside, x: 0, z: -18 },
  ];
  const t = track(f, path);
  const facing = keyedAngle(f, [
    { f: 0, v: face(-spot[0] * 0.3, 8) },
    { f: enter, v: face(-spot[0] * 0.3, 8) },
    { f: enter + 8, v: face(-spot[0], -1.5) },
    { f: enter + 40, v: Math.PI },
  ]);
  const p = base([t.x, groundY(t.x, t.z), t.z], facing);
  p.walk = t.walk; p.walkAmt = t.walkAmt; p.blink = blinkAt(f, 10 + i);
  p.visible = t.z > -16.2;
  if (f < F.laughStart) {
    p.expression = i % 2 ? "smug" : "grin";
    p.headPitch = 0.05;
  } else if (f < F.freeze) {
    laughMotion(p, f, i + 4, 0.7 + 0.3 * hash(i));
  } else if (f < F.doorsOpen + 10) {
    laughMotion(p, F.freeze, i + 4, 0.7 + 0.3 * hash(i)); // frozen mid-laugh
    p.blink = false;
    if (f > F.freeze + 10 + (i % 3) * 4) p.expression = "shock";
  } else if (f < enter) {
    cheerMotion(p, f, i);
  } else {
    p.expression = "happy";
  }
  return p;
};

const GUEST_STARTS: V3[] = [[-4, 0, 16], [3, 0, 19], [-1, 0, 22], [6, 0, 17]];
const guestPose = (i: number, start: V3) => (f: number): Pose => {
  const go = F.guestsIn + 6 + i * 16;
  const path: PathKey[] = [
    { f: 0, x: start[0], z: start[2] },
    { f: go, x: start[0], z: start[2] },
    { f: go + 120, x: start[0] * 0.4, z: -9 },
    { f: go + 175, x: 0, z: -18 },
  ];
  const t = track(f, path);
  const p = base([t.x, groundY(t.x, t.z), t.z], Math.PI);
  p.walk = t.walk; p.walkAmt = t.walkAmt; p.blink = blinkAt(f, 30 + i);
  p.visible = f > go - 2 && t.z > -16.2;
  p.expression = "happy";
  if (t.walkAmt > 0.3) { p.armL = [-0.2, -0.25]; p.armR = [-2.5, 0.3]; } // waving while walking in
  return p;
};

export const EXTRAS: Extra[] = [
  ...CROWD_SPOTS.map((s, i): Extra => ({ id: i, look: "vip", start: s, rotY: 0, pose: crowdPose(i, s) })),
  ...GUEST_STARTS.map((s, i): Extra => ({ id: 100 + i, look: "guest", start: s, rotY: Math.PI, pose: guestPose(i, s) })),
];
