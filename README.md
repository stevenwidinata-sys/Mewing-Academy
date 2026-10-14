# 🐱 Mewing Academy

An accessible, AI-powered learning playground for kids under 10. Answer quiz
questions **with your hands** using on-device camera AI — raise a finger to pick
A, B, C or D — play memory games, and chat with **Mewy**, a friendly tutor.
Retro 8-bit arcade look, primary color yellow, English + Bahasa Indonesia.

> Our mission: make learning accessible, inclusive, and effective for everyone,
> regardless of background, abilities, or learning needs.

## Quick start

Requires Node 20+.

```bash
# install both apps (also downloads the on-device AI models, ~11 MB)
npm run setup

# run the frontend + backend together
npm run dev
```

Then open **http://localhost:5173**.

- Web (frontend): http://localhost:5173
- API (backend): http://127.0.0.1:4000

Other scripts:

```bash
npm run build   # production build of the frontend
npm test        # frontend + backend + shared-logic tests
npm run lint    # frontend lint
```

> First run downloads two MediaPipe models into `frontend/public/models`. If you
> are offline, the camera features are disabled but every game still works by
> tapping answers or using the number keys 1–4.

## How you play

- **Hand Quiz** — a question appears; raise **one finger** to answer:
  index = A, middle = B, ring = C, little finger = D. Hold steady until the bar
  fills. (Grown-ups can switch to "count fingers: 1=A, 2=B…" in Settings.)
- **Memory** — look at a scene (e.g. apples), then answer *how many* and *what
  color* from memory.
- **Ask Mewy** — type a question; Mewy answers facts and solves simple maths.
- Everything also works with **mouse/tap** and **keyboard** (1–4 or A–D).

## The AI

Three AI capabilities, all running **on-device in the browser** — no video,
image, or voice ever leaves the computer:

| Capability | Technique | Where |
|---|---|---|
| Finger answers | **MediaPipe HandLandmarker** (21-point hand landmarks) → geometric finger classifier | `frontend/src/vision/` |
| Posture nudge | **MediaPipe FaceLandmarker** (face mesh) → simple centering / chin heuristic | `frontend/src/vision/posture.ts` |
| Tutor "Mewy" | Rule-based NLP: normalize → tokenize → fuzzy keyword match (Levenshtein) → intent, plus an arithmetic solver | `shared/tutor.ts` |

The tutor is deterministic and kid-safe by design (every answer is pre-written,
and it refuses to discuss personal info). Its `TutorReply` shape leaves room to
swap in a real LLM later without changing the UI.

## Architecture

```
Mewing-Academy/
├── shared/            # Framework-free TypeScript shared by web + API
│   ├── types.ts       #   data model + bilingual {en,id} text
│   ├── questions.ts   #   question generators (6 topics × 3 levels)
│   ├── memory.ts      #   memory-game round generator
│   └── tutor.ts       #   tutor NLP + math solver
├── backend/           # Express 5 API (TypeScript, run via tsx)
│   └── src/app.ts     #   /api/questions, /api/memory, /api/tutor, /api/health
└── frontend/          # React 19 + Vite + TypeScript
    ├── src/vision/    #   MediaPipe hooks + pure finger classifier (unit tested)
    ├── src/components/#   Layout, CameraStage, ChoiceGrid, Sprite, Mewy mascot
    ├── src/pages/     #   Home, Lessons, Quiz, Memory, Tutor, Progress, HowAI, About, Settings
    └── src/state/     #   settings (a11y + language) and progress stores
```

The frontend works fully offline: `frontend/src/lib/api.ts` calls the backend
but **falls back to the same `shared/` generators** in the browser if the API is
down. The backend exists so the project is a real client/server application and
so question/content logic can grow server-side later.

## Accessibility

Built in from the start (Settings page):

- Language toggle **English / Bahasa Indonesia**
- **High-contrast** black/yellow theme
- **Calm mode** — turns off all motion (also respects OS "reduce motion")
- **Easy-to-read font** (Atkinson Hyperlegible) replacing the pixel font
- **Adjustable text size** (3 steps)
- Full **keyboard** play, visible focus rings, skip-to-content link, ARIA labels
  and live regions, and SVG shapes labeled by color + name (not color alone)
- Sounds can be turned off

## Tech notes

- No tracking, no accounts, no network calls except the one-time model download.
- Progress (stars/streak) is stored locally in the browser only.
- Fonts and AI model assets are bundled/served locally, not from a CDN.

## Project context (coursework)

This project is built against three criteria:

1. **Communicating the proposed AI technique for a problem in a professional
   context** — see the in-app **"How AI Works"** page and the AI table above.
2. **Working together as a group** — the memory game ("how many apples / what
   color") came from a teammate request; the shared module keeps game logic in
   one place for parallel work.
3. **Software application design using an AI approach** — a shared-core
   client/server design where the same TypeScript logic powers both the API and
   an offline browser fallback, with the vision classifier isolated and unit
   tested.

## Tests

- `frontend` — pure finger classifier (point & count modes, edge cases)
- `backend` — API responses, input validation, and shared question/memory/tutor
  logic (valid answer indices, no negative subtraction, bilingual prompts,
  privacy guard, arithmetic in both languages)
