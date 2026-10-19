
"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";

export type LocationValue = {
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  placeholder: string;
  kind: "pickup" | "drop";
  onSelect: (location: LocationValue) => void;
  onTyping: () => void;
};

type SearchResult = LocationValue;

export default function LocationSearch({
  placeholder,
  kind,
  onSelect,
  onTyping,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const suppressSearch = useRef(false);

  useEffect(() => {
    if (suppressSearch.current) {
      suppressSearch.current = false;
      return;
    }

    if (query.trim().length < 3) {
    return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Location search failed.");
        }

        setResults(data.results ?? []);
        setOpen(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Location search error:", error);
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const Icon = kind === "pickup" ? MapPin : Navigation;
  const iconColor = kind === "pickup" ? "text-green-600" : "text-rose-500";

  return (
    <div className="relative">
      <div className={`absolute left-4 top-4 z-10 ${iconColor}`}>
        <Icon size={19} />
      </div>

      <input
        value={query}
        autoComplete="off"
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        onChange={(event) => {
        const nextQuery = event.target.value;

        setQuery(nextQuery);
        setOpen(nextQuery.trim().length >= 3);

        if (nextQuery.trim().length < 3) {
            setResults([]);
            setLoading(false);
        }

        onTyping();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
      />

      {loading && (
        <span className="absolute right-4 top-4 text-slate-400">
          <Search size={18} className="animate-pulse" />
        </span>
      )}

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          {results.map((result, index) => (
            <li key={`${result.lat}-${result.lng}-${index}`}>
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm hover:bg-indigo-50"
                onClick={() => {
                  suppressSearch.current = true;
                  setQuery(result.address);
                  setResults([]);
                  setOpen(false);
                  onSelect(result);
                }}
              >
                <span className="block font-semibold text-slate-800">
                  {result.address}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  Select this location
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length >= 3 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-xl">
          No matching locations found. Try a more specific address.
        </div>
      )}
    </div>
  );
}
