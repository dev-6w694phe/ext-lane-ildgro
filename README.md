# The Bacon Hair Who Owned the Server

Source project for a **45-second vertical (1080×1920, 30 fps) 3D animated story** in a blocky "game avatar" style, built with [Remotion](https://www.remotion.dev/) + [`@remotion/three`](https://www.remotion.dev/docs/three) (three.js / React Three Fiber).

Everything is procedural: the block characters, mansion, park, faces, signs, tags, particles and captions are all generated in code. No image, model, font or audio files are needed.

> Original characters and story. This is a fan-style parody of user-generated game culture and has **no affiliation with or endorsement by Roblox Corporation**. "Robux" appears only as a line in the script.

## Story

| Time | Beat | Line |
|---|---|---|
| 0–3 s | Goldie_VIP, the rich avatar, blocks Pip (the bacon-hair newcomer) at the mansion rope | "You need 10,000 Robux to enter." |
| 3–10 s | The VIP crowd laughs (chat bubbles). Pip turns away and sits alone on a bench | "Guess I don’t belong here." |
| 10–18 s | Juno, the kind player, follows him and offers the seat beside him | "You don’t need Robux to hang out with me." |
| 18–27 s | A server notice pops: *Ownership transfer complete.* Pip stands and thanks Juno | "Thanks for treating me like a person." |
| 27–35 s | Back at the mansion a glowing **OWNER** tag ignites over Pip; the crowd freezes mid-laugh | "Wait… YOU own this place?" |
| 35–42 s | Pip throws the doors open; the rope drops, the sign flips to OPEN TO ALL, everyone walks in | "Now nobody has to pay to belong." |
| 42–45 s | Juno gets a **CO-OWNER** tag, with confetti | "Especially you." |

## Setup

Requirements: Node.js 20+ (tested with Node 24) and npm.

```bash
npm install
```

## Preview

```bash
npm run studio
```

This opens Remotion Studio in your browser. Select the **BaconHairOwner** composition and scrub or play the timeline. The scene is a pure function of the frame number, so any frame can be previewed directly.

Checks:

```bash
npm run lint       # eslint + TypeScript
npm test           # timeline / caption / camera / pose sanity tests (node:test)
```

## Rendering (optional, run it yourself)

This repository contains the source only and no rendered video. To render locally:

```bash
# full video -> out/bacon-hair-owner.mp4
npm run render

# a single still (frame 900) -> out/still.png
npm run still
```

Notes:
- WebGL renders in headless Chrome. `--gl angle` (the default here, see `remotion.config.ts`) uses the GPU. On a machine without a GPU, use `--gl swangle`, which is slower and runs on the CPU:
  `npx remotion render src/index.ts BaconHairOwner out/video.mp4 --gl swangle`
- For quick previews of the 45 s piece, add `--scale 0.5`. For a 1440×2560 master, add `--scale 1.3333`.
- Concurrency is set to 1 because each WebGL frame is heavy. Raise it with `--concurrency` if your GPU can handle more.
- There is no audio track. Add music or voice in your editor, or drop an `<Audio>` into `src/Video.tsx`.

## Project layout

```
src/
  index.ts, Root.tsx        Remotion entry + composition (BaconHairOwner, 1350 frames)
  Video.tsx                 ThreeCanvas + 2D overlays + flash cuts
  story/                    pure, testable story logic (no React / three)
    timeline.ts             beats, captions (script verbatim), key story frames
    acting.ts               every avatar's pose per frame: walks, sitting, laughing, freeze, cheers
    camera.ts               shot list: cuts, smootherstep glides, creeping holds, impact kicks
    layout.ts, math.ts      world positions, easing / keyframe helpers
  scene/                    three.js scene (React Three Fiber)
    BlockAvatar.tsx         procedural block avatar (pivoted limbs, drawn face, hair, accessories)
    looks.ts                outfits for Pip, Goldie_VIP, Juno, the VIP crowd and the guests
    Mansion.tsx             mansion with hinged doors, hall, columns, rope line, sign
    World.tsx               sky shader, studded baseplate, trees, bench, lamps, clouds
    Tags.tsx                camera-facing name tags, OWNER / CO-OWNER rank tags, chat bubbles
    Effects.tsx             sparkles, light pillar, confetti, door light rays
    textures.ts             Canvas2D textures (faces, studs, tiles, labels, glows)
  overlay/                  2D overlays rendered by Remotion
    Captions.tsx            speaker chip + dialogue line (word pop-in)
    SystemToast.tsx         "Ownership transfer complete." server notice
    TitleBanner.tsx         opening title
tests/story.test.ts         timing + sanity tests
```

### Editing tips
- **Retime the story** in `src/story/timeline.ts` (`CAPTIONS`, `F`). Acting and cameras reference `F`, so they follow.
- **Reframe a shot** in `src/story/camera.ts`. The frame is 9:16, so the horizontal field of view is only about 0.56× the vertical one. At fov 60 a subject 10 studs wide fills the frame from about 15 studs away.
- **Restyle a character** in `src/scene/looks.ts`, for example colours, hair (`bacon`, `messy`, `slick`, `spiky`, `bob`, `bun`, `cap`, `tophat`) and accessories.

## Credits

Pipeline structure (shot table, per-frame posed world, camera grammar of glides, creeping holds and decaying impact kicks) was adapted from the reference *claude-animated-shorts* toolkit (MIT). None of its assets are used. Its 2D billboard characters were replaced with fully 3D block avatars.
