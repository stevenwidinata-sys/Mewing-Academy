import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSettings } from '../state/settings';

// Mewy's face as a 16x14 grid -> one cube per pixel ("voxel cat").
// Y = fur, S = shade, P = pink, K = dark, W = eye shine, . = empty.
const CAT = [
  '................',
  '..YY........YY..',
  '..YPY......YPY..',
  '...YYYYYYYYYY...',
  '...YYYYYYYYYY...',
  '..YYYYYYYYYYYY..',
  '..YYWKYYYYWKYY..',
  '..YYKKYYYYKKYY..',
  '..YYYYYPPYYYYY..',
  '..YYYYKKKKYYYY..',
  '..YYYYYYYYYYYY..',
  '...SSSSSSSSSS...',
  '...SSSSSSSSSS...',
  '................',
];
const PAL: Record<string, number> = { Y: 0xffcc00, S: 0xe0a800, P: 0xff5ca8, K: 0x1a1430, W: 0xfdf6e3 };
const RAINBOW = [0xe83b3b, 0xff8a1f, 0xffcc00, 0x3bb54a, 0x3b7be8, 0x9b4de0];

function buildCat(): THREE.Group {
  const cat = new THREE.Group();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mats: Record<string, THREE.Material> = {};
  CAT.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      mats[ch] ??= new THREE.MeshLambertMaterial({ color: PAL[ch] });
      const m = new THREE.Mesh(box, mats[ch]);
      m.position.set(x - 7.5, 6.5 - y, 0);
      cat.add(m);
    }),
  );
  // Pixel rainbow trail behind the cat
  RAINBOW.forEach((c, i) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 0.6), new THREE.MeshBasicMaterial({ color: c }));
    stripe.position.set(-14, 2.5 - i, -0.4);
    stripe.userData.wave = i;
    cat.add(stripe);
  });
  cat.scale.setScalar(0.11);
  return cat;
}

function planet(color: number, size: number, ring: boolean): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), new THREE.MeshLambertMaterial({ color, flatShading: true })));
  if (ring) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(size * 1.6, size * 0.12, 4, 24), new THREE.MeshBasicMaterial({ color: 0x27e0d8 }));
    r.rotation.x = Math.PI / 2.4;
    g.add(r);
  }
  return g;
}

/** Three.js scene behind the Home hero: a voxel Mewy flying past planets. */
export default function HeroScene() {
  const { settings } = useSettings();
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // No WebGL: the CSS hero still looks fine.
    }
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 5, 6);
    scene.add(sun);

    const cat = buildCat();
    scene.add(cat);
    const planets = [planet(0xff5ca8, 0.9, true), planet(0x3bb54a, 0.55, false), planet(0x9b4de0, 0.4, true), planet(0x27e0d8, 0.35, false)];
    const spots = [[-4.2, 1.6, -2], [4.3, -1.4, -1], [3.2, 2.2, -4], [-3.4, -1.9, -3]];
    planets.forEach((p, i) => {
      p.position.set(spots[i][0], spots[i][1], spots[i][2]);
      scene.add(p);
    });
    // Twinkling pixel stars
    const starGeo = new THREE.BufferGeometry();
    const pts = new Float32Array(300);
    for (let i = 0; i < pts.length; i += 3) {
      pts[i] = (Math.random() - 0.5) * 24;
      pts[i + 1] = (Math.random() - 0.5) * 12;
      pts[i + 2] = -4 - Math.random() * 8;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfdf6e3, size: 0.09 }));
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
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      // Cat loops across the hero, bobbing and tilting like it is flying.
      const loop = (t % 14) / 14;
      cat.position.set(-7 + loop * 14, Math.sin(t * 2) * 0.5 + 0.3, 1);
      cat.rotation.set(Math.sin(t * 1.3) * 0.15, -0.35 + mouse.x * 0.6, Math.sin(t * 2) * 0.12);
      cat.children.forEach((c) => {
        if (c.userData.wave !== undefined) c.position.y = 2.5 - c.userData.wave + Math.sign(Math.sin(t * 12 + c.userData.wave)) * 0.25;
      });
      planets.forEach((p, i) => {
        p.rotation.y = t * (0.3 + i * 0.15);
        p.position.y = spots[i][1] + Math.sin(t + i) * 0.2;
      });
      stars.rotation.z = t * 0.01;
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 1 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      if (!settings.reduceMotion) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    };
  }, [settings.reduceMotion]);

  if (settings.highContrast) return null;
  return <canvas ref={ref} className="hero-scene" aria-hidden="true" />;
}
