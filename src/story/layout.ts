// World layout (units are "studs"; an avatar is ~5.3 studs tall). The mansion faces +z.
import type { V3 } from "./math.ts";

export const MANSION = {
  facadeZ: -14, // front wall plane
  width: 34,
  depth: 16,
  height: 15,
  plinthTop: 0.8, // terrace height in front of the doors
  terraceFrontZ: -10,
  doorW: 6,
  doorH: 8.5,
};
export const ROPE_Z = -7.5;
export const BENCH: { pos: V3; length: number; seat: number } = { pos: [15, 0, 7], length: 9, seat: 1.45 };
/** sitting spots on the bench (avatar root positions) */
export const SEAT_PIP: V3 = [13, 0, 7.15];
export const SEAT_JUNO: V3 = [17, 0, 7.15];
/** where Pip stands at the rope */
export const PIP_AT_ROPE: V3 = [0, 0, -3.6];
export const GOLDIE_AT_ROPE: V3 = [0, 0, -7.2];
export const JUNO_SIDE: V3 = [8.5, 0, -2.5];
