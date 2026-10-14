// Runs the backend API and the frontend dev server together, with prefixed,
// colored logs. No extra dependency: just Node's child_process.
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// With shell:true the shell resolves `npm` to npm.cmd on Windows; passing
// npm.cmd here would double-wrap and fail to spawn.
const npm = 'npm';

const procs = [
  { name: 'api', color: '\x1b[36m', cwd: join(root, 'backend'), args: ['run', 'dev'] },
  { name: 'web', color: '\x1b[35m', cwd: join(root, 'frontend'), args: ['run', 'dev'] },
];

const children = procs.map(({ name, color, cwd, args }) => {
  const child = spawn(npm, args, { cwd, shell: true });
  const tag = `${color}[${name}]\x1b[0m `;
  const pipe = (stream) => {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) process.stdout.write(tag + line + '\n');
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);
  return child;
});

const shutdown = () => {
  for (const c of children) c.kill();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Mewing Academy running:');
console.log('  Web  -> http://localhost:5173');
console.log('  API  -> http://127.0.0.1:4000');
console.log('Press Ctrl+C to stop.\n');
