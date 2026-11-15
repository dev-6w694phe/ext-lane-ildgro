// Story timeline for "The Bacon Hair Who Owned the Server" (45 s, 30 fps, 1080x1920).
// Pure data + helpers only (no React / three imports) so it can be unit tested with plain Node.

export const FPS = 30;
export const DURATION_S = 45;
export const TOTAL_FRAMES = FPS * DURATION_S; // 1350
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number) => Math.round(s * FPS);

export type CharacterId = "pip" | "goldie" | "juno";

export const CHARACTERS: Record<CharacterId, { name: string; role: string; color: string }> = {
  pip: { name: "Pip", role: "The newcomer (bacon hair)", color: "#ffb04a" },
  goldie: { name: "Goldie_VIP", role: "The rich avatar", color: "#ffd23f" },
  juno: { name: "Juno", role: "The kind player", color: "#4ee0c1" },
};

export type BeatId = "blocked" | "laughed" | "kindness" | "transfer" | "reveal" | "doors" | "coowner";

export type Beat = { id: BeatId; from: number; to: number; summary: string };

/** The seven story beats, in seconds. They tile 0..45 s without gaps. */
export const BEATS: Beat[] = [
  { id: "blocked", from: 0, to: 3, summary: "Goldie_VIP blocks Pip at the mansion rope." },
  { id: "laughed", from: 3, to: 10, summary: "The VIP crowd laughs; Pip turns away and sits alone on a bench." },
  { id: "kindness", from: 10, to: 18, summary: "Juno follows Pip and offers him a seat." },
  { id: "transfer", from: 18, to: 27, summary: "Pip receives 'Ownership transfer complete.' and thanks Juno." },
  { id: "reveal", from: 27, to: 35, summary: "A glowing OWNER tag appears over Pip; the crowd freezes." },
  { id: "doors", from: 35, to: 42, summary: "Pip throws the mansion doors open to everyone." },
  { id: "coowner", from: 42, to: 45, summary: "Juno receives a CO-OWNER tag." },
];

export type Caption = {
  /** seconds */
  from: number;
  to: number;
  /** null = system message (rendered as an in-world notification, not a speech caption) */
  speaker: CharacterId | null;
  text: string;
};

/** Dialogue captions, timed inside their beats. Text is the script verbatim. */
export const CAPTIONS: Caption[] = [
  { from: 0.2, to: 2.95, speaker: "goldie", text: "You need 10,000 Robux to enter." },
  { from: 5.6, to: 9.9, speaker: "pip", text: "Guess I don’t belong here." },
  { from: 11.6, to: 17.9, speaker: "juno", text: "You don’t need Robux to hang out with me." },
  { from: 18.6, to: 21.8, speaker: null, text: "Ownership transfer complete." },
  { from: 22.4, to: 26.9, speaker: "pip", text: "Thanks for treating me like a person." },
  { from: 29.4, to: 34.9, speaker: "goldie", text: "Wait… YOU own this place?" },
  { from: 36.4, to: 41.9, speaker: "pip", text: "Now nobody has to pay to belong." },
  { from: 42.5, to: 45, speaker: "pip", text: "Especially you." },
];

export const beatAt = (frame: number): Beat => {
  const s = frame / FPS;
  return BEATS.find((b) => s >= b.from && s < b.to) ?? BEATS[BEATS.length - 1];
};

export const captionsAt = (frame: number): Caption[] => {
  const s = frame / FPS;
  return CAPTIONS.filter((c) => s >= c.from && s < c.to);
};

// Key story frames shared by the acting, camera, tags and overlays.
export const F = {
  laughStart: sec(3),
  pipTurn: sec(5.0),
  pipWalk: sec(5.8),
  pipSit: sec(9.0),
  junoWalk: sec(10.2),
  junoArrive: sec(12.8),
  junoOffer: sec(14.0),
  junoSit: sec(16.0),
  transfer: sec(18.6),
  pipStand: sec(21.6),
  reveal: sec(27),
  ownerTag: sec(27.5),
  freeze: sec(28.3),
  doorsCue: sec(35.4),
  doorsOpen: sec(36.0),
  guestsIn: sec(37.0),
  coOwner: sec(42.4),
} as const;
