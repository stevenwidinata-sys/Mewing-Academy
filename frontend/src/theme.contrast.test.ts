/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Reads the real theme variables from index.css and checks WCAG contrast for
// every text/background pair the UI uses, in every theme (+ high contrast).
const css = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');

function block(selector: string): Record<string, string> {
  const i = css.indexOf(`${selector} {`);
  if (i < 0) throw new Error(`missing ${selector}`);
  const body = css.slice(i, css.indexOf('}', i));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

type RGBA = [number, number, number, number];

function resolve(vars: Record<string, string>, v: string | undefined, depth = 0): string {
  if (depth > 8) throw new Error(`var loop: ${v}`);
  return (v ?? '').replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolve(vars, vars[name], depth + 1));
}

function colors(value: string): RGBA[] {
  const out: RGBA[] = [];
  for (const m of value.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(([^)]+)\)/gi)) {
    if (m[1]) {
      const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
      out.push([parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]);
    } else {
      const p = m[2].split(',').map((s) => parseFloat(s));
      out.push([p[0], p[1], p[2], p[3] ?? 1]);
    }
  }
  return out;
}

const over = (top: RGBA, under: RGBA): RGBA => {
  const a = top[3];
  return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
};

function lum([r, g, b]: RGBA): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: RGBA, b: RGBA): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const BASE = block(':root');
const THEMES: Record<string, Record<string, string>> = {
  purple: BASE,
  sky: { ...BASE, ...block(":root[data-theme='sky']") },
  mint: { ...BASE, ...block(":root[data-theme='mint']") },
  sunset: { ...BASE, ...block(":root[data-theme='sunset']") },
};
const HC = block(":root[data-contrast='high']");
for (const [name, vars] of Object.entries({ ...THEMES })) THEMES[`${name}+high-contrast`] = { ...vars, ...HC };

const NORMAL = 4.5; // body text
const LARGE = 3; // big pixel headings

/** All solid colors a background token can show (gradient stops, translucent layers composited onto the page). */
function backgrounds(vars: Record<string, string>, token: string): RGBA[] {
  const page = [...colors(resolve(vars, vars['--bg'])), ...colors(resolve(vars, vars['--bg-2']))];
  return colors(resolve(vars, vars[token])).flatMap((c) => (c[3] < 1 ? page.map((p) => over(c, p)) : [c]));
}

const PAIRS: [fg: string, bg: string, min: number][] = [
  ['--text', '--bg', NORMAL],
  ['--text', '--bg-2', NORMAL],
  ['--text', '--surface', NORMAL],
  ['--text', '--panel', NORMAL],
  ['--text', '--panel-light', NORMAL],
  ['--text', '--panel-glow', NORMAL],
  ['--text', '--grad-hero', NORMAL],
  ['--white', '--panel-light', NORMAL], // ghost buttons
  ['--accent', '--surface', LARGE], // section headings
  ['--accent', '--panel-glow', LARGE], // card headings
  ['--accent', '--grad-hero', LARGE], // page banners and hero title
  ['--ink', '--yellow', NORMAL], // main buttons
  ['--ink', '--cyan', NORMAL], // secondary buttons
];

describe('theme contrast (WCAG)', () => {
  for (const [theme, vars] of Object.entries(THEMES)) {
    it(`${theme}: all text is readable`, () => {
      const fails: string[] = [];
      for (const [fg, bg, min] of PAIRS) {
        const f = colors(resolve(vars, vars[fg]))[0];
        const bgs = backgrounds(vars, bg);
        if (!f || !bgs.length) {
          fails.push(`${fg} on ${bg}: token missing`);
          continue;
        }
        for (const b of bgs) {
          const r = ratio(f, b);
          if (r < min) fails.push(`${fg} on ${bg}: ${r.toFixed(2)} < ${min}`);
        }
      }
      expect(fails).toEqual([]);
    });
  }

  it('title screen keeps its own readable colors in every theme', () => {
    const t = block('.title-screen');
    const vars = { ...BASE, ...t };
    const bgs = colors(resolve(vars, t['--title-bg']));
    expect(bgs.length).toBeGreaterThan(0);
    for (const fg of ['--text', '--title-dim']) {
      const f = colors(resolve(vars, t[fg]))[0];
      expect(f, fg).toBeDefined();
      for (const b of bgs) expect(ratio(f, b), fg).toBeGreaterThanOrEqual(NORMAL);
    }
  });
});
