import { RoomState, ObjectId, ObjectPose, Vec3, TangleNote } from '../types';
import { INITIAL_POSES, initialTangle, clamp } from '../room/constraints';

export const STORAGE_KEYS = {
  LOCAL_STORAGE: 'roomforone-state-v1',
  INDEXED_DB: 'roomforone-local-v1',
  DRAWINGS_STORE: 'roomforone_drawings',
  NOTES_STORE: 'roomforone_notes',
} as const;

export const DEFAULT_ROOM_STATE: RoomState = {
  weather: 'sunny',
  windowOpen: true,
  lampOn: false,
  masterMute: true, // 按照设计规范：初始静音，待访客主动点击开启
  volumeWeather: 0.6,
  volumeAmbient: 0.4,
  stickyNote: '给自己留一点空间，呼吸、放空，或者做一点喜欢的手作。',
  roomRotation: Math.PI / 4,
  masterVolume: 0.7,
  audioTracks: { rain: 0.65, wind: 0.35, birds: 0.5, lofi: 0.18 },
  objectPoses: structuredClone(INITIAL_POSES),
  tangleNodes: initialTangle(),
  tangleNotes: [],
  gameHighScore: 0,
};

const finite = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === 'number' && Number.isFinite(v) ? clamp(v, lo, hi) : fallback;

export function normalizeRoomState(input: unknown): RoomState {
  const p = input && typeof input === 'object' ? input as Partial<RoomState> : {};
  const poses = structuredClone(INITIAL_POSES);
  for (const id of Object.keys(poses) as ObjectId[]) {
    const candidate = p.objectPoses?.[id];
    if (!candidate || !Array.isArray(candidate.position) || candidate.position.length !== 3) continue;
    const initial = INITIAL_POSES[id];
    const r = id === 'tools' ? [[-2.6, -2.15], [1.06, 1.06], [0.45, 1.65]] : [[-2.25, 2.25], [initial.position[1], initial.position[1]], [-2.6, -1.1]];
    poses[id] = {
      position: candidate.position.map((v, i) => finite(v, initial.position[i], r[i][0], r[i][1])) as Vec3,
      rotation: finite(candidate.rotation, initial.rotation, -Math.PI, Math.PI),
    };
  }
  const nodes = Array.isArray(p.tangleNodes) && p.tangleNodes.length === 12
    && p.tangleNodes.every(n => Array.isArray(n) && n.length === 3 && n.every(v => typeof v === 'number' && Number.isFinite(v)))
    ? p.tangleNodes.map(n => [clamp(n[0], -0.65, 0.65), clamp(n[1], -0.015, 0.2), clamp(n[2], -0.5, 0.5)] as Vec3)
    : initialTangle();
  return {
    ...DEFAULT_ROOM_STATE, ...p,
    weather: ['sunny', 'rain', 'snow', 'autumn', 'night'].includes(p.weather || '') ? p.weather! : 'sunny',
    windowOpen: typeof p.windowOpen === 'boolean' ? p.windowOpen : true,
    lampOn: typeof p.lampOn === 'boolean' ? p.lampOn : false,
    masterMute: true,
    volumeWeather: finite(p.volumeWeather, 0.6, 0, 1),
    volumeAmbient: finite(p.volumeAmbient, 0.4, 0, 1),
    stickyNote: typeof p.stickyNote === 'string' ? p.stickyNote.slice(0, 500) : DEFAULT_ROOM_STATE.stickyNote,
    roomRotation: finite(p.roomRotation, Math.PI / 4, -0.26, 1.83),
    masterVolume: finite(p.masterVolume, 0.7, 0, 1),
    audioTracks: {
      rain: finite(p.audioTracks?.rain, 0.65, 0, 1), wind: finite(p.audioTracks?.wind, 0.35, 0, 1),
      birds: finite(p.audioTracks?.birds, 0.5, 0, 1), lofi: finite(p.audioTracks?.lofi, 0.18, 0, 1),
    },
    objectPoses: poses, tangleNodes: nodes,
    tangleNotes: Array.isArray(p.tangleNotes) ? p.tangleNotes.filter((n): n is TangleNote =>
      !!n && typeof n.id === 'string' && typeof n.text === 'string' && Number.isFinite(n.createdAt)) : [],
    gameHighScore: finite(p.gameHighScore, 0, 0, 1e7),
  };
}

export function loadRoomState(): RoomState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = normalizeRoomState(parsed);
    // Read existing first-version notes and game scores without deleting either legacy key.
    if (!Object.prototype.hasOwnProperty.call(parsed, 'tangleNotes')) {
      const legacy = JSON.parse(localStorage.getItem('roomforone-tangle-notes-v1') || '[]');
      if (Array.isArray(legacy)) next.tangleNotes = legacy.filter(n => n && typeof n.text === 'string' && typeof n.id === 'string' && Number.isFinite(n.createdAt));
    }
    next.gameHighScore = Math.max(next.gameHighScore, Number(localStorage.getItem('roomforone_leaf_game_high')) || 0);
    return next;
  } catch { return structuredClone(DEFAULT_ROOM_STATE); }
}

export function saveRoomState(state: Partial<RoomState>): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE);
    const previous = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE, JSON.stringify({ ...previous, ...state }));
    return true;
  } catch { return false; }
}

// IndexedDB Helper for Drawing Drafts and Offline Cache
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(STORAGE_KEYS.INDEXED_DB, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORAGE_KEYS.DRAWINGS_STORE)) {
        db.createObjectStore(STORAGE_KEYS.DRAWINGS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORAGE_KEYS.NOTES_STORE)) {
        db.createObjectStore(STORAGE_KEYS.NOTES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('[roomforone] IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

export async function saveDrawingDraft(dataUrl: string): Promise<boolean> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORAGE_KEYS.DRAWINGS_STORE, 'readwrite');
    const store = tx.objectStore(STORAGE_KEYS.DRAWINGS_STORE);
    store.put({ id: 'current_draft', dataUrl, updatedAt: Date.now() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch (e) {
    console.warn('[roomforone] IndexedDB save drawing failed:', e);
    return false;
  }
}

export async function loadDrawingDraft(): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORAGE_KEYS.DRAWINGS_STORE, 'readonly');
      const store = tx.objectStore(STORAGE_KEYS.DRAWINGS_STORE);
      const req = store.get('current_draft');
      req.onsuccess = () => {
        resolve(req.result?.dataUrl || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('[roomforone] IndexedDB load drawing failed:', e);
    return null;
  }
}
