// Procedural Canvas2D textures (faces, studs, signs, name tags). Everything is generated at runtime,
// so the project needs no external image or font assets. Textures are cached by key.
import * as THREE from "three";
import type { Expression } from "../story/acting.ts";

export const FONT = "'Arial Black', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";
const cache = new Map<string, THREE.Texture>();

const canvasTexture = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  cache.set(key, t);
  return t;
};

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

/** Block-avatar face: drawn on the front of the head cube. */
export const faceTexture = (skin: string, expr: Expression, blink: boolean) =>
  canvasTexture(`face:${skin}:${expr}:${blink}`, 256, 256, (g) => {
    g.fillStyle = skin; g.fillRect(0, 0, 256, 256);
    const ink = "#1d1a22";
    g.fillStyle = ink; g.strokeStyle = ink; g.lineCap = "round"; g.lineJoin = "round";
    const eyeY = 108;
    const happyEyes = expr === "laugh" || expr === "happy";
    // eyes
    for (const ex of [86, 170]) {
      if (blink && !happyEyes) { g.lineWidth = 9; g.beginPath(); g.moveTo(ex - 14, eyeY + 4); g.lineTo(ex + 14, eyeY + 4); g.stroke(); continue; }
      if (happyEyes) { g.lineWidth = 10; g.beginPath(); g.arc(ex, eyeY + 12, 15, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); continue; }
      const big = expr === "shock" ? 1.35 : 1;
      if (expr === "smug") { rr(g, ex - 13, eyeY - 2, 26, 22, 9); g.fill(); g.fillStyle = skin; g.fillRect(ex - 15, eyeY - 6, 30, 10); g.fillStyle = ink; continue; }
      rr(g, ex - 12 * big, eyeY - 20 * big, 24 * big, 40 * big, 12 * big); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(ex + 4 * big, eyeY - 9 * big, 5 * big, 0, Math.PI * 2); g.fill(); g.fillStyle = ink;
    }
    // brows
    g.lineWidth = 8;
    const brow = (x0: number, y0: number, x1: number, y1: number) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
    if (expr === "sad" || expr === "worried") { brow(64, 72, 104, 64); brow(152, 64, 192, 72); }
    else if (expr === "shock") { brow(66, 56, 104, 50); brow(152, 50, 190, 56); }
    else if (expr === "smug") { brow(64, 80, 104, 76); brow(152, 70, 192, 66); }
    else if (expr === "grin") { brow(66, 70, 104, 74); brow(152, 74, 190, 70); }
    // mouth
    g.lineWidth = 10;
    const cx = 128, my = 178;
    switch (expr) {
      case "neutral": g.beginPath(); g.moveTo(cx - 22, my); g.lineTo(cx + 22, my); g.stroke(); break;
      case "smile": g.beginPath(); g.arc(cx, my - 22, 34, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); break;
      case "sad": g.beginPath(); g.arc(cx, my + 30, 30, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); break;
      case "worried": g.beginPath(); g.moveTo(cx - 28, my + 4); g.quadraticCurveTo(cx - 14, my - 8, cx, my + 2); g.quadraticCurveTo(cx + 14, my + 10, cx + 28, my - 2); g.stroke(); break;
      case "smug": g.beginPath(); g.moveTo(cx - 26, my + 2); g.quadraticCurveTo(cx + 8, my + 10, cx + 32, my - 14); g.stroke(); break;
      case "shock": g.beginPath(); g.ellipse(cx, my + 4, 18, 26, 0, 0, Math.PI * 2); g.fill(); break;
      case "grin": case "happy": case "laugh": {
        const w = expr === "laugh" ? 50 : 44, h = expr === "laugh" ? 46 : 32;
        g.beginPath(); g.moveTo(cx - w, my - 12); g.lineTo(cx + w, my - 12); g.quadraticCurveTo(cx + w, my - 12 + h * 1.4, cx, my - 12 + h * 1.4); g.quadraticCurveTo(cx - w, my - 12 + h * 1.4, cx - w, my - 12); g.fill();
        g.fillStyle = "#ffffff"; g.fillRect(cx - w + 10, my - 12, (w - 10) * 2, 10);
        if (expr !== "grin") { g.fillStyle = "#e0566b"; g.beginPath(); g.ellipse(cx, my - 12 + h * 1.05, w * 0.45, h * 0.28, 0, 0, Math.PI * 2); g.fill(); }
        break;
      }
    }
  });

/** Baseplate studs */
export const studTexture = (base: string, key = "studs") =>
  canvasTexture(`${key}:${base}`, 128, 128, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.arc(66, 68, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.arc(62, 62, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(0,0,0,0.08)"; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128);
  }, [1, 1]);

/** Stone tiles for the path and terrace */
export const tileTexture = (base: string) =>
  canvasTexture(`tile:${base}`, 256, 256, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 6;
    for (let i = 0; i <= 256; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.07)"; g.fillRect(8, 8, 112, 112); g.fillRect(136, 136, 112, 112);
  });

/** Text on a panel (signs, tags, bubbles). */
export const labelTexture = (key: string, text: string, opts: { w: number; h: number; bg: string; fg: string; border?: string; size?: number; radius?: number; glow?: string }) =>
  canvasTexture(`label:${key}`, opts.w, opts.h, (g) => {
    const pad = opts.glow ? 28 : 6;
    if (opts.glow) { g.shadowColor = opts.glow; g.shadowBlur = 26; }
    g.fillStyle = opts.bg; rr(g, pad, pad, opts.w - pad * 2, opts.h - pad * 2, opts.radius ?? 24); g.fill();
    g.shadowBlur = 0;
    if (opts.border) { g.strokeStyle = opts.border; g.lineWidth = 10; rr(g, pad + 5, pad + 5, opts.w - pad * 2 - 10, opts.h - pad * 2 - 10, (opts.radius ?? 24) - 4); g.stroke(); }
    g.fillStyle = opts.fg; g.textAlign = "center"; g.textBaseline = "middle";
    // shrink the font until the text fits inside the panel
    let size = opts.size ?? Math.round(opts.h * 0.42);
    const maxW = opts.w - pad * 2 - 40;
    g.font = `900 ${size}px ${FONT}`;
    while (size > 12 && g.measureText(text).width > maxW) { size -= 2; g.font = `900 ${size}px ${FONT}`; }
    g.fillText(text, opts.w / 2, opts.h / 2 + 4);
  });

/** Warm, softly lit interior seen through the open doors */
export const interiorTexture = () =>
  canvasTexture("interior", 256, 512, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "#fff3c4"); grd.addColorStop(0.55, "#ffd27a"); grd.addColorStop(1, "#c9781f");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 512);
    g.fillStyle = "rgba(255,255,255,0.65)";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(128, 70 + i * 4, 40 - i * 10, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#b8321f"; g.fillRect(88, 300, 80, 212); // red carpet running inside
  });

/** Soft radial glow sprite (used additively). */
export const glowTexture = (color: string) =>
  canvasTexture(`glow:${color}`, 256, 256, (g) => {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, color); grd.addColorStop(0.35, color); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 1; g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  });
