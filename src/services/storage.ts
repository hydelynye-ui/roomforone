import { RoomState } from '../types';

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
  roomRotation: 0,
  weatherMode: 'live',
};

// Safe LocalStorage wrapper
export function loadRoomState(): RoomState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE);
    if (!raw) return DEFAULT_ROOM_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ROOM_STATE,
      ...parsed,
      masterMute: true, // 保持规范：每次重新打开页面依然遵循浏览器音频策略保持初始静音
    };
  } catch (e) {
    console.warn('[roomforone] Failed to load localStorage state:', e);
    return DEFAULT_ROOM_STATE;
  }
}

export function saveRoomState(state: Partial<RoomState>): void {
  try {
    const current = loadRoomState();
    const next = { ...current, ...state };
    localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE, JSON.stringify(next));
  } catch (e) {
    console.warn('[roomforone] Failed to save to localStorage:', e);
  }
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

export async function saveDrawingDraft(dataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORAGE_KEYS.DRAWINGS_STORE, 'readwrite');
    const store = tx.objectStore(STORAGE_KEYS.DRAWINGS_STORE);
    store.put({
      id: 'current_draft',
      dataUrl,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[roomforone] IndexedDB save drawing failed:', e);
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
