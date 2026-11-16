export type WeatherPreset = 'sunny' | 'rain' | 'snow' | 'autumn' | 'night';

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
}

export interface RoomState {
  weather: WeatherPreset;
  windowOpen: boolean;
  lampOn: boolean;
  masterMute: boolean;
  volumeWeather: number;
  volumeAmbient: number;
  stickyNote: string;
  roomRotation: number;
  city?: CityConfig;
  weatherMode?: 'live' | 'manual';
  actualWeather?: WeatherSnapshot;
}

export type ModalType = 
  | 'computer' 
  | 'drawing' 
  | 'game' 
  | 'diy' 
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
