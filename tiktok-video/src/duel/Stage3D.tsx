import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {Gesture, Speaker} from './script';

type V3 = [number, number, number];

export const COLORS = {
  claude: '#d97757',
  chat: '#f2f2f0',
  sweater: '#2f3fae',
  skin: '#e8b48f',
  hair: '#2b211c',
  pink: '#e8458b',
  yellow: '#f2c94c',
  floorL: '#ec8a63',
  floorR: '#9fd0f0',
  wall: '#e6edf5',
};

export type CamPose = {pos: V3; look: V3};

export type StageProps = {
  width: number;
  height: number;
  frame: number;
  cam: CamPose;
  talking?: Speaker;
  gesture?: Gesture;
  gestureT: number; // 0..1, ouverture du geste
  celebrate: number; // 0..1, ampoules qui clignotent
  team: boolean;
};

const Box: React.FC<{p?: V3; s: V3; c: string; r?: V3; e?: string; ei?: number}> = ({p = [0, 0, 0], s, c, r, e, ei}) => (
  <mesh position={p} rotation={r}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} flatShading roughness={0.8} emissive={e ?? '#000'} emissiveIntensity={ei ?? 0} />
  </mesh>
);

// Ombre de contact simple (disque sombre transparent au sol).
const Shadow: React.FC<{p: V3; r: number; o?: number}> = ({p, r, o = 0.18}) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[r, 32]} />
    <meshBasicMaterial color="#000" transparent opacity={o} depthWrite={false} />
  </mesh>
);

const Camera: React.FC<{cam: CamPose}> = ({cam}) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...cam.pos);
  camera.lookAt(new THREE.Vector3(...cam.look));
  camera.updateProjectionMatrix();
  return null;
};

const blink = (frame: number, offset: number) => ((frame + offset) % 95 < 4 ? 0.12 : 1);

/* ---------- Le patron ---------- */

const Host: React.FC<{frame: number; talking: boolean; gesture?: Gesture; g: number}> = ({frame, talking, gesture, g}) => {
  const mouth = talking ? 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.62)) * (0.65 + 0.35 * Math.sin(frame * 0.21)) : 0.12;
  const bob = talking ? Math.sin(frame * 0.33) * 0.025 : Math.sin(frame * 0.07) * 0.01;
  const think = gesture === 'think' ? g : 0;
  const shrug = gesture === 'shrug' ? g : 0;
  const headYaw = (talking ? Math.sin(frame * 0.09) * 0.07 : 0) + (gesture === 'pointLeft' ? -0.35 * g : 0) + (gesture === 'pointRight' ? 0.35 * g : 0);
  // Bras au repos : penchés en avant, mains sur le pupitre.
  const leftZ = gesture === 'pointLeft' ? -2.1 * g : -0.15 - 0.5 * shrug;
  const rightZ = gesture === 'pointRight' ? 2.1 * g : 0.15 + 0.5 * shrug;
  const leftX = gesture === 'pointLeft' ? -0.62 * (1 - g) : -0.62;
  const rightX = gesture === 'pointRight' ? -0.62 * (1 - g) : -0.62 - 1.2 * think;
  const eye = blink(frame, 0);

  return (
    <group position={[0, 0, -0.25]}>
      {/* buste */}
      <Box p={[0, 1.9, 0]} s={[0.95, 1.0, 0.5]} c={COLORS.sweater} />
      <Box p={[0, 2.41, 0.02]} s={[0.42, 0.06, 0.44]} c="#f4f4f4" />
      <Box p={[0, 2.48, 0]} s={[0.24, 0.12, 0.24]} c={COLORS.skin} />
      {/* tête */}
      <group position={[0, 2.86 + bob, 0]} rotation={[think * 0.12, headYaw, think * 0.18]}>
        <Box s={[0.62, 0.68, 0.6]} c={COLORS.skin} />
        <Box p={[0, 0.38, -0.02]} s={[0.7, 0.16, 0.68]} c={COLORS.hair} />
        <Box p={[0, 0.16, -0.31]} s={[0.7, 0.56, 0.1]} c={COLORS.hair} />
        <Box p={[-0.33, 0.2, -0.05]} s={[0.07, 0.4, 0.56]} c={COLORS.hair} />
        <Box p={[0.33, 0.2, -0.05]} s={[0.07, 0.4, 0.56]} c={COLORS.hair} />
        <Box p={[-0.12, 0.3, 0.27]} s={[0.36, 0.12, 0.14]} c={COLORS.hair} r={[0, 0, 0.25]} />
        <Box p={[0.14, 0.31, 0.26]} s={[0.3, 0.1, 0.14]} c={COLORS.hair} r={[0, 0, -0.3]} />
        <Box p={[0.05, 0.52, 0]} s={[0.12, 0.16, 0.12]} c={COLORS.hair} r={[0.3, 0, 0.4]} />
        <Box p={[-0.15, 0.5, 0.1]} s={[0.1, 0.14, 0.1]} c={COLORS.hair} r={[0.2, 0, -0.5]} />
        {/* yeux, sourcils, nez, bouche */}
        <Box p={[-0.13, 0.04, 0.305]} s={[0.07, 0.11 * eye, 0.02]} c="#1b1b1b" />
        <Box p={[0.13, 0.04, 0.305]} s={[0.07, 0.11 * eye, 0.02]} c="#1b1b1b" />
        <Box p={[-0.13, 0.15 + think * 0.03, 0.305]} s={[0.13, 0.03, 0.02]} c={COLORS.hair} r={[0, 0, think * 0.25]} />
        <Box p={[0.13, 0.15, 0.305]} s={[0.13, 0.03, 0.02]} c={COLORS.hair} />
        <Box p={[0, -0.05, 0.32]} s={[0.07, 0.1, 0.06]} c="#d99c78" />
        <Box p={[0, -0.18, 0.305]} s={[0.17, 0.025 + 0.08 * mouth, 0.02]} c="#6b2b2b" />
      </group>
      {/* bras : pivot à l'épaule */}
      <group position={[-0.58, 2.3, 0]} rotation={[leftX, 0, leftZ]}>
        <Box p={[0, -0.42, 0]} s={[0.24, 0.84, 0.26]} c={COLORS.sweater} />
        <Box p={[0, -0.9, 0]} s={[0.18, 0.14, 0.2]} c={COLORS.skin} />
      </group>
      <group position={[0.58, 2.3, 0]} rotation={[rightX, 0, rightZ]}>
        <Box p={[0, -0.42, 0]} s={[0.24, 0.84, 0.26]} c={COLORS.sweater} />
        <Box p={[0, -0.9, 0]} s={[0.18, 0.14, 0.2]} c={COLORS.skin} />
      </group>
    </group>
  );
};

const Podium = () => {
  const stripes = Array.from({length: 7}, (_, i) => i);
  return (
    <group position={[0, 0, 0.45]}>
      <Box p={[0, 0.72, 0]} s={[0.9, 1.44, 0.66]} c="#f7f5f2" />
      {stripes.map((i) => (
        <Box key={i} p={[0, 0.16 + i * 0.19, 0]} s={[0.92, 0.055, 0.68]} c={i % 2 ? COLORS.pink : COLORS.yellow} />
      ))}
      <Box p={[0, 1.47, 0.05]} s={[1.25, 0.07, 0.9]} c={COLORS.yellow} r={[0, 0.04, 0]} />
      <Shadow p={[0, 0.01, 0]} r={0.75} />
    </group>
  );
};

/* ---------- Les candidats ---------- */

const ClaudeBot: React.FC<{frame: number; talking: boolean; happy: number}> = ({frame, talking, happy}) => {
  const hop = talking ? Math.abs(Math.sin(frame * 0.45)) * 0.14 : happy * Math.abs(Math.sin(frame * 0.3)) * 0.2;
  const squash = 1 - (talking ? Math.abs(Math.cos(frame * 0.45)) * 0.06 : 0);
  const eye = blink(frame, 37);
  return (
    <group position={[0, 1.12 + hop, 0]} scale={[1 / squash, squash, 1]} rotation={[0, 0.35, 0]}>
      <Box s={[0.74, 0.56, 0.56]} c={COLORS.claude} />
      <Box p={[-0.16, 0.06, 0.285]} s={[0.08, 0.14 * eye, 0.02]} c="#1b1b1b" />
      <Box p={[0.16, 0.06, 0.285]} s={[0.08, 0.14 * eye, 0.02]} c="#1b1b1b" />
      <Box p={[-0.44, -0.02, 0]} s={[0.14, 0.16, 0.22]} c={COLORS.claude} />
      <Box p={[0.44, -0.02, 0]} s={[0.14, 0.16, 0.22]} c={COLORS.claude} />
      {[-0.27, -0.09, 0.09, 0.27].map((x) => (
        <Box key={x} p={[x, -0.37, 0.05]} s={[0.1, 0.18, 0.12]} c={COLORS.claude} />
      ))}
    </group>
  );
};

const ChatBot: React.FC<{frame: number; talking: boolean; happy: number}> = ({frame, talking, happy}) => {
  const hop = talking ? Math.abs(Math.sin(frame * 0.4)) * 0.12 : happy * Math.abs(Math.sin(frame * 0.3 + 1)) * 0.2;
  const wobble = talking ? Math.sin(frame * 0.4) * 0.15 : Math.sin(frame * 0.05) * 0.05;
  const eye = blink(frame, 61);
  return (
    <group position={[0, 1.4 + hop, 0]} rotation={[0, -0.35, wobble]}>
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color={COLORS.chat} flatShading roughness={0.6} />
      </mesh>
      <Box p={[-0.12, 0.05, 0.37]} s={[0.07, 0.13 * eye, 0.03]} c="#1b1b1b" />
      <Box p={[0.12, 0.05, 0.37]} s={[0.07, 0.13 * eye, 0.03]} c="#1b1b1b" />
      <Box p={[0, 0.48, 0]} s={[0.04, 0.16, 0.04]} c="#c9c9c9" />
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#5bb8ef" emissive="#5bb8ef" emissiveIntensity={talking ? 0.8 : 0.2} />
      </mesh>
    </group>
  );
};

const useLabel = (text: string, color: string) =>
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = color;
    ctx.font = '900 84px "Inter Display", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [text, color]);

const Pedestal: React.FC<{x: number; color: string; label: string; children: React.ReactNode}> = ({x, color, label, children}) => {
  const tex = useLabel(label, color);
  return (
    <group position={[x, 0, 1.2]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.58, 0.62, 0.84, 8]} />
        <meshStandardMaterial color="#f5f3ef" flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.58, 0.035, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.45, 0.63]}>
        <planeGeometry args={[0.78, 0.2]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <Shadow p={[0, 0.01, 0]} r={0.75} />
      {children}
    </group>
  );
};

/* ---------- Décor ---------- */

const Set: React.FC<{frame: number; celebrate: number}> = ({frame, celebrate}) => {
  const bulbs = Array.from({length: 23}, (_, i) => (i / 22) * Math.PI);
  return (
    <group>
      {/* sol orange / bleu avec bandes */}
      <mesh position={[-6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 20]} />
        <meshStandardMaterial color={COLORS.floorL} />
      </mesh>
      <mesh position={[6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 20]} />
        <meshStandardMaterial color={COLORS.floorR} />
      </mesh>
      {[-3.5, -2.2, 2.2, 3.5].map((x, i) => (
        <mesh key={x} position={[x, 0.005, 2]} rotation={[-Math.PI / 2, 0, i < 2 ? 0.5 : -0.5]}>
          <planeGeometry args={[0.18, 12]} />
          <meshStandardMaterial color={i < 2 ? '#f4a682' : '#c4e3f7'} />
        </mesh>
      ))}
      <mesh position={[0, 0.006, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 20]} />
        <meshStandardMaterial color={COLORS.yellow} />
      </mesh>
      {/* mur du fond avec baies vitrées */}
      <mesh position={[0, 4, -3.2]}>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color={COLORS.wall} />
      </mesh>
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <group key={x} position={[x, 2.9, -3.15]}>
          <mesh>
            <planeGeometry args={[2.6, 3.6]} />
            <meshStandardMaterial color="#f8fbff" emissive="#ffffff" emissiveIntensity={0.25} />
          </mesh>
          <Box p={[0, 0, 0.02]} s={[0.06, 3.6, 0.04]} c="#d6dee8" />
          <Box p={[0, 0.4, 0.02]} s={[2.6, 0.06, 0.04]} c="#d6dee8" />
        </group>
      ))}
      <Box p={[0, 0.3, -3.0]} s={[24, 0.6, 0.3]} c="#d9e2ec" />
      {/* arche lumineuse derrière le patron */}
      <group position={[0, 1.2, -1.3]}>
        <mesh>
          <torusGeometry args={[2.25, 0.05, 8, 64, Math.PI]} />
          <meshStandardMaterial color="#f0e3c6" />
        </mesh>
        {bulbs.map((a, i) => {
          const on = celebrate > 0 ? ((Math.floor(frame / 4) + i) % 2 === 0 ? 1 : 0.25) : 0.55;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0.04]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#ffe08a" emissive="#ffc93d" emissiveIntensity={0.4 + on * 1.2 * Math.max(celebrate, 0.5)} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export const Stage3D: React.FC<StageProps> = ({width, height, frame, cam, talking, gesture, gestureT, celebrate, team}) => (
  <ThreeCanvas width={width} height={height} camera={{fov: 38, near: 0.1, far: 60}} style={{background: '#dfe8f2'}}>
    <Camera cam={cam} />
    <color attach="background" args={['#dfe8f2']} />
    <fog attach="fog" args={['#dfe8f2', 12, 26]} />
    <ambientLight intensity={0.7} />
    <hemisphereLight args={['#ffffff', '#f0c9b0', 0.8]} />
    <directionalLight position={[3, 7, 6]} intensity={1.7} />
    <directionalLight position={[-4, 3, 4]} intensity={0.4} color="#bcd7ff" />
    <Set frame={frame} celebrate={celebrate} />
    <Host frame={frame} talking={talking === 'host'} gesture={gesture} g={gestureT} />
    <Podium />
    <Pedestal x={-1.6} color={COLORS.claude} label="CLAUDE">
      <ClaudeBot frame={frame} talking={talking === 'claude'} happy={team ? celebrate : 0} />
    </Pedestal>
    <Pedestal x={1.6} color="#3d9be0" label="CHAT">
      <ChatBot frame={frame} talking={talking === 'chat'} happy={team ? celebrate : 0} />
    </Pedestal>
  </ThreeCanvas>
);
