import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import {
  CloudSun,
  MapPin,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  Shield,
  Sprout,
  GraduationCap
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { city, changeCity, currentWeather } = useWeather();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [citySelectOpen, setCitySelectOpen] = useState(false);

  const majorCities = ['Warangal', 'Karimnagar', 'Nizamabad', 'Hyderabad', 'Khammam', 'Guntur'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'bg-rose-100 text-rose-800 border-rose-200',
    expert: 'bg-purple-100 text-purple-800 border-purple-200',
    farmer: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <nav className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center shadow-inner">
                <Sprout className="w-6 h-6 text-emerald-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                  AgriWeather<span className="text-amber-400">Advisory</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-medium tracking-wide uppercase">
                  SR University • DevOps & Full Stack
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Live Location Weather Ticker */}
          <div className="hidden md:flex items-center gap-3 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <div className="relative">
                <button
                  onClick={() => setCitySelectOpen(!citySelectOpen)}
                  className="flex items-center gap-1 hover:underline font-bold"
                >
                  {city}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {citySelectOpen && (
                  <div className="absolute top-7 left-0 mt-1 w-36 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                    {majorCities.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          changeCity(c);
                          setCitySelectOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 ${city === c ? 'font-bold text-emerald-700 bg-emerald-50/70' : ''}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-emerald-500">|</span>

            {currentWeather ? (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{currentWeather.temperature}°C</span>
                <span className="text-emerald-200 capitalize">{currentWeather.description}</span>
                <span className="text-emerald-400">💧 {currentWeather.humidity}%</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${currentWeather.dataSource === 'LIVE_API' ? 'bg-emerald-600 text-white' : 'bg-amber-600/80 text-amber-100'}`}>
                  {currentWeather.dataSource === 'LIVE_API' ? 'LIVE' : 'SIMULATED'}
                </span>
              </div>
            ) : (
              <span className="text-emerald-300">Loading weather...</span>
            )}
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/alerts"
                  className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 relative"
                  title="Weather Alerts"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-900 animate-pulse"></span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-emerald-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white text-sm border border-emerald-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border w-fit ${roleBadgeColor[user.role] || 'bg-slate-100 text-slate-700'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-2 z-50 divide-y divide-slate-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      <div className="px-4 py-2.5">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {user.role === 'farmer' && (
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <UserIcon className="w-4 h-4 text-emerald-600" />
                            Farmer Profile & Land
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <Shield className="w-4 h-4 text-rose-600" />
                            System Administration
                          </Link>
                        )}
                        {user.role === 'expert' && (
                          <Link
                            to="/expert"
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            Expert Desk & Queries
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
