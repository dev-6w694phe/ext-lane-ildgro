// The whole 3D scene for one frame: camera, lights, world, mansion, cast, tags and effects.
import React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { cameraAt } from "../story/camera.ts";
import { EXTRAS, goldiePose, junoPose, pipPose, type Pose } from "../story/acting.ts";
import { F, CHARACTERS, sec } from "../story/timeline.ts";
import { MANSION } from "../story/layout.ts";
import { ramp, type V3 } from "../story/math.ts";
import { AVATAR_TOP, BlockAvatar } from "./BlockAvatar.tsx";
import { GOLDIE, GUESTS, JUNO, PIP, VIPS } from "./looks.ts";
import { Mansion, doorOpenAmount } from "./Mansion.tsx";
import { World } from "./World.tsx";
import { ChatBubble, NameTag, RankTag } from "./Tags.tsx";
import { Confetti, DoorRays, LightPillar, Sparkles } from "./Effects.tsx";

const CameraRig: React.FC<{ f: number }> = ({ f }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = cameraAt(f);
  camera.position.set(...c.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(...c.look);
  camera.rotateZ(c.roll);
  if (camera.fov !== c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
  camera.updateMatrixWorld();
  return null;
};

const above = (p: Pose, extra = 0): V3 => [p.pos[0], p.pos[1] + AVATAR_TOP + p.bounce + 0.55 + extra, p.pos[2]];

const Lights: React.FC<{ f: number; warm: number }> = ({ f, warm }) => {
  // the reveal beat is a touch moodier so the glowing tag reads; the finale warms up
  const mood = 1 - 0.18 * ramp(f, F.reveal, F.reveal + 10) * (1 - ramp(f, F.doorsOpen, F.doorsOpen + 30));
  const sunColor = new THREE.Color("#fff3dc").lerp(new THREE.Color("#ffd49a"), warm);
  return (
    <>
      <hemisphereLight args={["#cfe8ff", "#5a8f3c", 1.35 * mood]} />
      <ambientLight intensity={0.25} />
      <directionalLight castShadow position={[22, 40, 26]} color={sunColor} intensity={2.6 * mood}
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03}
        shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} shadow-camera-near={1} shadow-camera-far={120} />
      <directionalLight position={[-20, 12, 30]} color="#bcd7ff" intensity={0.45} />
    </>
  );
};

const LAUGHS = ["HAHAHA", "LOL", "no Robux? XD", "lmao", "HAHA", "bye noob"];

export const StoryScene: React.FC<{ f: number }> = ({ f }) => {
  const pip = pipPose(f), juno = junoPose(f), goldie = goldiePose(f);
  const open = doorOpenAmount(f);
  const warm = ramp(f, F.doorsOpen, F.doorsOpen + 60);
  return (
    <>
      <CameraRig f={f} />
      <Lights f={f} warm={warm} />
      <World f={f} warm={warm} />
      <Mansion f={f} />
      <DoorRays open={open} at={[0, MANSION.plinthTop, MANSION.facadeZ]} />

      <BlockAvatar look={PIP} pose={pip} />
      <BlockAvatar look={JUNO} pose={juno} />
      <BlockAvatar look={GOLDIE} pose={goldie} />
      {EXTRAS.map((e) => <BlockAvatar key={e.id} look={e.look === "vip" ? VIPS[e.id % VIPS.length] : GUESTS[(e.id - 100) % GUESTS.length]} pose={e.pose(f)} />)}

      <NameTag f={f} position={above(pip)} name={CHARACTERS.pip.name} />
      <NameTag f={f} position={above(juno)} name={CHARACTERS.juno.name} />
      <NameTag f={f} position={above(goldie, 0.9)} name={CHARACTERS.goldie.name} color={CHARACTERS.goldie.color} />
      <RankTag f={f} from={F.ownerTag} position={above(pip, 1.25)} text="OWNER" color="#f2a900" glow="#ffd23f" />
      <RankTag f={f} from={F.coOwner + 4} position={above(juno, 2.7)} text="CO-OWNER" color="#13a88f" glow="#4ee0c1" />

      {EXTRAS.filter((e) => e.look === "vip").slice(0, LAUGHS.length).map((e, i) => (
        <ChatBubble key={e.id} f={f} from={sec(3.1) + i * 5} to={sec(6.6) + i * 3} position={above(e.pose(f), 1.0)} text={LAUGHS[i]} />
      ))}

      <Sparkles f={f} from={F.transfer} dur={80} at={pip.pos} />
      <LightPillar f={f} from={F.ownerTag} at={pip.pos} />
      <Sparkles f={f} from={F.coOwner + 4} dur={60} at={juno.pos} color="#4ee0c1" />
      <Confetti f={f} from={F.doorsOpen + 6} at={[0, MANSION.plinthTop, MANSION.facadeZ + 3]} count={90} spread={12} seed={1} />
      <Confetti f={f} from={F.coOwner + 4} at={[2.3, 0, -3.3]} count={120} spread={10} seed={2} />
    </>
  );
};
