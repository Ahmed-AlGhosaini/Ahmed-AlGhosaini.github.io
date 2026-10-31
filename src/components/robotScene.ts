// The three.js scene behind HeroRobot: a 3D humanoid bust that turns its head to look at the mouse cursor.
// The robot is built from three.js primitives, so there is no model file to load.
// HeroRobot loads this module with import() so three.js stays out of the page's initial bundle.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Vertical slice of the bust that should fill the banner height (world units).
const FRAME = { top: 2.6, bottom: -3.45 };
const FOV = 30;
// The cursor is projected onto this plane (between robot and camera) to get a 3D gaze target.
const GAZE_PLANE_Z = 3;
const MAX_YAW = 1.0;
const MAX_PITCH_UP = 0.55;
const MAX_PITCH_DOWN = 0.5;
// How the look rotation is shared between torso, neck and head.
const SHARE = { torso: 0.15, neck: 0.35, head: 0.5 };
const IDLE_AFTER = 4; // seconds without pointer movement before the robot glances around
// On wide banners, shift the robot right so it sits beside the centred text (fraction of width).
const WIDE_BREAKPOINT = 1024;
const WIDE_OFFSET = 0.34;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Frame-rate independent exponential smoothing factor.
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
// Distance from the page top, ignoring CSS transforms (e.g. the fade-up entrance animation).
function layoutTop(el: HTMLElement) {
  let y = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
  return y;
}

function buildRobot() {
  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xf5f5f3,
    roughness: 0.32,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
  });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x2b2e35, roughness: 0.42, metalness: 0.65 });
  const visor = new THREE.MeshPhysicalMaterial({
    color: 0x0a0c11,
    roughness: 0.12,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const glow = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 2.2 });

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => new THREE.Mesh(geometry, material);

  // Smooth lathe solid from (radius, y) control points, flattened front-to-back.
  const lathe = (points: number[][], material: THREE.Material, depth = 0.6) => {
    const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const m = mesh(new THREE.LatheGeometry(curve.getPoints(48), 64), material);
    m.scale.z = depth;
    return m;
  };

  // Torso: chest shell (shoulders → ribcage), graphite waist actuator, pelvis shell.
  const torso = new THREE.Group();
  const chest = lathe(
    [[0.001, -1.45], [0.62, -1.4], [0.8, -0.85], [0.88, -0.35], [0.78, 0.02], [0.4, 0.2], [0.001, 0.24]],
    shell,
  );
  const waist = lathe([[0.001, -2.05], [0.5, -2.0], [0.46, -1.7], [0.52, -1.35], [0.001, -1.3]], graphite);
  const pelvis = lathe([[0.001, -3.6], [0.66, -3.5], [0.66, -2.3], [0.56, -1.95], [0.001, -1.9]], shell);
  const collar = mesh(new THREE.TorusGeometry(0.27, 0.05, 16, 48), graphite);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.17;
  torso.add(chest, waist, pelvis, collar);

  // Chest core light.
  const core = mesh(new THREE.TorusGeometry(0.075, 0.016, 12, 40), glow);
  core.position.set(0, -0.45, 0.515);
  core.rotation.x = -0.2;
  const coreBack = mesh(new THREE.CircleGeometry(0.07, 40), graphite);
  coreBack.position.set(0, -0.45, 0.51);
  coreBack.rotation.x = -0.2;
  torso.add(core, coreBack);

  // Shoulders and upper arms.
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.98, -0.2, 0);
    shoulder.rotation.z = side * 0.07;
    const joint = mesh(new THREE.SphereGeometry(0.24, 32, 24), graphite);
    const cap = mesh(new THREE.SphereGeometry(0.3, 40, 28), shell);
    cap.scale.set(1, 0.85, 1);
    cap.position.set(side * 0.06, 0.05, 0);
    const ring = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32), graphite);
    ring.position.set(side * 0.06, -0.33, 0);
    const upperArm = mesh(new THREE.CapsuleGeometry(0.2, 0.95, 8, 32), shell);
    upperArm.position.set(side * 0.06, -0.95, 0);
    const elbow = mesh(new THREE.SphereGeometry(0.17, 24, 16), graphite);
    elbow.position.set(side * 0.06, -1.62, 0);
    const forearm = mesh(new THREE.CapsuleGeometry(0.18, 0.9, 8, 32), shell);
    forearm.position.set(side * 0.06, -2.25, 0.05);
    shoulder.add(joint, cap, ring, upperArm, elbow, forearm);
    torso.add(shoulder);
  }

  // Neck: graphite actuator stack. Pivot sits at the top of the torso.
  const neck = new THREE.Group();
  neck.position.y = 0.16;
  const neckCore = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 32), graphite);
  neckCore.position.y = 0.22;
  neck.add(neckCore);
  for (const y of [0.1, 0.22, 0.34]) {
    const band = mesh(new THREE.TorusGeometry(0.185, 0.018, 10, 40), graphite);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    neck.add(band);
  }
  torso.add(neck);

  // Head. Pivot at the top of the neck; the skull sits above it.
  const head = new THREE.Group();
  head.position.y = 0.46;
  head.rotation.order = "YXZ";
  const skullScale = new THREE.Vector3(0.88, 1, 0.95);
  const skullCenter = new THREE.Vector3(0, 0.5, 0.02);
  const skull = mesh(new THREE.SphereGeometry(0.5, 64, 48), shell);
  skull.scale.copy(skullScale);
  skull.position.copy(skullCenter);

  // Visor: a band cut from a slightly larger sphere so it wraps the face.
  const visorWidth = 2.0;
  const face = mesh(
    new THREE.SphereGeometry(0.508, 64, 32, Math.PI / 2 - visorWidth / 2, visorWidth, 0.95, 0.78),
    visor,
  );
  face.scale.copy(skullScale);
  face.position.copy(skullCenter);
  head.add(skull, face);

  // Point on the (scaled) visor surface, in head space. theta from the top, phi around Y (+Z = front).
  const onVisor = (theta: number, phi: number, r = 0.512) =>
    new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta))
      .multiply(skullScale)
      .add(skullCenter);

  const eyeGeometry = new THREE.CapsuleGeometry(0.032, 0.085, 4, 16).rotateZ(Math.PI / 2);
  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const eye = mesh(eyeGeometry, glow);
    const p = onVisor(1.3, Math.PI / 2 + side * 0.3);
    eye.position.copy(p);
    eye.lookAt(p.clone().sub(skullCenter).multiplyScalar(2).add(skullCenter));
    eye.scale.z = 0.5;
    eyes.push(eye);
    head.add(eye);
  }

  // Ear pods with a light ring.
  for (const side of [-1, 1]) {
    const pod = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 32), graphite);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * 0.43, 0.5, 0);
    const ring = mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 32), glow);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 0.48, 0.5, 0);
    head.add(pod, ring);
  }
  neck.add(head);

  return { torso, neck, head, eyes, headCenter: skullCenter };
}

// Mounts the robot into `container` and returns a cleanup function.
// Throws if WebGL is unavailable. `onReady` fires once the first frame has been drawn.
export function mountRobot(
  container: HTMLElement,
  {
    alignTop,
    alignBottom,
    onReady,
  }: {
    // CSS selectors of the elements whose top / bottom edges the robot's head top / base line up with
    // (wide layout only). The robot is scaled to span exactly that range.
    alignTop?: string;
    alignBottom?: string;
    onReady: () => void;
  },
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // It's a background behind text: 1.5x looks almost the same as 2x with ~45% fewer pixels to shade.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = "absolute inset-0 h-full w-full";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.7;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6d3d1, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 5, 6);
  const rim = new THREE.DirectionalLight(0x93c5fd, 2.5);
  rim.position.set(5, 3, -4);
  scene.add(key, rim);

  const { torso, neck, head, eyes, headCenter } = buildRobot();
  scene.add(torso);
  torso.updateMatrixWorld(true);
  const headTop = head.localToWorld(headCenter.clone().setY(headCenter.y + 0.5));
  const base = new THREE.Vector3(0, new THREE.Box3().setFromObject(torso).min.y, 0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Track the cursor anywhere on the page; the target is recomputed every frame so
  // scrolling (which moves the banner under a still cursor) is handled too.
  const pointer = { x: 0, y: 0, seen: false, lastMove: -Infinity };
  const clock = new THREE.Clock();
  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    pointer.lastMove = clock.elapsedTime;
  };
  window.addEventListener("pointermove", onPointer);
  window.addEventListener("pointerdown", onPointer);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Fit the bust to the banner height, but keep its shoulders in view on narrow screens.
    const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const frameH = FRAME.top - FRAME.bottom;
    const dist = Math.max(frameH / (2 * halfTan), 4.2 / (2 * halfTan * camera.aspect));
    const centerY = (FRAME.top + FRAME.bottom) / 2;
    camera.position.set(0, centerY + 0.15, dist);
    camera.lookAt(0, centerY, 0);
    camera.zoom = 1;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    if (w >= WIDE_BREAKPOINT) {
      // Zoom and shift the view vertically so the head top and base sit level with the alignment elements.
      const topEl = alignTop ? document.querySelector<HTMLElement>(alignTop) : null;
      const bottomEl = alignBottom ? document.querySelector<HTMLElement>(alignBottom) : null;
      let shiftY = 0;
      if (topEl) {
        const toPx = (p: THREE.Vector3) => ((1 - p.clone().project(camera).y) / 2) * h;
        const headTopPx = toPx(headTop);
        const targetTop = layoutTop(topEl) - layoutTop(container);
        if (bottomEl) {
          const targetBottom = layoutTop(bottomEl) + bottomEl.offsetHeight - layoutTop(container);
          camera.zoom = (targetBottom - targetTop) / (toPx(base) - headTopPx);
          camera.updateProjectionMatrix();
        }
        // Zoom scales about the view centre; the view offset is in zoomed pixels.
        shiftY = h / 2 + (headTopPx - h / 2) * camera.zoom - targetTop;
      }
      camera.setViewOffset(w, h, -w * WIDE_OFFSET, shiftY, w, h);
    }
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // Only animate while the banner is on screen.
  let visible = true;
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersectionObserver.observe(container);

  const raycaster = new THREE.Raycaster();
  const gazePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -GAZE_PLANE_Z);
  const ndc = new THREE.Vector2();
  const gaze = new THREE.Vector3();
  const headWorld = new THREE.Vector3();
  const look = { yaw: 0, pitch: 0 };
  let nextBlink = 2;
  let blinkStart = -1;
  let firstFrame = true;

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (!visible) return;

    // Gaze target: the cursor if it moved recently, otherwise a slow glance around.
    const idle = !pointer.seen || t - pointer.lastMove > IDLE_AFTER;
    let hasGaze = false;
    if (!idle) {
      const rect = container.getBoundingClientRect();
      ndc.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -((pointer.y - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      hasGaze = !!raycaster.ray.intersectPlane(gazePlane, gaze);
    }
    if (!hasGaze) {
      const wander = reduceMotion ? 0 : 1;
      gaze.set(Math.sin(t * 0.35) * 1.4 * wander, 1.1 + Math.sin(t * 0.6) * 0.35 * wander, GAZE_PLANE_Z);
    }

    head.localToWorld(headWorld.copy(headCenter));
    const dx = gaze.x - headWorld.x;
    const dy = gaze.y - headWorld.y;
    const dz = gaze.z - headWorld.z;
    const yaw = clamp(Math.atan2(dx, dz), -MAX_YAW, MAX_YAW);
    const pitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -MAX_PITCH_DOWN, MAX_PITCH_UP);
    const k = damp(idle ? 2.5 : 7, dt);
    look.yaw += (yaw - look.yaw) * k;
    look.pitch += (pitch - look.pitch) * k;

    torso.rotation.y = look.yaw * SHARE.torso;
    neck.rotation.y = look.yaw * SHARE.neck;
    neck.rotation.x = -look.pitch * SHARE.neck;
    head.rotation.y = look.yaw * SHARE.head;
    head.rotation.x = -look.pitch * (1 - SHARE.neck);
    head.rotation.z = -look.yaw * 0.08; // slight curious tilt

    if (!reduceMotion) torso.position.y = Math.sin(t * 1.3) * 0.012; // breathing

    // Blink every few seconds.
    if (t > nextBlink) {
      blinkStart = t;
      nextBlink = t + 2.5 + Math.random() * 3.5;
    }
    const blink = clamp(1 - Math.abs(t - blinkStart - 0.08) / 0.08, 0, 1);
    for (const eye of eyes) eye.scale.y = 1 - blink * 0.9;

    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onReady();
    }
  };

  // Compile the shaders in the background (parallel compile where supported) instead of
  // stalling the main thread on the first render.
  let disposed = false;
  renderer
    .compileAsync(scene, camera)
    .catch(() => {})
    .then(() => {
      if (!disposed) renderer.setAnimationLoop(frame);
    });

  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("pointerdown", onPointer);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mat) => mat.dispose());
    });
    envMap.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
