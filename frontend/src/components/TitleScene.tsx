import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/** Striped synthwave sun drawn into a texture. */
function sunTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#ffe14d');
  grad.addColorStop(0.5, '#ff8a3d');
  grad.addColorStop(1, '#ff3d9a');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(128, 128, 126, 0, Math.PI * 2);
  g.fill();
  // Horizontal gaps that get thicker toward the bottom
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) {
    const y = 140 + i * 17;
    g.fillRect(0, y, 256, 2 + i * 1.4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Props {
  /** 1 = idle, higher when hovering Start. */
  speed: number;
  warp: boolean;
}

export default function TitleScene({ speed, warp }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const live = useRef({ speed, warp });
  useEffect(() => {
    live.current = { speed, warp };
  }, [speed, warp]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return; // CSS fallback grid stays visible
    }
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2a0d5e, 18, 46);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 1.6, 8);
    camera.lookAt(0, 1.6, 0);

    const sun = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: sunTexture(), transparent: true, fog: false }));
    sun.position.set(0, 4.2, -40);
    scene.add(sun);

    // Low-poly purple mountains on the horizon
    const mountains = new THREE.Group();
    for (let i = -6; i <= 6; i++) {
      const h = 2 + ((i * 7919) % 5 + 5) % 5;
      const m = new THREE.Mesh(new THREE.ConeGeometry(3.4, h, 4), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x3a1470 : 0x2a0d5e, fog: false }));
      m.position.set(i * 4.6, h / 2 - 0.2, -34 - Math.abs(i));
      m.rotation.y = Math.PI / 4;
      mountains.add(m);
    }
    scene.add(mountains);

    // Neon grid floor that scrolls toward the camera
    const CELL = 2;
    const grid = new THREE.GridHelper(120, 60, 0xff5ca8, 0x27e0d8);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.75;
    scene.add(grid);

    // Stars: drift slowly, then rush at the camera during warp
    const COUNT = 600;
    const pos = new Float32Array(COUNT * 3);
    const resetStar = (i: number, far = true) => {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = 2 + Math.random() * 24;
      pos[i * 3 + 2] = far ? -60 - Math.random() * 40 : -Math.random() * 100;
    };
    for (let i = 0; i < COUNT; i++) resetStar(i, false);
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfdf6e3, size: 0.12, fog: false });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove);
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let prev = performance.now();
    let warpT = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const { speed: s, warp: w } = live.current;
      warpT = w ? Math.min(1, warpT + dt * 1.4) : 0;
      const v = (2 * s + warpT * 90) * dt;
      grid.position.z = (grid.position.z + v) % CELL;
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 2] += v * (0.3 + warpT * 2);
        if (pos[i * 3 + 2] > camera.position.z) resetStar(i);
      }
      starGeo.attributes.position.needsUpdate = true;
      starMat.size = 0.12 + warpT * 0.5;
      camera.fov = 60 + warpT * 50;
      camera.updateProjectionMatrix();
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.04;
      camera.position.y += (1.6 - mouse.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 1.6, -10);
      sun.scale.setScalar(1 + Math.sin(now / 900) * 0.015);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: THREE.Material & { map?: THREE.Texture | null }) => {
            m.map?.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="title-scene" aria-hidden="true" />;
}
