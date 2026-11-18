# AGENTS.md — roomforone implementation rules

These instructions apply to every agent working in this repository.

## Product boundary

This repository is only for **roomforone**. Do not import requirements, components, storage keys, assets, credentials or deployment settings from unrelated projects.

roomforone is a quiet, interactive 3D personal space. The current approved direction is an incremental implementation inspired by the spatial storytelling and interaction language of Henry Heffernan, expressed through roomforone's own design system. Do not copy Henry's source code, assets or branding.

## Non-negotiable product requirements

- The room is an **open architectural set**. Do not add enclosing walls, a ceiling, or a human character.
- Do not create or reintroduce people, avatars, character models, character animation, daily character routines or character state machines.
- The large window belongs on the **right side** of the scene. Preserve a clear view through it.
- Keep the scene full-viewport and spatially composed. Avoid default sidebars, card dashboards, unnecessary navigation bars and dense text overlays.
- Use simple low-poly geometry, matte paper/cardboard/wood/fabric/plastic materials, restrained detail, soft directional light, contact shadows and carefully controlled contrast. Do not use photorealistic rendering or a full-screen pixelation filter.
- The scene, desk objects, window, outdoor environment and UI must share one coherent visual language.
- Visible product UI must be English.
- City selection is visitor-controlled. Never request precise location automatically.
- Local time must use the selected city's IANA time zone. Time of day and weather are separate inputs: morning, midday, golden hour and night are driven by local time; clear, cloudy, rain, snow and wind are weather conditions.
- Live weather and local time must affect the 3D sky, light, weather particles and room atmosphere. Keep graceful fallbacks when external weather services are unavailable.
- Do not add a person to make the room feel alive. The environment itself, light, weather and object interactions provide the experience.

## Computer desktop

The computer is the primary software entrance. It should use a camera approach transition and open a coherent desktop environment with exactly these four core apps:

1. **Notes** — editable and automatically saved.
2. **Music** — four independent tracks (rain, wind, birds, original generated lo-fi), per-track play/pause and volume, master volume and mute.
3. **Infinite Canvas** — drawing, pan, zoom, export and draggable sticky notes.
4. **Movie Book** — add, review and remove film records with an optional year and personal note.

Do not replace these apps with a portfolio, project showcase, Bento dashboard or unrelated productivity suite. Each app must perform its stated action; visual placeholders are not accepted.

## Physical object interactions

- Tangle: selecting it moves the camera closer; links can be dragged and deformed while preserving link constraints.
- AirPods Max: controls the shared room audio engine.
- Switch controller: each visible control responds with pressed feedback. Do not launch the retired leaf-catching game.
- Window and desk lamp: remain directly interactive and visibly change the scene.
- Every interaction must support pointer and touch where applicable, with keyboard focus and visible focus styles for standard controls.

## Engineering rules

- Preserve the current Vite + React + TypeScript + Three.js architecture. Add a dependency only when it solves a concrete need.
- Reuse the existing Three.js scene, camera, raycaster, audio engine and storage services. Do not create parallel engines for the same feature.
- Preserve the existing storage identities:
  - localStorage: `roomforone-state-v1`
  - IndexedDB: `roomforone-local-v1`
  - existing drawing store: `roomforone_drawings`
- Extend and normalize data safely. Do not clear, rename or replace existing storage, and do not discard unknown fields when saving.
- Audio must remain muted after reload and must only start after a direct visitor action.
- Clean up animation frames, event listeners, pointer captures, observers and timers when components unmount.
- Respect `prefers-reduced-motion`. Do not make core interactions depend on animation.
- Avoid unverified external image URLs. Prefer procedural geometry and assets that are actually present in the repository.
- Keep the project installable from the lockfile. Do not add local-only dependencies or secrets.

## Required workflow

Before changing code:
1. Inspect the current branch, package scripts, source structure and relevant components.
2. Identify the actual cause of a problem before changing code.
3. Keep changes incremental and confined to roomforone.

After changing code:
1. Run `npm ci --include=optional`.
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Run `npm run build`.
5. Start a local Vite preview and verify the desktop and mobile layouts, object interactions, computer app flows, persistence, city selection, live weather fallback and audio activation.
6. Report exactly what was tested and what remains unverified. Never claim a build, browser test or deployment succeeded unless it actually did.

## Deployment and Git boundaries

- This task is local development and review only.
- Do not run CloudBase, hosting, CDN, domain or production deployment commands.
- Do not publish a preview to a public hosting service.
- Do not merge this branch into `main` or `master`.
- Never use force-push, destructive reset or commands that overwrite user data.
- Never commit secrets, tokens, private keys or `.env.local`.
