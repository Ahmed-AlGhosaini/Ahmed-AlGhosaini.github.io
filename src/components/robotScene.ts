// The three.js scene behind HeroRobot: a 3D humanoid that turns its head to look at the mouse cursor.
// The robot is built from three.js primitives, so there is no model file to load.
// HeroRobot loads this module with import() so three.js stays out of the page's initial bundle.
// It is drawn as black-and-white line art, like a patent drawing: the parts are rendered into an
// offscreen buffer (part id, normal, depth), then an ink pass draws contour lines wherever those change.

import * as THREE from "three";

// Vertical slice of the robot (head to feet) that should fill the banner height (world units).
const FRAME = { top: 2.6, bottom: -7.0 };
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
const WIDE_OFFSET = 0.31;
// Linear depth is stored divided by this, so it fits the 0–1 range of the buffer's alpha channel.
const DEPTH_RANGE = 40;
// Hatching line spacing (world units): dense on the visor (dark glass), sparse on the joints (graphite).
const HATCH = { visor: 0.03, joint: 0.06 };
// Outline width in drawing-buffer pixels.
const LINE_WIDTH = 1;

// Part pass: view-space normal (xy), part id and linear depth. Hatched parts add the hatch ink
// (0–1, antialiased) to their id as a fraction up to 0.25, which the ink pass reads back.
const PART_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDepth;
  void main() {
    vNormal = normalMatrix * normal;
    vPosition = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const PART_FRAGMENT = /* glsl */ `
  uniform float uId;
  uniform float uHatch; // line spacing, 0 = no hatching
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDepth;
  void main() {
    float hatch = 0.0;
    if (uHatch > 0.0) {
      // Diagonal stripes in the part's own space, so they stay put on the surface as it turns.
      float t = (vPosition.x + vPosition.y) / uHatch;
      hatch = 1.0 - smoothstep(0.25, 1.0, abs(fract(t) - 0.5) / fwidth(t));
    }
    gl_FragColor = vec4(normalize(vNormal).xy, uId + 0.25 * hatch, vDepth / ${DEPTH_RANGE.toFixed(1)});
  }`;

// Ink pass: a pixel is inked when a neighbour belongs to another part, faces a different way
// (a crease) or the depth jumps (a part overlapping itself). Output is black with coverage alpha.
// Neighbours are LINE_WIDTH pixels away, and only one side of each edge is inked (the nearer pixel,
// or for creases the pixel below/left), which keeps the lines LINE_WIDTH pixels wide.
const INK_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`;
const INK_FRAGMENT = /* glsl */ `
  uniform sampler2D tParts;
  uniform vec2 uTexel;
  varying vec2 vUv;

  vec4 c;
  vec3 cNormal;

  vec3 unpackNormal(vec4 p) {
    return vec3(p.xy, sqrt(max(0.0, 1.0 - dot(p.xy, p.xy))));
  }
  vec4 at(float x, float y) {
    return texture2D(tParts, vUv + vec2(x, y) * uTexel * ${LINE_WIDTH.toFixed(1)});
  }
  // ahead: whether n is the up/right neighbour, which owns creases.
  float edge(vec4 n, bool ahead) {
    if (abs(n.b - c.b) > 0.5) return c.a < n.a ? 1.0 : 0.0;
    return ahead && dot(unpackNormal(n), cNormal) < 0.8 ? 1.0 : 0.0;
  }
  // a is the down/left neighbour, b the opposite one.
  float edgePair(vec4 a, vec4 b) {
    float crease = a.a + b.a - 2.0 * c.a > 0.1 / ${DEPTH_RANGE.toFixed(1)} ? 2.0 : 0.0;
    return max(edge(a, false) + edge(b, true), crease);
  }

  void main() {
    c = at(0.0, 0.0);
    cNormal = unpackNormal(c);
    float hits = edgePair(at(-1.0, 0.0), at(1.0, 0.0))
               + edgePair(at(0.0, -1.0), at(0.0, 1.0))
               + edgePair(at(-1.0, -1.0), at(1.0, 1.0))
               + edgePair(at(1.0, -1.0), at(-1.0, 1.0));
    // Partial coverage on stair steps softens the lines a little.
    float ink = clamp(hits / 3.0, 0.0, 1.0);
    ink = max(ink, fract(c.b) * 4.0 * 0.6);
    gl_FragColor = vec4(0.0, 0.0, 0.0, ink);
  }`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Frame-rate independent exponential smoothing factor.
const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
// Distance from the page top, ignoring CSS transforms (e.g. the fade-up entrance animation).
function layoutTop(el: HTMLElement) {
  let y = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
  return y;
}
// Distance from the page top to the bottom of `el`, or of its `line`-th line of text (counting from 1).
function layoutBottom(el: HTMLElement, line?: number) {
  if (!line) return layoutTop(el) + el.offsetHeight;
  const style = getComputedStyle(el);
  // A unitless line-height may be reported as the bare multiplier.
  let lineHeight = parseFloat(style.lineHeight);
  if (!style.lineHeight.endsWith("px")) lineHeight *= parseFloat(style.fontSize);
  return layoutTop(el) + parseFloat(style.paddingTop) + Math.min(line * lineHeight, el.clientHeight);
}

function buildRobot() {
  // Every part gets its own id, so the ink pass outlines it wherever it meets another part.
  let nextId = 1;
  const mesh = (geometry: THREE.BufferGeometry, hatch = 0) =>
    new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: { uId: { value: nextId++ }, uHatch: { value: hatch } },
        vertexShader: PART_VERTEX,
        fragmentShader: PART_FRAGMENT,
      }),
    );

  // Smooth lathe solid from (radius, y) control points, flattened front-to-back and widened sideways.
  const lathe = (points: number[][], hatch = 0, depth = 0.6, width = 1.1) => {
    const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const m = mesh(new THREE.LatheGeometry(curve.getPoints(48), 64), hatch);
    m.scale.set(width, 1, depth);
    return m;
  };

  // Body: the pelvis and legs stay planted; the upper body (torso) turns above them at the waist.
  const body = new THREE.Group();
  const pelvis = lathe([[0.001, -2.6], [0.62, -2.5], [0.66, -2.25], [0.56, -1.98], [0.001, -1.9]]);
  body.add(pelvis);

  // Legs: graphite hip, knee and ankle joints between shells, like the arms. Toes turned out a little.
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.4, -2.55, 0);
    const hip = mesh(new THREE.SphereGeometry(0.25, 32, 24), HATCH.joint);
    const thigh = mesh(new THREE.CapsuleGeometry(0.24, 1.4, 8, 32));
    thigh.position.y = -1.0;
    const knee = mesh(new THREE.SphereGeometry(0.19, 24, 16), HATCH.joint);
    knee.position.set(0, -2.05, 0.02);
    const shin = mesh(new THREE.CapsuleGeometry(0.2, 1.45, 8, 32));
    shin.position.y = -2.98;
    const ankle = mesh(new THREE.SphereGeometry(0.13, 24, 16), HATCH.joint);
    ankle.position.y = -3.97;
    // About 15% of the robot's height, like a human foot, with the heel just behind the ankle.
    const foot = mesh(new THREE.CapsuleGeometry(0.2, 0.9, 8, 24).rotateX(Math.PI / 2));
    foot.scale.set(1.2, 0.75, 1);
    foot.position.set(0, -4.15, 0.32);
    foot.rotation.y = side * 0.12;
    leg.add(hip, thigh, knee, shin, ankle, foot);
    body.add(leg);
  }

  // Torso: chest shell (shoulders → ribcage) and graphite waist actuator, which sinks into the pelvis.
  const torso = new THREE.Group();
  const chest = lathe(
    [[0.001, -1.45], [0.62, -1.4], [0.8, -0.85], [0.88, -0.35], [0.78, 0.02], [0.4, 0.2], [0.001, 0.24]],
  );
  const waist = lathe([[0.001, -2.05], [0.5, -2.0], [0.46, -1.7], [0.52, -1.35], [0.001, -1.3]], HATCH.joint);
  const collar = mesh(new THREE.TorusGeometry(0.27, 0.05, 16, 48));
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.17;
  torso.add(chest, waist, collar);
  body.add(torso);

  // Chest core light. The chest bulges forward above it, so it tilts top-forward to sit clear of the shell.
  const core = mesh(new THREE.TorusGeometry(0.075, 0.016, 12, 40));
  core.position.set(0, -0.45, 0.54);
  core.rotation.x = 0.1;
  const coreBack = mesh(new THREE.CircleGeometry(0.07, 40), HATCH.joint);
  coreBack.position.set(0, -0.45, 0.534);
  coreBack.rotation.x = 0.1;
  torso.add(core, coreBack);

  // Shoulders and upper arms.
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 1.07, -0.2, 0);
    shoulder.rotation.z = side * 0.07;
    const joint = mesh(new THREE.SphereGeometry(0.24, 32, 24), HATCH.joint);
    const cap = mesh(new THREE.SphereGeometry(0.3, 40, 28));
    cap.scale.set(1, 0.85, 1);
    cap.position.set(side * 0.06, 0.05, 0);
    const ring = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32), HATCH.joint);
    ring.position.set(side * 0.06, -0.33, 0);
    const upperArm = mesh(new THREE.CapsuleGeometry(0.2, 0.95, 8, 32));
    upperArm.position.set(side * 0.06, -0.95, 0);
    const elbow = mesh(new THREE.SphereGeometry(0.17, 24, 16), HATCH.joint);
    elbow.position.set(side * 0.06, -1.62, 0);
    const forearm = mesh(new THREE.CapsuleGeometry(0.18, 0.9, 8, 32));
    forearm.position.set(side * 0.06, -2.25, 0.05);
    shoulder.add(joint, cap, ring, upperArm, elbow, forearm);
    torso.add(shoulder);
  }

  // Neck: graphite actuator stack. Pivot sits at the top of the torso.
  const neck = new THREE.Group();
  neck.position.y = 0.16;
  const neckCore = mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 32), HATCH.joint);
  neckCore.position.y = 0.22;
  neck.add(neckCore);
  for (const y of [0.1, 0.22, 0.34]) {
    const band = mesh(new THREE.TorusGeometry(0.185, 0.018, 10, 40));
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
  const skull = mesh(new THREE.SphereGeometry(0.5, 64, 48));
  skull.scale.copy(skullScale);
  skull.position.copy(skullCenter);

  // Visor: a band cut from a slightly larger sphere so it wraps the face. Hatched to read as dark glass.
  const visorWidth = 2.0;
  const face = mesh(
    new THREE.SphereGeometry(0.508, 64, 32, Math.PI / 2 - visorWidth / 2, visorWidth, 0.95, 0.78),
    HATCH.visor,
  );
  face.scale.copy(skullScale);
  face.position.copy(skullCenter);
  head.add(skull, face);

  // Point on the (scaled) visor surface, in head space. theta from the top, phi around Y (+Z = front).
  const onVisor = (theta: number, phi: number, r = 0.512) =>
    new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta))
      .multiply(skullScale)
      .add(skullCenter);

  const eyeGeometry = new THREE.CapsuleGeometry(0.04, 0.105, 4, 16).rotateZ(Math.PI / 2);
  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const eye = mesh(eyeGeometry);
    const p = onVisor(1.3, Math.PI / 2 + side * 0.3);
    eye.position.copy(p);
    eye.lookAt(p.clone().sub(skullCenter).multiplyScalar(2).add(skullCenter));
    eye.scale.z = 0.5;
    eyes.push(eye);
    head.add(eye);
  }

  // Ear pods with a light ring.
  for (const side of [-1, 1]) {
    const pod = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 32), HATCH.joint);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * 0.43, 0.5, 0);
    const ring = mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 32));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 0.48, 0.5, 0);
    head.add(pod, ring);
  }
  neck.add(head);

  return { body, torso, neck, head, eyes, headCenter: skullCenter };
}

// Mounts the robot into `container` and returns a cleanup function.
// Throws if WebGL is unavailable. `onReady` fires once the first frame has been drawn.
export function mountRobot(
  container: HTMLElement,
  {
    alignTop,
    alignBottom,
    alignTopOffset = 0,
    alignBottomLine,
    onReady,
  }: {
    // CSS selectors of the elements whose top / bottom edges the robot's head top / base line up with
    // (wide layout only). The robot is scaled to span exactly that range.
    alignTop?: string;
    alignBottom?: string;
    // Start the head this many CSS pixels below alignTop's top edge.
    alignTopOffset?: number;
    // Line up the base with the bottom of this line of alignBottom's text instead (counting from 1).
    alignBottomLine?: number;
    onReady: () => void;
  },
) {
  // No MSAA: the canvas only ever shows the full-screen ink pass, which antialiases its own lines.
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  // It's a background behind text: 1.5x looks almost the same as 2x with ~45% fewer pixels to shade.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  // Black ink on transparent; inverted to white ink in dark mode, like the hero's other line drawings.
  renderer.domElement.className = "absolute inset-0 h-full w-full dark:invert";
  // Clears the part buffer to "background": part id 0 at maximum depth.
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  // Nearest filtering: the ink pass compares exact per-pixel values, which must not be blended.
  const parts = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });
  const ink = new THREE.ShaderMaterial({
    uniforms: { tParts: { value: parts.texture }, uTexel: { value: new THREE.Vector2() } },
    vertexShader: INK_VERTEX,
    fragmentShader: INK_FRAGMENT,
    // Writes every pixel as-is; black with alpha is already premultiplied.
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const inkScene = new THREE.Scene();
  inkScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ink));
  const inkCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bufferSize = new THREE.Vector2();

  const { body, torso, neck, head, eyes, headCenter } = buildRobot();
  scene.add(body);
  body.updateMatrixWorld(true);
  const headTop = head.localToWorld(headCenter.clone().setY(headCenter.y + 0.5));
  const base = new THREE.Vector3(0, new THREE.Box3().setFromObject(body).min.y, 0);

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
    renderer.getDrawingBufferSize(bufferSize);
    parts.setSize(bufferSize.x, bufferSize.y);
    ink.uniforms.uTexel.value.set(1 / bufferSize.x, 1 / bufferSize.y);
    camera.aspect = w / h;
    // Fit the robot to the banner height, but keep its shoulders in view on narrow screens.
    const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const frameH = FRAME.top - FRAME.bottom;
    const dist = Math.max(frameH / (2 * halfTan), 4.4 / (2 * halfTan * camera.aspect));
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
        const targetTop = layoutTop(topEl) + alignTopOffset - layoutTop(container);
        if (bottomEl) {
          const targetBottom = layoutBottom(bottomEl, alignBottomLine) - layoutTop(container);
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

    renderer.setRenderTarget(parts);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(inkScene, inkCamera);
    if (firstFrame) {
      firstFrame = false;
      onReady();
    }
  };

  // Compile the shaders in the background (parallel compile where supported) instead of
  // stalling the main thread on the first render.
  let disposed = false;
  Promise.all([renderer.compileAsync(scene, camera), renderer.compileAsync(inkScene, inkCamera)])
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
    for (const s of [scene, inkScene]) {
      s.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
    }
    parts.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
