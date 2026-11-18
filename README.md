# roomforone

*A little space to slow down.*

roomforone is a quiet, interactive 3D space shaped by the visitor's city, local time and live weather. It is designed as an open architectural set: no enclosing walls, no ceiling and no human character. A large window sits on the right, bringing changing daylight and weather into a small, carefully composed desk environment.

The visual direction takes cues from Henry Heffernan's spatial storytelling and restrained interaction language, translated into roomforone's own low-poly materials, warm natural light and tactile objects. It does not reuse Henry's source code or assets.

## Experience

- **Open 3D environment** — a full-viewport Three.js scene with a right-side window, a desk, soft matte materials, natural shadows and a restrained object layout.
- **City and local time** — visitors choose a city. The clock and daylight use that city's IANA time zone rather than the visitor's device time zone.
- **Live weather** — Open-Meteo geocoding and forecast data drive the outdoor sky, rain/snow particles, light colour and room atmosphere. Manual weather previews remain available.
- **Tangle** — select the object to move the camera closer, then drag its links to reshape the connected form. Link lengths remain constrained.
- **AirPods Max / room sound** — one shared Web Audio engine controls four independent procedural tracks: rain, wind, birds and original generated lo-fi tones. Playback starts only after an explicit user action.
- **Switch controller** — a tactile controller panel with independently pressable controls and visual feedback. It does not launch the retired leaf-catching game.
- **Computer desktop** — the computer opens through a camera approach and contains four working applications:
  - **Notes** — automatically saved on this device.
  - **Music** — independent track levels, play/pause and master volume using the existing audio engine.
  - **Infinite Canvas** — drawing, pan, zoom, export and draggable sticky notes.
  - **Movie Book** — add, review and remove film entries with an optional year and personal note.

All visible product UI is in English. The room contains no person, avatar or character behaviour system.

## Technology

| Area | Implementation |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 with a small roomforone-specific CSS layer |
| 3D | Three.js, WebGLRenderer with SVGRenderer fallback |
| Animation | requestAnimationFrame and native CSS transitions |
| Weather and city search | Open-Meteo Geocoding and Forecast APIs |
| Audio | Web Audio API, shared procedural audio engine |
| Room state | localStorage: `roomforone-state-v1` |
| Drawings | IndexedDB: `roomforone-local-v1`, store `roomforone_drawings` |

No account or server is required for the current local experience. City and weather requests are made to Open-Meteo; room notes, movie entries, object positions and canvas notes remain in the browser.

## Project structure

```
roomforone/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Room3D.tsx
│   │   ├── TopBar.tsx
│   │   ├── CityPicker.tsx
│   │   ├── ComputerModal.tsx
│   │   ├── InfiniteCanvasModal.tsx
│   │   ├── DrawingModal.tsx
│   │   ├── SwitchPanel.tsx
│   │   ├── HeadphonesModal.tsx
│   │   └── AtmosphereModal.tsx
│   ├── room/
│   │   └── constraints.ts
│   ├── services/
│   │   ├── weatherService.ts
│   │   ├── audioEngine.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── core.test.ts
│   ├── run.mjs
│   └── viewport.html
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.js
```

## Local development

Use Node.js 22 or a compatible current LTS release.

```bash
npm ci --include=optional
npm run dev
```

Vite prints a local address, normally `http://localhost:5173`.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

The GitHub Actions workflow on `feature/roomforone-henry-incremental` runs the same typecheck, core tests and production build, then retains the `dist/` artifact briefly for review. It does not publish or deploy the site.

## Data and compatibility

The existing storage identities are intentionally retained:

- `roomforone-state-v1` stores room preferences, object poses, Notes text, Movie Book entries and Infinite Canvas sticky notes.
- `roomforone-local-v1` stores the drawing draft. Infinite Canvas reuses the existing drawing store instead of creating a second drawing database.

New fields are normalized with bounded values and defaults. Existing room state is merged rather than cleared. Audio remains muted after a page reload until the visitor explicitly enables it.

## Current scope

This branch is an incremental roomforone implementation branch. The current task is local development and browser review only. No CloudBase upload, production deployment, domain change or merge into the default branch is part of this work.
