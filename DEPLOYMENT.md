# roomforone deployment handoff

This repository builds a static Vite site and is already scoped to the dedicated CloudBase environment configured in `cloudbaserc.json`.

## Local verification

```bash
npm ci --include=optional
npm run build
npm run preview -- --host 127.0.0.1
```

The production output is `dist/`. The build does not require private credentials. Open-Meteo weather requests are made from the browser and gracefully fall back to the last successful snapshot or the demo state when a request fails.

## CloudBase deployment

Use the project root as the deployment root. The existing configuration declares:

- Environment: `applicable-butterfly-d9ac7eb21be`
- Region: `ap-shanghai`
- Install: `npm ci --include=optional`
- Build: `npm run build`
- Output: `dist`
- Deploy path: `/`

Before a real release, run the CloudBase CLI checks required by the repository policy:

```bash
tcb validate
tcb deploy --dry-run
```

Confirm that the dry run only targets `applicable-butterfly-d9ac7eb21be` and `/`. After that review, a maintainer can run:

```bash
tcb deploy
```

Do not add `.env.local` or any private key to Git. `.env.example` contains only public configuration names.

## Product behavior in this build

The site opens with a city picker. A selected city is persisted under the existing `roomforone-state-v1` key. Current weather is read from Open-Meteo, local time uses the city IANA timezone, and manual weather presets remain available from the top bar. The physical room is an open low-poly scene with a right-side 3D window. Clicking the computer enters a separate modern desktop OS layer with Projects, Photos, About Me, Experience, Journey, Contact, and Archive windows. Existing drawing, game, DIY, atmosphere, mood, audio, and local persistence modules remain in place.

The portfolio copy intentionally contains marked placeholder sections where private personal material has not been supplied yet.
