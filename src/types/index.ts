export type WeatherPreset = 'sunny' | 'rain' | 'snow' | 'autumn' | 'night';

export type ObjectId = 'computer' | 'keyboard' | 'mouse' | 'tangle' | 'headphones' | 'game' | 'lamp' | 'atmosphere' | 'tools';
export type InteractionPhase = 'idle' | 'hover' | 'selected' | 'picked' | 'manipulating' | 'released';
export type Vec3 = [number, number, number];
export interface ObjectPose { position: Vec3; rotation: number }
export type AudioTrack = 'rain' | 'wind' | 'birds' | 'lofi';
export type TrackMix = Record<AudioTrack, number>;
export interface TangleNote { id: string; text: string; createdAt: number }

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
  gameHighScore: number;
}

export type ModalType = 
  | 'computer' 
  | 'drawing' 
  | 'game' 
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
