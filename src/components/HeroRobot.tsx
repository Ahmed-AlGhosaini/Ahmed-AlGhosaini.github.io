"use client";

// Interactive hero: a 3D humanoid that walks/runs toward the mouse cursor.
// Model: RobotExpressive by Tomás Laulhé (Quaternius), CC0 — see public/models/README.md.

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_URL = "/models/RobotExpressive.glb";
const ROBOT_HEIGHT = 2.2;
// Walkable depth range (world units). Sideways range follows the camera view.
const BOUNDS = { minZ: -3, maxZ: 2.5 };
const EDGE = 0.88; // keep the target within this fraction of the banner width
const CAMERA_Z = 9.5;
const WALK_SPEED = 1.6;
const RUN_SPEED = 3.6;
const RUN_DISTANCE = 3.5;
const ARRIVE_DISTANCE = 0.2;
const TURN_RATE = 8; // rad/s-ish smoothing

type State = "Idle" | "Walking" | "Running";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Shortest signed angle from a to b.
function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

export default function HeroRobot({ fallback }: { fallback: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — show the static fallback.
      queueMicrotask(() => setStatus("error"));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
    camera.position.set(0, 3, CAMERA_Z);
    camera.rotation.x = -0.2;

    // Fade the floor grid into the background toward the horizon.
    scene.fog = new THREE.Fog(0xf3f4fa, 10, 24);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd6d3d1, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(4, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
    scene.add(sun);

    // Floor: soft shadow catcher + faint grid, matching the site's light style.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(60, 60, 0xd6d3d1, 0xe7e5e4);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.7;
    scene.add(grid);

    // Cursor target marker on the floor.
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.3, 40),
      new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0 }),
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.01;
    scene.add(marker);

    const target = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    // Screen-space (NDC) y of the back and front edges of the walkable floor; set in resize().
    const depthNdc = { back: 0, front: 0 };

    // Map the cursor (anywhere on the page) to a visible point on the floor.
    // Clamping in screen space first means the robot ends up right under the cursor
    // inside the banner, and at the nearest edge when the cursor is outside it.
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      ndc.set(
        clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -EDGE, EDGE),
        clamp(-((e.clientY - rect.top) / rect.height) * 2 + 1, depthNdc.front, depthNdc.back),
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        target.set(hit.x, 0, clamp(hit.z, BOUNDS.minZ, BOUNDS.maxZ));
      }
    };
    window.addEventListener("pointermove", onPointerMove);

    let robot: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const actions: Record<string, THREE.AnimationAction> = {};
    let state: State = "Idle";
    let emoting = false;

    const fadeTo = (name: string, duration = 0.3) => {
      const next = actions[name];
      if (!next) return;
      Object.values(actions).forEach((a) => a !== next && a.isRunning() && a.fadeOut(duration));
      next.reset().setEffectiveWeight(1).fadeIn(duration).play();
    };

    const onClick = () => {
      if (!mixer || emoting || !actions.Wave) return;
      emoting = true;
      fadeTo("Wave", 0.2);
    };
    container.addEventListener("click", onClick);

    let disposed = false;
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        robot = gltf.scene;
        robot.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) o.castShadow = true;
        });
        const size = new THREE.Box3().setFromObject(robot).getSize(new THREE.Vector3());
        robot.scale.setScalar(ROBOT_HEIGHT / size.y);
        scene.add(robot);

        mixer = new THREE.AnimationMixer(robot);
        for (const clip of gltf.animations) {
          const action = mixer.clipAction(clip);
          if (["Wave", "Jump", "Yes", "ThumbsUp"].includes(clip.name)) {
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
          }
          actions[clip.name] = action;
        }
        mixer.addEventListener("finished", () => {
          emoting = false;
          fadeTo(state, 0.3);
        });
        fadeTo("Idle", 0);
        setStatus("ready");
      },
      undefined,
      () => !disposed && setStatus("error"),
    );

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Pull the camera back on narrow screens so the robot isn't cramped.
      camera.position.z = CAMERA_Z * Math.max(1, 2 / camera.aspect) ** 0.6;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      depthNdc.back = new THREE.Vector3(0, 0, BOUNDS.minZ).project(camera).y;
      depthNdc.front = Math.max(-0.9, new THREE.Vector3(0, 0, BOUNDS.maxZ).project(camera).y);
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

    const clock = new THREE.Clock();
    const toTarget = new THREE.Vector3();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;

      if (robot && mixer) {
        toTarget.subVectors(target, robot.position).setY(0);
        const dist = toTarget.length();
        const nextState: State = emoting
          ? state
          : dist < ARRIVE_DISTANCE
            ? "Idle"
            : dist > RUN_DISTANCE || (state === "Running" && dist > 1)
              ? "Running"
              : "Walking";
        if (nextState !== state) {
          state = nextState;
          if (!emoting) fadeTo(state);
        }

        if (state !== "Idle" && !emoting) {
          const desiredYaw = Math.atan2(toTarget.x, toTarget.z);
          const turn = angleDelta(robot.rotation.y, desiredYaw);
          robot.rotation.y += turn * Math.min(1, TURN_RATE * dt);
          // Slow down while turning sharply so it doesn't moonwalk.
          const facing = Math.max(0, Math.cos(turn));
          const speed = (state === "Running" ? RUN_SPEED : WALK_SPEED) * facing;
          robot.position.addScaledVector(toTarget.normalize(), Math.min(dist, speed * dt));
        } else if (state === "Idle") {
          // Settle back to facing the visitor.
          robot.rotation.y += angleDelta(robot.rotation.y, 0) * Math.min(1, 2 * dt);
        }
        mixer.update(dt);
      }

      const markerMat = marker.material as THREE.MeshBasicMaterial;
      marker.position.lerp(target, 0.3);
      markerMat.opacity += ((state === "Idle" ? 0 : 0.6) - markerMat.opacity) * Math.min(1, 6 * dt);

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("click", onClick);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        mats.forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  if (status === "error") return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/9] w-full cursor-pointer touch-pan-y bg-gradient-to-br from-stone-50 to-indigo-50 sm:aspect-[16/8]"
      aria-label="Interactive 3D robot that walks toward your cursor. Click to make it wave."
      role="img"
    >
      <div className="pointer-events-none absolute left-5 top-4 z-10 font-mono text-xs text-muted sm:left-8 sm:top-6 sm:text-sm">
        <p>policy: follow-cursor · 60 Hz</p>
        <p className="hidden sm:block">move your mouse — click to say hi</p>
      </div>
      {status === "loading" && (
        <p className="absolute inset-0 grid place-items-center font-mono text-sm text-muted">booting robot…</p>
      )}
    </div>
  );
}
