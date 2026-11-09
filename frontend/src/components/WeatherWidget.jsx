import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CloudRain, Wind, Droplets, Gauge, Compass, Sun, Eye, RefreshCw } from 'lucide-react';

const WeatherWidget = () => {
  const { city, currentWeather, loadingWeather, refreshWeather } = useWeather();

  if (loadingWeather && !currentWeather) {
    return (
      <div className="agri-card p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white animate-pulse">
        <div className="h-6 w-36 bg-emerald-700 rounded mb-4"></div>
        <div className="h-12 w-24 bg-emerald-700 rounded"></div>
      </div>
    );
  }

  if (!currentWeather) return null;

  return (
    <div className="agri-card p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white relative overflow-hidden shadow-lg border-emerald-700">
      {/* Background Decorative Rings */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-600/10 pointer-events-none"></div>
      <div className="absolute right-16 -bottom-16 w-36 h-36 rounded-full bg-amber-400/10 pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
            Current Farm Agro-Meteorology
          </span>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            {currentWeather.city}, {currentWeather.state}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              currentWeather.dataSource === 'LIVE_API'
                ? 'bg-emerald-500 text-emerald-950 ring-2 ring-emerald-400/40'
                : 'bg-amber-500 text-amber-950 ring-2 ring-amber-400/40'
            }`}
          >
            {currentWeather.dataSource === 'LIVE_API' ? '● Live API' : '● Demo Data'}
          </span>

          <button
            onClick={refreshWeather}
            disabled={loadingWeather}
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-4 h-4 ${loadingWeather ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-4 relative z-10">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
            {currentWeather.temperature}°C
          </span>
          <div className="flex flex-col text-xs text-emerald-200">
            <span>Feels like <b>{currentWeather.feelsLike}°C</b></span>
            <span>Min: {currentWeather.tempMin}°C • Max: {currentWeather.tempMax}°C</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:justify-end">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white capitalize leading-tight">
              {currentWeather.condition}
            </h4>
            <p className="text-xs text-emerald-200 capitalize">
              {currentWeather.description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 4 Micro Agro-Weather Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/80 relative z-10 text-xs">
        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/50 flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Humidity</span>
            <span className="font-bold text-white text-sm">{currentWeather.humidity}%</span>
          </div>
        </div>

        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/50 flex items-center gap-2.5">
          <Wind className="w-4 h-4 text-teal-300 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Wind Velocity</span>
            <span className="font-bold text-white text-sm">{currentWeather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/50 flex items-center gap-2.5">
          <CloudRain className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Rainfall (1h)</span>
            <span className="font-bold text-white text-sm">{currentWeather.rainfall} mm</span>
          </div>
        </div>

        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/50 flex items-center gap-2.5">
          <Gauge className="w-4 h-4 text-purple-300 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px]">Pressure</span>
            <span className="font-bold text-white text-sm">{currentWeather.pressure} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
