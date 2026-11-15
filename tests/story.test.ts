import { test } from "node:test";
import assert from "node:assert/strict";
import { BEATS, CAPTIONS, TOTAL_FRAMES, FPS, beatAt } from "../src/story/timeline.ts";
import { SHOTS, cameraAt } from "../src/story/camera.ts";
import { EXTRAS, goldiePose, junoPose, pipPose } from "../src/story/acting.ts";

test("composition is 45 s at 30 fps", () => {
  assert.equal(TOTAL_FRAMES, 45 * FPS);
});

test("beats tile 0..45 s without gaps", () => {
  assert.equal(BEATS[0].from, 0);
  assert.equal(BEATS.at(-1)!.to, 45);
  for (let i = 1; i < BEATS.length; i++) assert.equal(BEATS[i].from, BEATS[i - 1].to);
});

const REQUIRED: [number, number, string][] = [
  [0, 3, "You need 10,000 Robux to enter."],
  [3, 10, "Guess I don’t belong here."],
  [10, 18, "You don’t need Robux to hang out with me."],
  [18, 27, "Ownership transfer complete."],
  [18, 27, "Thanks for treating me like a person."],
  [27, 35, "Wait… YOU own this place?"],
  [35, 42, "Now nobody has to pay to belong."],
  [42, 45, "Especially you."],
];

test("every scripted line appears inside its beat window", () => {
  for (const [a, b, text] of REQUIRED) {
    const c = CAPTIONS.find((x) => x.text === text);
    assert.ok(c, `missing caption: ${text}`);
    assert.ok(c.from >= a && c.to <= b, `${text} (${c.from}-${c.to}) outside ${a}-${b}`);
    assert.ok(c.to - c.from >= 2, `${text} is on screen for under 2 s`);
  }
});

test("speech captions never overlap", () => {
  const speech = CAPTIONS.filter((c) => c.speaker).sort((a, b) => a.from - b.from);
  for (let i = 1; i < speech.length; i++) assert.ok(speech[i].from >= speech[i - 1].to, `${speech[i].text} overlaps`);
});

test("shots cover every frame contiguously", () => {
  assert.equal(SHOTS[0].a, 0);
  assert.equal(SHOTS.at(-1)!.b, TOTAL_FRAMES);
  for (let i = 1; i < SHOTS.length; i++) assert.equal(SHOTS[i].a, SHOTS[i - 1].b, `gap before ${SHOTS[i].name}`);
});

test("camera and poses are finite on every frame", () => {
  const finite = (xs: number[], what: string, f: number) => xs.forEach((x) => assert.ok(Number.isFinite(x), `${what} NaN at ${f}`));
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const c = cameraAt(f);
    finite([...c.pos, ...c.look, c.fov, c.roll], "camera", f);
    for (const p of [pipPose(f), junoPose(f), goldiePose(f), ...EXTRAS.map((e) => e.pose(f))]) {
      finite([...p.pos, p.rotY, p.walk, p.walkAmt, p.sit, p.bounce, ...p.armL, ...p.armR], "pose", f);
    }
  }
});

test("story state matches the beats", () => {
  assert.equal(beatAt(1).id, "blocked");
  // Pip is seated on the bench when Juno offers the seat, and stands to say thanks
  assert.ok(pipPose(15 * FPS).sit > 0.99);
  assert.ok(junoPose(17.5 * FPS).sit > 0.99);
  assert.ok(pipPose(24 * FPS).sit < 0.01);
  // back at the mansion for the reveal; the crowd is frozen in shock
  assert.ok(Math.abs(pipPose(30 * FPS).pos[2] - -3.6) < 0.01);
  assert.equal(EXTRAS[0].pose(31 * FPS).expression, "shock");
  // everyone has gone inside by the end of the doors beat or is still walking in
  assert.ok(EXTRAS.filter((e) => e.look === "vip").every((e) => !e.pose(44 * FPS).visible));
});
