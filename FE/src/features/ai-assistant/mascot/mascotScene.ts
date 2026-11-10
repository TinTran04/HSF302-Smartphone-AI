import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { MascotAccessory, MascotOutfit, MascotSkin } from '../skins';
import { avatarModels, type AvatarModel } from '../avatarModels';

/**
 * Phone-advisor avatar built from primitives: a chibi girl with headphones and a phone,
 * floating on a glowing chat bubble under a halo. Skins only swap colours and parts.
 */
export type MascotMood = 'idle' | 'thinking' | 'listening';
export type MascotGesture = 'wave' | 'happy';

export interface MascotController {
  setSkin(skin: MascotSkin): void;
  setMood(mood: MascotMood): void;
  play(gesture: MascotGesture): void;
  /** Pointer position relative to the avatar, roughly in [-1, 1]. */
  look(x: number, y: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const GESTURE_SECONDS: Record<MascotGesture, number> = { wave: 1.6, happy: 1.4 };
const HEAD_R = 0.52;

function toonGradient() {
  const data = new Uint8Array([110, 185, 255]);
  const texture = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** White speech bubble with three dots, drawn over the glowing ear-cup disc. */
function chatIconTexture() {
  return canvasTexture(128, 128, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(22, 30, 84, 58, 22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 82);
    ctx.lineTo(30, 104);
    ctx.lineTo(60, 86);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (const x of [44, 64, 84]) {
      ctx.beginPath();
      ctx.arc(x, 59, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function screenTexture() {
  return canvasTexture(64, 128, (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 64, 128);
    gradient.addColorStop(0, '#c084fc');
    gradient.addColorStop(0.5, '#6366f1');
    gradient.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(46, 34, 30, 0, Math.PI * 2);
    ctx.fill();
  });
}

function badgeTexture(text: string, color: string) {
  return canvasTexture(192, 112, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 192, 112);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 192, 30);
    ctx.fillStyle = '#d7dde8';
    ctx.fillRect(14, 42, 42, 56);
    ctx.fillStyle = '#17243b';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.fillText(text.split(' ')[0] ?? '', 66, 66);
    ctx.font = '16px Inter, Arial, sans-serif';
    ctx.fillText(text.split(' ').slice(1).join(' '), 66, 90);
  });
}

export function createMascot(
  canvas: HTMLCanvasElement,
  initialSkin: MascotSkin,
  options: { reducedMotion: boolean },
): MascotController {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 0.85, 0.1, 50);
  camera.position.set(0, 1.55, 5.9);
  camera.lookAt(0, 1.38, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xc9cfe0, 1.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.8);
  key.position.set(2, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2cc, 0.8);
  rim.position.set(-3, 2, -2.5);
  scene.add(rim);

  const gradientMap = toonGradient();
  const toon = (color = '#ffffff') => new THREE.MeshToonMaterial({ color, gradientMap });
  const glowLayer = (opacity: number) =>
    new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  const textures = {
    icon: chatIconTexture(),
    screen: screenTexture(),
    badge: badgeTexture('', '#000'),
  };
  const mat = {
    skin: toon(),
    hair: toon(),
    outfit: toon(),
    trim: toon(),
    inner: toon(),
    phones: toon(),
    scrunchie: toon(),
    bubble: toon(),
    cushion: toon('#f4f4f6'),
    device: toon('#2b2e38'),
    phoneBack: toon('#cfd4de'),
    glow: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    halo: glowLayer(0.8),
    haloSoft: glowLayer(0.35),
    shell: glowLayer(0.28),
    platform: glowLayer(0.55),
    visor: new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    icon: new THREE.MeshBasicMaterial({ map: textures.icon, transparent: true, depthWrite: false }),
    screen: new THREE.MeshBasicMaterial({ map: textures.screen }),
    badge: new THREE.MeshBasicMaterial({ map: textures.badge }),
    white: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    iris: new THREE.MeshBasicMaterial({ color: '#4a2c1d' }),
    lash: new THREE.MeshBasicMaterial({ color: '#2b1a14' }),
    pupil: new THREE.MeshBasicMaterial({ color: '#1a0f0b' }),
    mouth: new THREE.MeshBasicMaterial({ color: '#b03050' }),
    tongue: new THREE.MeshBasicMaterial({ color: '#ff8a9a' }),
    blush: new THREE.MeshBasicMaterial({
      color: '#ff8fab',
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
    shadow: new THREE.MeshBasicMaterial({
      color: '#17243b',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  };

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) =>
    new THREE.Mesh(geometry, material);
  const sphere = (r: number) => new THREE.SphereGeometry(r, 24, 16);
  const capsule = (r: number, length: number) => new THREE.CapsuleGeometry(r, length, 6, 18);
  const at = <T extends THREE.Object3D>(object: T, x: number, y: number, z: number) => {
    object.position.set(x, y, z);
    return object;
  };
  const group = (...children: THREE.Object3D[]) => {
    const g = new THREE.Group();
    if (children.length) g.add(...children);
    return g;
  };
  const rod = (from: THREE.Vector3, to: THREE.Vector3, r: number, material: THREE.Material) => {
    const direction = to.clone().sub(from);
    const m = mesh(new THREE.CylinderGeometry(r, r, direction.length(), 10), material);
    m.position.copy(from.clone().add(to).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return m;
  };
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  /** Puts a flat face feature on the head sphere, facing outwards. */
  const onFace = <T extends THREE.Object3D>(object: T, x: number, y: number, lift = 0) => {
    const nx = x / (HEAD_R * 1.08);
    const ny = y / (HEAD_R * 0.98);
    const z = HEAD_R * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)) + lift;
    object.position.set(x, y, z);
    object.rotation.set(-Math.asin(ny) * 0.85, Math.asin(nx) * 0.85, 0);
    return object;
  };

  const parts = new Map<MascotAccessory | MascotOutfit, THREE.Object3D>();
  const part = (name: MascotAccessory | MascotOutfit, ...children: THREE.Object3D[]) => {
    const g = group(...children);
    parts.set(name, g);
    return g;
  };

  // ---------- Platform ----------
  const platform = group();
  scene.add(platform);
  const disc = mesh(new THREE.CircleGeometry(0.85, 48), mat.haloSoft);
  disc.rotation.x = -Math.PI / 2;
  const ringOuter = mesh(new THREE.TorusGeometry(0.78, 0.018, 8, 64), mat.platform);
  const ringInner = mesh(new THREE.TorusGeometry(0.56, 0.012, 8, 64), mat.platform);
  for (const ring of [ringOuter, ringInner]) ring.rotation.x = Math.PI / 2;
  const shadow = mesh(new THREE.CircleGeometry(0.62, 40), mat.shadow);
  shadow.rotation.x = -Math.PI / 2;
  platform.add(
    at(disc, 0, 0.004, 0),
    at(shadow, 0, 0.006, 0),
    at(ringOuter, 0, 0.02, 0),
    at(ringInner, 0, 0.03, 0),
  );

  // ---------- Floating avatar ----------
  const avatar = group();
  avatar.rotation.y = 0.12;
  scene.add(avatar);

  // Chat bubble the avatar floats on
  const bubble = mesh(capsule(0.27, 0.72), mat.bubble);
  bubble.rotation.z = Math.PI / 2;
  bubble.scale.set(1, 1, 0.72);
  const shell = mesh(capsule(0.32, 0.74), mat.shell);
  shell.rotation.z = Math.PI / 2;
  shell.scale.set(1, 1, 0.8);
  const tail = mesh(new THREE.ConeGeometry(0.11, 0.24, 16), mat.bubble);
  tail.rotation.z = Math.PI * 0.82;
  const dots = [-0.24, 0, 0.24].map((x) => at(mesh(sphere(0.075), mat.white), x, 0, 0.2));
  const bubbleGroup = at(group(bubble, shell, at(tail, -0.42, -0.24, 0), ...dots), 0, 0.62, 0.28);
  avatar.add(bubbleGroup);

  // Torso
  const body = group();
  avatar.add(body);
  const torso = at(mesh(capsule(0.36, 0.28), mat.outfit), 0, 1.0, -0.04);
  torso.scale.set(1, 1, 0.8);
  body.add(torso);
  body.add(at(mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.14, 16), mat.skin), 0, 1.36, -0.02));

  const hood = at(mesh(new THREE.TorusGeometry(0.27, 0.11, 12, 28), mat.outfit), 0, 1.34, -0.2);
  hood.rotation.x = Math.PI / 2 - 0.5;
  const hoodLining = at(mesh(new THREE.TorusGeometry(0.21, 0.04, 8, 28), mat.trim), 0, 1.36, -0.14);
  hoodLining.rotation.x = Math.PI / 2 - 0.5;
  body.add(part('hoodie', hood, hoodLining));
  body.add(
    part(
      'drawstrings',
      rod(v(-0.08, 1.28, 0.25), v(-0.09, 1.1, 0.3), 0.012, mat.inner),
      rod(v(0.08, 1.28, 0.25), v(0.09, 1.1, 0.3), 0.012, mat.inner),
      at(mesh(sphere(0.022), mat.inner), -0.09, 1.09, 0.3),
      at(mesh(sphere(0.022), mat.inner), 0.09, 1.09, 0.3),
    ),
  );

  const collarL = at(mesh(new THREE.BoxGeometry(0.2, 0.11, 0.04), mat.trim), -0.1, 1.29, 0.2);
  collarL.rotation.set(-0.5, 0.2, -0.55);
  const collarR = at(mesh(new THREE.BoxGeometry(0.2, 0.11, 0.04), mat.trim), 0.1, 1.29, 0.2);
  collarR.rotation.set(-0.5, -0.2, 0.55);
  const zip = at(mesh(new THREE.BoxGeometry(0.025, 0.42, 0.02), mat.inner), 0, 1.02, 0.285);
  body.add(part('jacket', collarL, collarR, zip));

  const shirt = at(mesh(new THREE.CircleGeometry(0.17, 3), mat.inner), 0, 1.17, 0.27);
  shirt.rotation.set(-0.25, 0, Math.PI / 2 + Math.PI);
  shirt.scale.set(1, 0.8, 1);
  const lapelL = at(mesh(new THREE.BoxGeometry(0.09, 0.36, 0.03), mat.trim), -0.13, 1.1, 0.27);
  lapelL.rotation.set(-0.15, 0.25, -0.38);
  const lapelR = at(mesh(new THREE.BoxGeometry(0.09, 0.36, 0.03), mat.trim), 0.13, 1.1, 0.27);
  lapelR.rotation.set(-0.15, -0.25, 0.38);
  body.add(part('blazer', shirt, lapelL, lapelR));
  const tie = at(mesh(new THREE.BoxGeometry(0.06, 0.24, 0.02), mat.phones), 0, 1.08, 0.3);
  tie.rotation.x = -0.15;
  body.add(part('tie', at(mesh(sphere(0.035), mat.phones), 0, 1.22, 0.28), tie));

  const badge = at(mesh(new THREE.PlaneGeometry(0.2, 0.117), mat.badge), 0.18, 1.12, 0.29);
  badge.rotation.set(-0.2, 0.3, 0);
  body.add(part('nameTag', badge));
  const heart = group(
    at(mesh(sphere(0.045), mat.inner), -0.032, 0.02, 0),
    at(mesh(sphere(0.045), mat.inner), 0.032, 0.02, 0),
  );
  const heartTip = at(mesh(new THREE.ConeGeometry(0.06, 0.08, 16), mat.inner), 0, -0.03, 0);
  heartTip.rotation.z = Math.PI;
  heart.add(heartTip);
  body.add(part('heart', at(heart, 0.16, 1.12, 0.28)));

  // Arms: shoulder -> elbow -> hand
  function arm(side: number) {
    const shoulder = at(group(), side * 0.36, 1.2, -0.02);
    shoulder.add(at(mesh(capsule(0.105, 0.16), mat.outfit), 0, -0.14, 0));
    const elbow = at(group(), 0, -0.3, 0);
    shoulder.add(elbow);
    elbow.add(at(mesh(capsule(0.09, 0.16), mat.outfit), 0, -0.12, 0));
    const cuff = at(mesh(new THREE.TorusGeometry(0.075, 0.03, 8, 20), mat.trim), 0, -0.24, 0);
    cuff.rotation.x = Math.PI / 2;
    elbow.add(cuff);
    const hand = at(group(), 0, -0.3, 0);
    elbow.add(hand);
    const palm = mesh(sphere(0.085), mat.skin);
    palm.scale.set(1.05, 1.15, 0.7);
    hand.add(palm);
    hand.add(at(mesh(capsule(0.03, 0.05), mat.skin), side * -0.07, 0.01, 0.03));
    body.add(shoulder);
    return { shoulder, elbow, hand };
  }
  const openArm = arm(-1);
  const phoneArm = arm(1);
  const camBlock = at(
    mesh(new THREE.BoxGeometry(0.08, 0.08, 0.015), mat.device),
    -0.035,
    0.1,
    0.02,
  );
  const phone = group(
    mesh(new THREE.BoxGeometry(0.17, 0.33, 0.03), mat.phoneBack),
    at(mesh(new THREE.PlaneGeometry(0.15, 0.3), mat.screen), 0, 0, -0.016),
    camBlock,
  );
  phone.rotation.set(0, 0, 0);
  phoneArm.hand.add(at(phone, 0, 0.02, 0.08));

  // Head
  const head = at(group(), 0, 1.8, 0);
  body.add(head);
  const skull = mesh(sphere(HEAD_R), mat.skin);
  skull.scale.set(1.08, 0.98, 1);
  head.add(skull);

  const eyes = [-1, 1].map((side) => {
    const eye = group();
    const sclera = mesh(new THREE.CircleGeometry(0.105, 28), mat.white);
    sclera.scale.set(0.82, 1.1, 1);
    const iris = at(mesh(new THREE.CircleGeometry(0.085, 28), mat.iris), 0, -0.012, 0.002);
    iris.scale.set(0.82, 1.1, 1);
    const pupil = at(mesh(new THREE.CircleGeometry(0.042, 20), mat.pupil), 0, -0.02, 0.004);
    const shineBig = at(
      mesh(new THREE.CircleGeometry(0.026, 16), mat.white),
      side * -0.022,
      0.035,
      0.006,
    );
    const shineSmall = at(
      mesh(new THREE.CircleGeometry(0.012, 12), mat.white),
      side * 0.028,
      -0.05,
      0.006,
    );
    const lash = at(
      mesh(new THREE.TorusGeometry(0.098, 0.018, 6, 24, Math.PI * 0.85), mat.lash),
      0,
      0.01,
      0.004,
    );
    lash.rotation.z = Math.PI * 0.075;
    lash.scale.set(0.9, 1.15, 1);
    const flick = at(
      mesh(new THREE.ConeGeometry(0.02, 0.07, 8), mat.lash),
      side * 0.1,
      0.085,
      0.004,
    );
    flick.rotation.z = -side * 1.0;
    eye.add(sclera, iris, pupil, shineBig, shineSmall, lash, flick);
    head.add(onFace(eye, side * 0.19, -0.03, 0.004));
    return eye;
  });
  const happyEyes = [-1, 1].map((side) => {
    const arc = mesh(new THREE.TorusGeometry(0.065, 0.017, 6, 20, Math.PI), mat.lash);
    const holder = group(arc);
    head.add(onFace(holder, side * 0.19, -0.04, 0.006));
    holder.visible = false;
    return holder;
  });
  for (const side of [-1, 1]) {
    const brow = mesh(capsule(0.012, 0.09), mat.lash);
    brow.rotation.z = Math.PI / 2 + side * 0.12;
    head.add(onFace(group(brow), side * 0.19, 0.16, 0.006));
    const blush = mesh(new THREE.CircleGeometry(0.06, 20), mat.blush);
    blush.scale.set(1.3, 0.75, 1);
    head.add(onFace(group(blush), side * 0.33, -0.16, 0.004));
  }
  const mouth = group(
    mesh(new THREE.CircleGeometry(0.07, 24, Math.PI, Math.PI), mat.mouth),
    at(mesh(new THREE.CircleGeometry(0.035, 16, Math.PI, Math.PI), mat.tongue), 0, -0.025, 0.002),
  );
  head.add(onFace(mouth, 0, -0.17, 0.004));

  // Hair
  const hair = group();
  head.add(hair);
  const cap = mesh(
    new THREE.SphereGeometry(0.565, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.6),
    mat.hair,
  );
  cap.scale.set(1.08, 1, 1.03);
  cap.rotation.x = -0.42;
  hair.add(at(cap, 0, 0.03, 0));
  const back = mesh(sphere(0.5), mat.hair);
  back.scale.set(1.18, 1.45, 0.72);
  hair.add(at(back, 0, -0.42, -0.24));
  for (let i = -2; i <= 2; i++) {
    const strand = mesh(sphere(0.14), mat.hair);
    strand.scale.set(0.85, 1.45, 0.5);
    strand.rotation.z = -i * 0.28;
    hair.add(at(strand, i * 0.17, 0.27 - Math.abs(i) * 0.04, 0.43 - Math.abs(i) * 0.07));
  }
  /** A wavy strand: tapered capsules joined end to end. */
  const strand = (points: [number, number, number, number][]) => {
    const g = group();
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1, z1, r1] = points[i];
      const [x2, y2, z2, r2] = points[i + 1];
      const from = v(x1, y1, z1);
      const to = v(x2, y2, z2);
      const direction = to.clone().sub(from);
      const piece = mesh(
        new THREE.CapsuleGeometry((r1 + r2) / 2, direction.length(), 6, 14),
        mat.hair,
      );
      piece.position.copy(from.clone().add(to).multiplyScalar(0.5));
      piece.quaternion.setFromUnitVectors(v(0, 1, 0), direction.normalize());
      g.add(piece);
    }
    return g;
  };
  for (const side of [-1, 1]) {
    // Front lock falls below the ear cup, a fuller lock sits behind it.
    hair.add(
      strand(
        [
          [0.44, -0.12, 0.2, 0.12],
          [0.52, -0.34, 0.16, 0.12],
          [0.45, -0.55, 0.17, 0.11],
          [0.53, -0.76, 0.14, 0.1],
          [0.47, -0.95, 0.15, 0.08],
          [0.52, -1.08, 0.12, 0.05],
        ].map(([x, y, z, r]) => [side * x, y, z, r] as [number, number, number, number]),
      ),
      strand(
        [
          [0.5, 0.0, -0.18, 0.17],
          [0.62, -0.3, -0.16, 0.16],
          [0.55, -0.58, -0.14, 0.15],
          [0.66, -0.86, -0.16, 0.13],
          [0.58, -1.1, -0.18, 0.1],
          [0.63, -1.25, -0.2, 0.06],
        ].map(([x, y, z, r]) => [side * x, y, z, r] as [number, number, number, number]),
      ),
    );
  }
  const bun = at(mesh(sphere(0.16), mat.hair), 0.16, 0.52, -0.24);
  const scrunchie = at(
    mesh(new THREE.TorusGeometry(0.12, 0.06, 10, 20), mat.scrunchie),
    0.14,
    0.46,
    -0.2,
  );
  scrunchie.rotation.set(1.1, 0.4, 0);
  hair.add(bun, scrunchie);

  // Headphones
  const band = at(
    mesh(new THREE.TorusGeometry(0.64, 0.045, 10, 48, Math.PI), mat.phones),
    0,
    0.0,
    -0.04,
  );
  const cups = [-1, 1].map((side) => {
    const cup = at(group(), side * 0.64, -0.04, 0);
    const shellCup = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 28), mat.phones);
    shellCup.rotation.z = Math.PI / 2;
    const cushion = at(
      mesh(new THREE.TorusGeometry(0.15, 0.05, 10, 24), mat.cushion),
      -side * 0.08,
      0,
      0,
    );
    cushion.rotation.y = Math.PI / 2;
    const iconDisc = at(mesh(new THREE.CircleGeometry(0.135, 28), mat.glow), side * 0.075, 0, 0);
    iconDisc.rotation.y = (side * Math.PI) / 2;
    const icon = at(mesh(new THREE.PlaneGeometry(0.2, 0.2), mat.icon), side * 0.078, 0, 0);
    icon.rotation.y = (side * Math.PI) / 2;
    cup.add(shellCup, cushion, iconDisc, icon);
    return cup;
  });
  const mic = group(
    rod(v(-0.66, -0.16, 0.06), v(-0.42, -0.4, 0.4), 0.018, mat.device),
    at(mesh(capsule(0.032, 0.05), mat.device), -0.4, -0.42, 0.43),
  );
  const ear = (side: number) => {
    const g = at(group(), side * 0.36, 0.5, -0.02);
    g.rotation.z = -side * 0.45;
    g.add(mesh(new THREE.ConeGeometry(0.15, 0.3, 16), mat.phones));
    g.add(at(mesh(new THREE.ConeGeometry(0.08, 0.18, 12), mat.glow), 0, -0.03, 0.07));
    return g;
  };
  head.add(band, ...cups, mic, part('catEars', ear(-1), ear(1)));
  const visor = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 36, 1, true, -0.8, 1.6), mat.visor);
  head.add(part('visor', at(visor, 0, -0.03, 0)));

  // Halo
  const halo = at(mesh(new THREE.TorusGeometry(0.42, 0.024, 10, 56), mat.halo), 0, 0.78, -0.05);
  halo.rotation.x = Math.PI / 2 - 0.3;
  const haloOuter = at(
    mesh(new THREE.TorusGeometry(0.5, 0.01, 8, 56), mat.haloSoft),
    0,
    0.8,
    -0.05,
  );
  haloOuter.rotation.x = Math.PI / 2 - 0.3;
  head.add(halo, haloOuter);

  // ---------- GLB model per skin ----------
  // Halo shown above a GLB model that does not include its own.
  const modelHalo = group(
    mesh(new THREE.TorusGeometry(0.42, 0.024, 10, 56), mat.halo),
    mesh(new THREE.TorusGeometry(0.5, 0.01, 8, 56), mat.haloSoft),
  );
  modelHalo.rotation.x = Math.PI / 2 - 0.3;
  modelHalo.visible = false;
  avatar.add(modelHalo);
  const modelHolder = group();
  avatar.add(modelHolder);

  type ActionName = 'idle' | 'wave' | 'think' | 'happy' | 'listen';
  interface LoadedModel {
    config: AvatarModel;
    root: THREE.Object3D;
    mixer: THREE.AnimationMixer | null;
    /** Clips such as Blink_Loop or Halo_Pulse_Loop that always run together. */
    loops: THREE.AnimationAction[];
    /** Loop that speeds up while the assistant is thinking (typing dots). */
    typing: THREE.AnimationAction | null;
    /** State clips of a rigged model, one played at a time. */
    actions: Partial<Record<ActionName, THREE.AnimationAction>>;
    head: THREE.Object3D | null;
    headBase: THREE.Euler | null;
    top: number;
  }
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const loaded = new Map<string, Promise<LoadedModel>>();
  let model: LoadedModel | null = null;
  let current: THREE.AnimationAction | null = null;
  let requestedSkin = '';
  let environment: THREE.Texture | null = null;

  const statePatterns: Record<Exclude<ActionName, 'idle'>, RegExp> = {
    wave: /wave|hello|greet/i,
    think: /think|talk/i,
    happy: /happy|cheer|jump|celebrat/i,
    listen: /listen|nod/i,
  };

  function prepare(config: AvatarModel, gltf: GLTF): LoadedModel {
    const root = gltf.scene;
    root.rotation.y = config.rotationY ?? 0;
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = (config.height ?? 2.4) / Math.max(size.y, 0.0001);
    root.scale.setScalar(scale);
    const scaled = new THREE.Box3().setFromObject(root);
    const center = scaled.getCenter(new THREE.Vector3());
    root.position.set(-center.x, 0.02 - scaled.min.y, -center.z);
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) object.frustumCulled = false;
    });
    const mixer = gltf.animations.length ? new THREE.AnimationMixer(root) : null;
    const action = (clip?: THREE.AnimationClip) =>
      clip && mixer ? mixer.clipAction(clip) : undefined;
    const isState = (clip: THREE.AnimationClip) =>
      /idle|breath|stand/i.test(clip.name) && !/loop/i.test(clip.name)
        ? true
        : Object.values(statePatterns).some((pattern) => pattern.test(clip.name));
    const loopClips = gltf.animations.filter((clip) => !isState(clip));
    const loops = loopClips.map((clip) => action(clip)!).filter(Boolean);
    const typingClip = loopClips.find((clip) => /typ|dots/i.test(clip.name));
    const actions: LoadedModel['actions'] = {
      idle: action(gltf.animations.find((c) => /idle|breath|stand/i.test(c.name) && isState(c))),
    };
    for (const [name, pattern] of Object.entries(statePatterns) as [ActionName, RegExp][])
      actions[name] = action(gltf.animations.find((c) => pattern.test(c.name)));
    for (const name of ['wave', 'happy'] as const) {
      actions[name]?.setLoop(THREE.LoopOnce, 1);
      if (actions[name]) actions[name]!.clampWhenFinished = true;
    }
    const head = config.headNode ? (root.getObjectByName(config.headNode) ?? null) : null;
    return {
      config,
      root,
      mixer,
      loops,
      typing: action(typingClip) ?? null,
      actions,
      head,
      headBase: head ? head.rotation.clone() : null,
      top: 0.02 + size.y * scale,
    };
  }

  function play(next: THREE.AnimationAction | undefined) {
    if (!next || next === current) return;
    next.reset().fadeIn(0.25).play();
    current?.fadeOut(0.25);
    current = next;
  }

  function useEnvironment(on: boolean) {
    // PBR materials from the GLB need an environment to look like the preview render.
    if (on && !environment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    }
    scene.environment = on ? environment : null;
    scene.environmentIntensity = 0.45;
    // The toon avatar is tuned for strong flat light; PBR models need softer light to keep their colours.
    hemi.intensity = on ? 0.45 : 1.7;
    key.intensity = on ? 1.1 : 1.8;
    rim.intensity = on ? 0.35 : 0.8;
  }

  function showModel(next: LoadedModel | null) {
    if (model && model !== next) {
      model.mixer?.stopAllAction();
      modelHolder.remove(model.root);
    }
    model = next;
    current = null;
    body.visible = !next;
    bubbleGroup.visible = !next?.config.hasBubble;
    platform.visible = !next?.config.hasPlatform;
    modelHalo.visible = !!next && !next.config.hasHalo;
    useEnvironment(!!next);
    if (!next) return;
    modelHolder.add(next.root);
    modelHalo.position.set(0, next.top + 0.12, -0.05);
    for (const loop of next.loops) loop.reset().play();
    play(next.actions.idle);
  }

  function loadModel(skin: MascotSkin) {
    requestedSkin = skin.id;
    const config = avatarModels[skin.id];
    if (!config) return showModel(null);
    let pending = loaded.get(config.url);
    // Hide the built-in avatar while the file loads so two different characters never flash.
    if (model?.config !== config) {
      body.visible = false;
      bubbleGroup.visible = false;
    }
    if (!pending) {
      pending = loader.loadAsync(config.url).then((gltf) => prepare(config, gltf));
      loaded.set(config.url, pending);
    }
    pending
      .then((ready) => {
        if (!disposed && requestedSkin === skin.id) showModel(ready);
      })
      .catch(() => {
        // Missing or broken file: keep the procedural avatar for this skin.
        loaded.delete(config.url);
        if (!disposed && requestedSkin === skin.id) showModel(null);
      });
  }

  function poseModel(
    time: number,
    delta: number,
    active: { name: MascotGesture } | null,
    k: number,
  ) {
    if (!model) return;
    const t = options.reducedMotion ? 0 : time;
    const { actions } = model;
    if (model.mixer) {
      if (active?.name === 'wave' && actions.wave) play(actions.wave);
      else if (active?.name === 'happy' && actions.happy) play(actions.happy);
      else if (mood === 'thinking' && actions.think) play(actions.think);
      else if (mood === 'listening' && actions.listen) play(actions.listen);
      else play(actions.idle);
      if (model.typing) model.typing.timeScale = mood === 'thinking' ? 2.4 : 1;
      if (!options.reducedMotion) model.mixer.update(delta);
    }
    // Procedural layer for what the file has no clip for: breathing, sway, wave wiggle, nod.
    modelHolder.scale.set(1, 1 + Math.sin(t * 2.4) * 0.01, 1);
    let tilt = Math.sin(t * 1.3) * 0.02;
    if (mood === 'thinking') tilt += 0.05;
    if (active?.name === 'wave' && !actions.wave) tilt += Math.sin(time * 12) * 0.07;
    const nod = mood === 'listening' && !actions.listen ? Math.sin(t * 4) * 0.05 : 0;
    modelHolder.rotation.z = approach(modelHolder.rotation.z, tilt, k);
    modelHolder.rotation.x = approach(modelHolder.rotation.x, nod, k);
    modelHolder.rotation.y = approach(modelHolder.rotation.y, target.yaw * 0.6, k);
    if (model.head && model.headBase) {
      const base = model.headBase;
      model.head.rotation.set(base.x - target.pitch * 0.4, base.y + target.yaw * 0.4, base.z);
    }
  }

  // ---------- State & animation ----------
  let mood: MascotMood = 'idle';
  let gesture: { name: MascotGesture; started: number } | null = null;
  let badgeKey = '';
  const target = { yaw: 0, pitch: 0 };
  const timer = new THREE.Timer();
  let nextBlink = 1.2;
  let tiltUntil = 0;
  let tiltSide = 1;
  let frame = 0;
  let disposed = false;

  function applySkin(skin: MascotSkin) {
    const c = skin.colors;
    mat.skin.color.set(c.skin);
    mat.hair.color.set(c.hair);
    mat.outfit.color.set(c.outfit);
    mat.trim.color.set(c.trim);
    mat.inner.color.set(c.inner);
    mat.phones.color.set(c.headphones);
    mat.scrunchie.color.set(c.scrunchie);
    mat.bubble.color.set(c.glow);
    mat.iris.color.set(c.iris);
    for (const m of [mat.glow, mat.halo, mat.haloSoft, mat.shell, mat.platform, mat.visor])
      m.color.set(c.glow);
    parts.forEach((object, name) => {
      object.visible =
        name === 'hoodie' || name === 'jacket' || name === 'blazer'
          ? name === skin.outfit
          : skin.accessories.includes(name as MascotAccessory);
    });
    const key = `${skin.badge ?? ''}|${c.outfit}`;
    if (key !== badgeKey) {
      badgeKey = key;
      textures.badge.dispose();
      textures.badge = badgeTexture(
        skin.badge ?? '',
        skin.outfit === 'blazer' ? c.headphones : c.outfit,
      );
      mat.badge.map = textures.badge;
      mat.badge.needsUpdate = true;
    }
  }

  const approach = (current: number, goal: number, rate: number) =>
    current + (goal - current) * rate;

  function pose(time: number, delta: number) {
    const moving = !options.reducedMotion;
    const t = moving ? time : 0;
    const active =
      gesture && time - gesture.started < GESTURE_SECONDS[gesture.name] ? gesture : null;
    if (!active) gesture = null;
    const progress = active ? (time - active.started) / GESTURE_SECONDS[active.name] : 0;
    const k = moving ? Math.min(1, delta * 7) : 1;

    // Idle loop: float, breathe, halo pulse
    const hop = active?.name === 'happy' ? Math.abs(Math.sin(progress * Math.PI * 2)) * 0.12 : 0;
    avatar.position.y = Math.sin(t * 1.6) * 0.05 + hop;
    torso.scale.y = 1 + Math.sin(t * 2.4) * 0.015;
    shadow.scale.setScalar(1 - avatar.position.y * 0.6);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    mat.halo.opacity = 0.55 + pulse * 0.35;
    halo.scale.setScalar(1 + pulse * 0.05);
    modelHalo.scale.setScalar(1 + pulse * 0.05);
    poseModel(time, delta, active, k);
    mat.platform.opacity = 0.35 + pulse * 0.3;
    ringOuter.rotation.z = t * 0.25;
    ringInner.rotation.z = -t * 0.35;
    mat.shell.opacity = 0.18 + pulse * 0.14;

    // Typing loop: dots pulse left to right (fast while thinking)
    const thinking = mood === 'thinking';
    const listening = mood === 'listening';
    dots.forEach((dot, i) => {
      const wave = Math.max(0, Math.sin(t * (thinking ? 7 : 2.2) - i * 0.9));
      dot.scale.setScalar(1 + wave * (thinking ? 0.45 : 0.15));
      dot.position.y = wave * (thinking ? 0.05 : 0.015);
    });

    // Head: look at pointer, at the phone while typing, nod while listening, tilt after some blinks
    const yawGoal = thinking ? 0.25 : target.yaw;
    const pitchGoal = thinking ? 0.16 : listening ? Math.sin(t * 4) * 0.12 : -target.pitch;
    const tiltGoal =
      active?.name === 'wave' ? -0.14 : thinking ? 0.1 : time < tiltUntil ? tiltSide * 0.12 : 0;
    head.rotation.y = approach(head.rotation.y, yawGoal, k);
    head.rotation.x = approach(head.rotation.x, pitchGoal, k);
    head.rotation.z = approach(head.rotation.z, tiltGoal, k);
    body.rotation.y = approach(body.rotation.y, target.yaw * 0.3, k);

    // Blink loop with an occasional friendly head tilt
    if (moving && time > nextBlink) {
      const closed = time - nextBlink < 0.14;
      for (const eye of eyes) eye.scale.y = closed ? 0.1 : 1;
      if (!closed) {
        nextBlink = time + 2.6 + Math.random() * 2.6;
        if (Math.random() < 0.4) {
          tiltUntil = time + 1.6;
          tiltSide = Math.random() < 0.5 ? -1 : 1;
        }
      }
    }
    const happy = active?.name === 'happy' || listening;
    for (const eye of eyes) eye.visible = !happy;
    for (const eye of happyEyes) eye.visible = happy;
    mouth.scale.set(1, happy ? 1.25 : 1, 1);

    // Open arm: welcoming palm, raised to wave on hover
    let openZ = -1.2 + Math.sin(t * 1.6) * 0.04;
    let openX = -0.75;
    let openElbow = -0.35;
    if (active?.name === 'wave') {
      openZ = -2.55;
      openX = -0.2;
      openElbow = -0.5 + Math.sin(time * 14) * 0.45;
    } else if (active?.name === 'happy') {
      openZ = -2.2;
      openX = -0.3;
      openElbow = -0.2;
    }
    openArm.shoulder.rotation.z = approach(openArm.shoulder.rotation.z, openZ, k);
    openArm.shoulder.rotation.x = approach(openArm.shoulder.rotation.x, openX, k);
    openArm.elbow.rotation.z = approach(openArm.elbow.rotation.z, openElbow, Math.min(1, k * 1.4));
    openArm.hand.rotation.set(0.4, 0, 1.3);

    // Phone arm: holds the phone up; small thumb-typing bob while thinking
    phoneArm.shoulder.rotation.z = 0.32;
    phoneArm.shoulder.rotation.x = approach(
      phoneArm.shoulder.rotation.x,
      thinking ? -0.5 : -0.25,
      k,
    );
    phoneArm.elbow.rotation.x =
      -2.1 + (thinking ? Math.sin(t * 12) * 0.05 : Math.sin(t * 1.6) * 0.03);
    phoneArm.hand.rotation.set(2.05, -0.35, 0.12);

    // Listening: ear cups pulse
    const cupPulse = listening ? 1 + Math.max(0, Math.sin(t * 6)) * 0.12 : 1;
    for (const cup of cups) cup.scale.setScalar(cupPulse);
  }

  function render() {
    timer.update();
    pose(timer.getElapsed(), Math.min(timer.getDelta(), 0.1));
    renderer.render(scene, camera);
  }
  function loop() {
    if (disposed) return;
    render();
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (disposed || frame || options.reducedMotion || document.hidden) return;
    timer.update();
    frame = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  applySkin(initialSkin);
  loadModel(initialSkin);
  render();
  start();

  return {
    setSkin(skin) {
      applySkin(skin);
      loadModel(skin);
      if (options.reducedMotion) render();
    },
    setMood(next) {
      mood = next;
      if (options.reducedMotion) render();
    },
    play(name) {
      if (options.reducedMotion) return;
      gesture = { name, started: timer.getElapsed() };
    },
    look(x, y) {
      target.yaw = THREE.MathUtils.clamp(x, -1, 1) * 0.5;
      target.pitch = THREE.MathUtils.clamp(y, -1, 1) * 0.25;
    },
    resize(width, height) {
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    },
    dispose() {
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      modelHolder.clear();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      for (const pending of loaded.values())
        void pending
          .then((ready) =>
            ready.root.traverse((object) => {
              if (!(object instanceof THREE.Mesh)) return;
              object.geometry.dispose();
              for (const material of [object.material].flat()) {
                for (const value of Object.values(material))
                  if (value instanceof THREE.Texture) value.dispose();
                material.dispose();
              }
            }),
          )
          .catch(() => undefined);
      Object.values(textures).forEach((texture) => texture.dispose());
      Object.values(mat).forEach((material) => material.dispose());
      gradientMap.dispose();
      environment?.dispose();
      timer.dispose();
      renderer.dispose();
    },
  };
}
