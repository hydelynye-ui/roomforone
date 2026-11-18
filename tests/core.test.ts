import { test } from 'node:test';
import assert from 'node:assert/strict';
import { constrainPose, deformTangle, initialTangle, INITIAL_POSES, TANGLE_LENGTHS, RADII } from '../src/room/constraints';
import { DEFAULT_ROOM_STATE, normalizeRoomState, loadRoomState, saveRoomState } from '../src/services/storage';
import { analyzeMood } from '../src/services/aiMoodService';
import type { ObjectId } from '../src/types';

const cache = new Map<string, string>();
(globalThis as any).localStorage = { getItem: (k: string) => cache.get(k) || null, setItem: (k: string, v: string) => cache.set(k, v) };

test('existing state is migrated without changing storage identity or removing unknown data', () => {
  cache.clear(); cache.set('roomforone-state-v1', JSON.stringify({ weather: 'rain', stickyNote: '我的便签', customExistingValue: { keep: true }, volumeWeather: 0.3 }));
  const loaded = loadRoomState(); assert.equal(loaded.weather, 'rain'); assert.equal(loaded.stickyNote, '我的便签');
  assert.equal(loaded.masterMute, true); assert.equal(loaded.tangleNodes.length, 12);
  saveRoomState({ objectPoses: loaded.objectPoses });
  assert.deepEqual(JSON.parse(cache.get('roomforone-state-v1')!).customExistingValue, { keep: true });
  assert.equal(cache.size, 1);
});
test('malformed values do not become scene positions or audio gains', () => {
  const result = normalizeRoomState({ weather: 'invalid', masterVolume: Infinity, audioTracks: { rain: -50, birds: 8 }, objectPoses: { headphones: { position: [Infinity, -90, 3000], rotation: NaN } }, tangleNodes: [[0, 0]] });
  assert.equal(result.weather, 'sunny'); assert.equal(result.masterVolume, 0.7);
  assert.equal(result.audioTracks.rain, 0); assert.equal(result.audioTracks.birds, 1);
  assert.equal(result.objectPoses.headphones!.position[1], INITIAL_POSES.headphones.position[1]);
  assert.equal(result.tangleNodes.length, 12);
});
test('deleting migrated notes stays empty on reload, while legacy data is preserved', () => {
  cache.clear(); cache.set('roomforone-tangle-notes-v1', JSON.stringify([{ id: 'old', text: '保留旧便签', createdAt: 1 }]));
  assert.equal(loadRoomState().tangleNotes.length, 1);
  saveRoomState({ tangleNotes: [] }); assert.equal(loadRoomState().tangleNotes.length, 0);
  assert.ok(cache.get('roomforone-tangle-notes-v1'));
});
test('all desk objects remain on their support surface and inside room bounds', () => {
  for (const id of Object.keys(INITIAL_POSES) as ObjectId[]) {
    for (const v of [-100, 100, 0]) {
      const result = constrainPose(id, { position: [v, v, v], rotation: v }, INITIAL_POSES);
      assert.equal(result.position[1], INITIAL_POSES[id].position[1]);
      assert.ok(result.position[0] >= -2.6 && result.position[0] <= 2.35);
      assert.ok(result.position[2] >= -2.72 && result.position[2] <= 1.65);
      assert.ok(Math.abs(result.rotation) <= Math.PI);
    }
  }
});
test('Tangle dragging changes shape and preserves every link length over repeated drags', () => {
  let nodes = initialTangle();
  for (let step = 0; step < 120; step++) {
    nodes = deformTangle(nodes, step % nodes.length, [Math.sin(step) * 0.4, 0.03, Math.cos(step) * 0.25]);
    for (let i = 0; i < nodes.length - 1; i++) {
      const length = Math.hypot(...nodes[i].map((v, axis) => v - nodes[i + 1][axis]));
      assert.ok(Math.abs(length - TANGLE_LENGTHS[i]) < 1e-9);
    }
    assert.ok(nodes.every(p => p[1] >= -0.016 && p[1] <= 0.181));
  }
  assert.notDeepEqual(nodes, initialTangle());
  cache.clear(); saveRoomState({ tangleNodes: nodes }); assert.deepEqual(loadRoomState().tangleNodes, nodes);
});
test('four independent mix values and poses survive refresh; playback stays locked', () => {
  cache.clear(); saveRoomState({ ...DEFAULT_ROOM_STATE, masterMute: false, audioTracks: { rain: .12, wind: .34, birds: .56, lofi: .78 }, objectPoses: { ...INITIAL_POSES, game: { position: [1, 1.29, -1.4], rotation: .4 } } });
  const state = loadRoomState(); assert.deepEqual(state.audioTracks, { rain: .12, wind: .34, birds: .56, lofi: .78 });
  assert.equal(state.objectPoses.game!.rotation, .4); assert.equal(state.masterMute, true);
});
test('mood demo returns an allowed bounded configuration', async () => {
  const result = await analyzeMood('今天有点累，想听雨，但不要太暗');
  assert.equal(result.weather, 'rain'); assert.equal(result.lampOn, true);
  assert.ok(result.volumeWeather >= 0 && result.volumeWeather <= 1); assert.ok(result.roomNote.length <= 120);
});


test('four desktop apps persist their content in the existing room state namespace', () => {
  cache.clear();
  const movieEntries = [{ id: 'movie-1', title: 'Perfect Days', year: 2023, note: 'A quiet afternoon.', createdAt: 10 }];
  const canvasNotes = [{ id: 'canvas-1', text: 'A small idea', x: 140, y: -80, tone: 'sage' as const }];
  saveRoomState({ notesText: 'Remember to slow down.', movieEntries, canvasNotes });
  const loaded = loadRoomState();
  assert.equal(loaded.notesText, 'Remember to slow down.');
  assert.deepEqual(loaded.movieEntries, movieEntries);
  assert.deepEqual(loaded.canvasNotes, canvasNotes);
  assert.equal(cache.size, 1);
  assert.ok(cache.has('roomforone-state-v1'));
});

test('canvas and movie data are bounded before being restored', () => {
  const loaded = normalizeRoomState({
    notesText: 'n'.repeat(22000),
    movieEntries: [{ id: 'movie-1', title: 'm'.repeat(200), year: 3000, note: 'x'.repeat(1400), createdAt: 1 }],
    canvasNotes: [{ id: 'canvas-1', text: 'x'.repeat(2200), x: 9000, y: -9000, tone: 'clay' }],
  });
  assert.equal(loaded.notesText.length, 20000);
  assert.equal(loaded.movieEntries.length, 0);
  assert.equal(loaded.canvasNotes[0].text.length, 2000);
  assert.equal(loaded.canvasNotes[0].x, 4000);
  assert.equal(loaded.canvasNotes[0].y, -4000);
});

test('legacy night selection is migrated to weather data; local time now controls night lighting', () => {
  const migrated = normalizeRoomState({
    weather: 'night',
    actualWeather: { preset: 'rain', temperature: 12, windSpeed: 4, weatherCode: 61, fetchedAt: 1 },
  });
  assert.equal(migrated.weather, 'rain');
  assert.equal(normalizeRoomState({ weather: 'night' }).weather, 'sunny');
});
