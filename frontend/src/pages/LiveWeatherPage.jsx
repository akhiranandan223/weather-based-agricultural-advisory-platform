import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useToast } from '../context/ToastContext';
import { weatherAPI } from '../services/api';
import {
  CloudSun,
  Search,
  MapPin,
  RefreshCw,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  CloudRain,
  Compass,
  AlertCircle,
  CheckCircle2,
  Navigation
} from 'lucide-react';

const LiveWeatherPage = () => {
  const { city, changeCity, currentWeather, loadingWeather, refreshWeather } = useWeather();
  const { addToast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [searching, setSearching] = useState(false);

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearching(true);
    try {
      changeCity(searchInput.trim());
      addToast(`Retrieving meteorological station observations for ${searchInput.trim()}...`, 'info');
      setSearchInput('');
    } catch (err) {
      addToast('Error searching city weather.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleCoordsSearch = async (e) => {
    e.preventDefault();
    if (!latInput || !lonInput) {
      addToast('Please provide both latitude and longitude.', 'warning');
      return;
    }
    setSearching(true);
    try {
      const res = await weatherAPI.getCurrent({ lat: latInput, lon: lonInput });
      if (res.data.success) {
        changeCity(res.data.weather.city);
        addToast(`Observation retrieved for coordinates (${latInput}, ${lonInput})`, 'success');
        setLatInput('');
        setLonInput('');
      }
    } catch (err) {
      addToast('Failed to fetch weather for coordinates.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const presetStations = [
    { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
    { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288 },
    { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.4867 },
    { name: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514 },
    { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Meteorological Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Live Agro-Weather Station
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time atmospheric monitoring powered by OpenWeatherMap API with micro-climatic agronomic indicators.
          </p>
        </div>

        <button
          onClick={refreshWeather}
          disabled={loadingWeather}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
          <span>Refresh Station Data</span>
        </button>
      </div>

      {/* Dual Search Card: By City and By Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-emerald-700" />
            Search Station by City / District
          </label>
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. Warangal, Karimnagar, Guntur..."
              className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* GPS Coordinates Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-700" />
            Lookup by Farm GPS Coordinates
          </label>
          <form onSubmit={handleCoordsSearch} className="flex gap-2">
            <input
              type="number"
              step="any"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="Lat (e.g. 17.96)"
              className="w-1/2 text-xs p-2.5 border border-slate-300 rounded-xl"
            />
            <input
              type="number"
              step="any"
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              placeholder="Lon (e.g. 79.59)"
              className="w-1/2 text-xs p-2.5 border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Locate
            </button>
          </form>
        </div>
      </div>

      {/* Preset Regional Stations Quick Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-1">
          Regional Hubs:
        </span>
        {presetStations.map((stn) => (
          <button
            key={stn.name}
            onClick={() => changeCity(stn.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              city.toLowerCase() === stn.name.toLowerCase()
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {stn.name}
          </button>
        ))}
      </div>

      {/* Main Meteorological Station Display */}
      {currentWeather && (
        <div className="agri-card p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white border-emerald-800 shadow-xl relative overflow-hidden">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-800/80">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h2 className="text-2xl font-black text-white">
                  {currentWeather.city}, {currentWeather.state}
                </h2>
                <span className="text-xs text-emerald-300 font-mono">
                  ({currentWeather.coordinates?.lat.toFixed(2)}°N, {currentWeather.coordinates?.lon.toFixed(2)}°E)
                </span>
              </div>
              <p className="text-xs text-emerald-300 mt-1 capitalize">
                Observation time: {new Date().toLocaleTimeString()} • Station status nominal
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow ${
                  currentWeather.dataSource === 'LIVE_API'
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'bg-amber-400 text-amber-950'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                {currentWeather.dataSource === 'LIVE_API' ? 'OpenWeather Live API' : 'Simulated Regional Model'}
              </span>
            </div>
          </div>

          {/* Core Temperature & Atmosphere Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
            {/* Left Column: Huge Temp & Min/Max */}
            <div className="lg:col-span-5 flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-black tracking-tight text-white">
                {currentWeather.temperature}°C
              </span>
              <div className="text-xs text-emerald-200 space-y-1">
                <p>Feels like: <b className="text-white text-sm">{currentWeather.feelsLike}°C</b></p>
                <p>Min: <b>{currentWeather.tempMin}°C</b></p>
                <p>Max: <b>{currentWeather.tempMax}°C</b></p>
              </div>
            </div>

            {/* Right Column: Sky condition description */}
            <div className="lg:col-span-7 flex items-center gap-4 lg:justify-end">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <CloudSun className="w-12 h-12 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white capitalize leading-tight">
                  {currentWeather.condition}
                </h3>
                <p className="text-sm text-emerald-200 capitalize">
                  {currentWeather.description}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Cloud Cover: {currentWeather.cloudCover || 15}%
                </p>
              </div>
            </div>
          </div>

          {/* Grid of 8 Comprehensive Micro-Meteo Sensors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-emerald-800/80 text-xs">
            {/* 1. Relative Humidity */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Relative Humidity</span>
              </div>
              <p className="text-xl font-extrabold text-white">{currentWeather.humidity}%</p>
              <span className="text-[10px] text-emerald-400">
                {currentWeather.humidity > 70 ? 'High fungal risk' : 'Optimal range'}
              </span>
            </div>

            {/* 2. Wind Velocity & Direction */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-teal-300 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Wind Velocity</span>
              </div>
              <p className="text-xl font-extrabold text-white">{currentWeather.windSpeed} km/h</p>
              <span className="text-[10px] text-emerald-400">
                Direction: {currentWeather.windDirection || 135}° SSE
              </span>
            </div>

            {/* 3. Barometric Pressure */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Atmospheric Pressure</span>
              </div>
              <p className="text-xl font-extrabold text-white">{currentWeather.pressure} hPa</p>
              <span className="text-[10px] text-emerald-400">Stable sea-level barometer</span>
            </div>

            {/* 4. Rainfall Accumulation */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <CloudRain className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Rainfall (Hourly)</span>
              </div>
              <p className="text-xl font-extrabold text-white">{currentWeather.rainfall || 0} mm</p>
              <span className="text-[10px] text-emerald-400">
                {currentWeather.rainfall > 0 ? 'Surface precipitation active' : 'No rain recorded'}
              </span>
            </div>

            {/* 5. Visibility */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-blue-300 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Field Visibility</span>
              </div>
              <p className="text-xl font-extrabold text-white">
                {(currentWeather.visibility / 1000).toFixed(1)} km
              </p>
              <span className="text-[10px] text-emerald-400">Clear optical line</span>
            </div>

            {/* 6. Sunrise */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Sunrise className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Sunrise</span>
              </div>
              <p className="text-lg font-extrabold text-white">
                {currentWeather.sunrise ? new Date(currentWeather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:12 AM'}
              </p>
              <span className="text-[10px] text-emerald-400">Dawn photo-period</span>
            </div>

            {/* 7. Sunset */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-orange-400 mb-1">
                <Sunset className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">Sunset</span>
              </div>
              <p className="text-lg font-extrabold text-white">
                {currentWeather.sunset ? new Date(currentWeather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:18 PM'}
              </p>
              <span className="text-[10px] text-emerald-400">Dusk photo-period</span>
            </div>

            {/* 8. Data Source Integrity */}
            <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-800/60">
              <div className="flex items-center gap-2 text-emerald-300 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] text-slate-300 font-semibold">API Source</span>
              </div>
              <p className="text-base font-bold text-white truncate">
                {currentWeather.dataSource}
              </p>
              <span className="text-[10px] text-emerald-400 truncate block">
                {currentWeather.apiStatusMessage || 'Synchronized'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWeatherPage;
