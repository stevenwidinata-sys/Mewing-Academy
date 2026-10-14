// Copies MediaPipe WASM from node_modules and downloads the two models once,
// so hand/face tracking runs fully on-device (no CDN at runtime).
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const wasmSrc = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const wasmDst = join(pub, 'wasm');
if (!existsSync(join(wasmDst, 'vision_wasm_internal.wasm'))) {
  cpSync(wasmSrc, wasmDst, { recursive: true });
  console.log('[vision] copied wasm');
}

const models = {
  'hand_landmarker.task':
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  'face_landmarker.task':
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
};
mkdirSync(join(pub, 'models'), { recursive: true });
for (const [name, url] of Object.entries(models)) {
  const dst = join(pub, 'models', name);
  if (existsSync(dst)) continue;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
    console.log(`[vision] downloaded ${name}`);
  } catch (err) {
    // Not fatal: the app still works with tap/keyboard answers.
    console.warn(`[vision] could not download ${name}: ${err.message}`);
  }
}
