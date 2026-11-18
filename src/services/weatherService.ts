import type { CityConfig, WeatherPreset, WeatherSnapshot } from '../types';

export const CITY_OPTIONS: CityConfig[] = [
  { id: 'shenzhen', name: 'Shenzhen', country: 'China', timezone: 'Asia/Shanghai', latitude: 22.5431, longitude: 114.0579 },
  { id: 'shanghai', name: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', latitude: 31.2304, longitude: 121.4737 },
  { id: 'new-york', name: 'New York', country: 'United States', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 },
  { id: 'london', name: 'London', country: 'United Kingdom', timezone: 'Europe/London', latitude: 51.5072, longitude: -0.1276 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { id: 'paris', name: 'Paris', country: 'France', timezone: 'Europe/Paris', latitude: 48.8566, longitude: 2.3522 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 },
];

export const DEFAULT_CITY = CITY_OPTIONS[0];

export function getTimeLabel(city: CityConfig, date = new Date()): string {
  return new Intl.DateTimeFormat('en', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function getLocalHour(city: CityConfig, date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 12);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hour + minute / 60;
}

export function getTimePhase(city: CityConfig, date = new Date()): 'Morning' | 'Midday' | 'Golden Hour' | 'Night' {
  const hour = getLocalHour(city, date);
  if (hour >= 5.5 && hour < 10.5) return 'Morning';
  if (hour >= 10.5 && hour < 16) return 'Midday';
  if (hour >= 16 && hour < 20) return 'Golden Hour';
  return 'Night';
}

export function getWeatherLabel(preset: WeatherPreset): string {
  return ({
    sunny: 'Clear',
    cloudy: 'Cloudy',
    rain: 'Rain',
    snow: 'Snow',
    autumn: 'Windy',
    night: 'Night preview',
  })[preset];
}

export function mapWeatherCode(code: number, windSpeed = 0): WeatherPreset {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rain';
  if ([1, 2, 3, 45, 48].includes(code)) return 'cloudy';
  if (windSpeed >= 35 && [0, 1].includes(code)) return 'autumn';
  return 'sunny';
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<CityConfig[]> {
  const term = query.trim();
  if (!term) return CITY_OPTIONS;
  const params = new URLSearchParams({ name: term, count: '8', language: 'en', format: 'json' });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
    signal: signal ?? AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`City search failed: ${response.status}`);
  const data = await response.json() as {
    results?: Array<{
      id?: number; name?: string; country?: string; timezone?: string;
      latitude?: number; longitude?: number; admin1?: string;
    }>;
  };
  return (data.results ?? [])
    .filter((item) => item.name && item.country && item.timezone && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .map((item) => ({
      id: String(item.id ?? `${item.name}-${item.latitude}-${item.longitude}`),
      name: item.name!,
      country: item.admin1 ? `${item.admin1}, ${item.country}` : item.country!,
      timezone: item.timezone!,
      latitude: item.latitude!,
      longitude: item.longitude!,
    }));
}

export async function fetchWeather(city: CityConfig): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,wind_speed_10m,cloud_cover,precipitation,is_day',
    daily: 'sunrise,sunset',
    forecast_days: '1',
    timezone: city.timezone,
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  const data = await response.json() as {
    current?: {
      temperature_2m?: number; weather_code?: number; wind_speed_10m?: number;
      cloud_cover?: number; precipitation?: number; is_day?: number;
    };
    daily?: { sunrise?: string[]; sunset?: string[] };
  };
  const code = data.current?.weather_code ?? 0;
  const windSpeed = data.current?.wind_speed_10m ?? 0;
  return {
    preset: mapWeatherCode(code, windSpeed),
    temperature: Math.round(data.current?.temperature_2m ?? 20),
    windSpeed: Math.round(windSpeed),
    weatherCode: code,
    fetchedAt: Date.now(),
    sunrise: data.daily?.sunrise?.[0],
    sunset: data.daily?.sunset?.[0],
    cloudCover: data.current?.cloud_cover,
    precipitation: data.current?.precipitation,
  };
}
