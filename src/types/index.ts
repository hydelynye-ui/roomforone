export type WeatherPreset = 'sunny' | 'rain' | 'snow' | 'autumn' | 'night';

export interface RoomState {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  masterMute: boolean;
  volumeWeather: number;
  volumeAmbient: number;
  stickyNote: string;
  roomRotation: number;
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
