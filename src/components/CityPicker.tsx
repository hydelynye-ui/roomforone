import React, { useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react';
import { CityConfig } from '../types';
import { CITY_OPTIONS } from '../services/weatherService';

interface CityPickerProps {
  onSelect: (city: CityConfig | null) => void;
}

export const CityPicker: React.FC<CityPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return CITY_OPTIONS.filter((city) => !term || `${city.name} ${city.country}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#30312f]/35 px-5 py-8 backdrop-blur-md">
      <div className="city-picker w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/65 bg-[#f8f2e9]/95 shadow-[0_24px_80px_rgba(46,40,34,.22)]">
        <div className="relative overflow-hidden px-7 pb-6 pt-8 sm:px-10 sm:pt-10">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#d8b98d]/30 blur-3xl" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.28em] text-[#a45e42]">
              <Sparkles className="h-3.5 w-3.5" /> roomforone / weather room
            </div>
            <h2 className="max-w-md text-3xl font-semibold tracking-[-.04em] text-[#34312e] sm:text-4xl">Where should your room be?</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#34312e]/65">Choose a city to let the room follow its local time and current weather. You can change it later.</p>
            <div className="relative mt-7">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#34312e]/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a city"
                className="w-full rounded-2xl border border-[#c9a47e]/25 bg-white/65 py-3.5 pl-11 pr-4 text-sm text-[#34312e] outline-none transition focus:border-[#c98464] focus:bg-white"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2 border-t border-[#c9a47e]/20 bg-white/25 p-4 sm:grid-cols-2 sm:p-6">
          {matches.map((city) => (
            <button
              key={city.id}
              onClick={() => onSelect(city)}
              className="group flex items-center justify-between rounded-2xl border border-transparent bg-white/55 px-4 py-3.5 text-left transition hover:border-[#c98464]/45 hover:bg-white"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#efe8dc] text-[#a45e42]"><MapPin className="h-4 w-4" /></span>
                <span>
                  <span className="block text-sm font-semibold text-[#34312e]">{city.name}</span>
                  <span className="block text-[11px] text-[#34312e]/55">{city.country}</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#34312e]/25 transition group-hover:translate-x-0.5 group-hover:text-[#c98464]" />
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#c9a47e]/20 px-7 py-4 text-[11px] text-[#34312e]/50 sm:px-10">
          <span>Live weather uses Open-Meteo and keeps the latest successful reading.</span>
          <button onClick={() => onSelect(null)} className="rounded-full px-3 py-1.5 font-medium text-[#34312e]/65 transition hover:bg-[#efe8dc] hover:text-[#34312e]">Choose later</button>
        </div>
      </div>
    </div>
  );
};
