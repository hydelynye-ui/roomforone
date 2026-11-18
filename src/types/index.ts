export type WeatherPreset = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'autumn' | 'night';

export interface CityConfig {
  id: string;
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

export interface WeatherSnapshot {
  preset: WeatherPreset;
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  fetchedAt: number;
  sunrise?: string;
  sunset?: string;
  cloudCover?: number;
  precipitation?: number;
}

export type ObjectId = 'computer' | 'keyboard' | 'mouse' | 'tangle' | 'headphones' | 'game' | 'lamp' | 'atmosphere' | 'tools';
export type InteractionPhase = 'idle' | 'hover' | 'selected' | 'picked' | 'manipulating' | 'released';
export type Vec3 = [number, number, number];
export interface ObjectPose { position: Vec3; rotation: number }
export type AudioTrack = 'rain' | 'wind' | 'birds' | 'lofi';
export type TrackMix = Record<AudioTrack, number>;
export interface TangleNote { id: string; text: string; createdAt: number }
export interface MovieEntry { id: string; title: string; year?: number; note: string; createdAt: number }
export interface CanvasNote { id: string; text: string; x: number; y: number; tone: 'sage' | 'clay' | 'cream' }

export interface RoomState {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  masterMute: boolean;
  volumeWeather: number;
  volumeAmbient: number;
  stickyNote: string;
  roomRotation: number;
  masterVolume: number;
  audioTracks: TrackMix;
  objectPoses: Partial<Record<ObjectId, ObjectPose>>;
  tangleNodes: Vec3[];
  tangleNotes: TangleNote[];
  notesText: string;
  movieEntries: MovieEntry[];
  canvasNotes: CanvasNote[];
  gameHighScore: number;
  city?: CityConfig;
  weatherMode?: 'live' | 'manual';
  actualWeather?: WeatherSnapshot;
}

export type ModalType =
  | 'computer'
  | 'drawing'
  | 'game'
  | 'switch'
  | 'diy'
  | 'tangle'
  | 'headphones'
  | 'atmosphere'
  | 'mood-ai'
  | 'about'
  | null;

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  highlights: string[];
  link?: string;
  demoUrl?: string;
}

export interface DIYItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  materials: string[];
  steps: string[];
  quote: string;
}

export interface MoodAIRecommendation {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  volumeWeather: number;
  volumeAmbient: number;
  reason: string;
  roomNote: string;
}
