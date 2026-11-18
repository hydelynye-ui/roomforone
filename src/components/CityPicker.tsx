import React, { useEffect, useState } from 'react';
import { ArrowUpRight, MapPin, Search, X } from 'lucide-react';
import type { CityConfig } from '../types';
import { CITY_OPTIONS, searchCities } from '../services/weatherService';

interface CityPickerProps {
  onSelect: (city: CityConfig | null) => void;
  onClose?: () => void;
}

export const CityPicker: React.FC<CityPickerProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityConfig[]>(CITY_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const term = query.trim();
    const timer = window.setTimeout(async () => {
      if (!term) {
        setResults(CITY_OPTIONS);
        setError('');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const cities = await searchCities(term, controller.signal);
        setResults(cities);
        if (!cities.length) setError('No matching city found. Try another spelling.');
      } catch {
        const local = CITY_OPTIONS.filter((city) =>
          `${city.name} ${city.country}`.toLowerCase().includes(term.toLowerCase()),
        );
        setResults(local);
        setError(local.length ? 'Live search is unavailable. Showing saved suggestions.' : 'City search is temporarily unavailable.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, term ? 260 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="city-picker-layer" role="dialog" aria-modal="true" aria-labelledby="city-picker-title">
      <div className="city-picker-backdrop" />
      <section className="city-picker-panel">
        <div className="city-picker-topline">
          <span className="city-picker-mark"><span /></span>
          <span>ROOMFORONE / YOUR ENVIRONMENT</span>
          <button className="city-picker-close" onClick={onClose ?? (() => onSelect(null))} aria-label="Close city selection"><X size={16} /></button>
        </div>
        <div className="city-picker-copy">
          <p className="eyebrow">A LITTLE SPACE TO SLOW DOWN</p>
          <h2 id="city-picker-title">Where should your room be?</h2>
          <p>Choose a city. Your room will follow its local time, daylight and live weather.</p>
        </div>
        <label className="city-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city or country"
            autoFocus
          />
          {loading && <span className="city-search-status">Searching</span>}
        </label>
        <div className="city-results" aria-live="polite">
          {results.map((city) => (
            <button key={city.id} className="city-result" onClick={() => onSelect(city)}>
              <span className="city-result-icon"><MapPin size={16} /></span>
              <span className="city-result-text">
                <strong>{city.name}</strong>
                <small>{city.country} · {city.timezone}</small>
              </span>
              <ArrowUpRight size={16} className="city-result-arrow" />
            </button>
          ))}
          {!results.length && error && <p className="city-empty">{error}</p>}
        </div>
        <div className="city-picker-footer">
          <span>{error || 'Weather data is provided by Open-Meteo.'}</span>
          <button onClick={() => onSelect(null)}>Use demo environment</button>
        </div>
      </section>
    </div>
  );
};
