import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  CloudSun,
  CalendarDays,
  Sprout,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Activity,
  BarChart3,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-emerald-700 text-white shadow-sm font-bold'
        : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-emerald-900 border-r border-emerald-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside mobile drawer */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-emerald-800">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* 1. FARMER NAVIGATION */}
          {role === 'farmer' && (
            <div>
              <p className="px-3 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2">
                Farmer Workspace
              </p>
              <div className="space-y-1">
                <NavLink to="/farmer-dashboard" onClick={onClose} className={navItemClass}>
                  <LayoutDashboard className="w-4 h-4 text-amber-300" />
                  Farmer Dashboard
                </NavLink>
                <NavLink to="/profile" onClick={onClose} className={navItemClass}>
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  Farm & Land Profile
                </NavLink>
                <NavLink to="/crops" onClick={onClose} className={navItemClass}>
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  My Crops & Sowing
                </NavLink>
                <NavLink to="/advisory" onClick={onClose} className={navItemClass}>
                  <Lightbulb className="w-4 h-4 text-amber-300" />
                  Smart Crop Advisories
                </NavLink>
                <NavLink to="/queries" onClick={onClose} className={navItemClass}>
                  <HelpCircle className="w-4 h-4 text-emerald-300" />
                  Expert Consultation
                </NavLink>
              </div>
            </div>
          )}

          {/* 2. AGRICULTURE EXPERT NAVIGATION */}
          {role === 'expert' && (
            <div>
              <p className="px-3 text-[10px] font-extrabold text-purple-300 uppercase tracking-widest mb-2">
                Agri Expert Desk
              </p>
              <div className="space-y-1">
                <NavLink to="/expert" onClick={onClose} className={navItemClass}>
                  <LayoutDashboard className="w-4 h-4 text-purple-300" />
                  Expert Dashboard
                </NavLink>
                <NavLink to="/expert/queries" onClick={onClose} className={navItemClass}>
                  <HelpCircle className="w-4 h-4 text-amber-300" />
                  Farmer Queries Queue
                </NavLink>
                <NavLink to="/advisory" onClick={onClose} className={navItemClass}>
                  <Lightbulb className="w-4 h-4 text-emerald-300" />
                  Advisory Guidelines
                </NavLink>
                <NavLink to="/crops" onClick={onClose} className={navItemClass}>
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  Crop Records Overview
                </NavLink>
              </div>
            </div>
          )}

          {/* 3. ADMINISTRATOR NAVIGATION */}
          {role === 'admin' && (
            <div>
              <p className="px-3 text-[10px] font-extrabold text-rose-300 uppercase tracking-widest mb-2">
                System Administration
              </p>
              <div className="space-y-1">
                <NavLink to="/admin" onClick={onClose} className={navItemClass}>
                  <ShieldCheck className="w-4 h-4 text-rose-300" />
                  Admin Dashboard
                </NavLink>
                <NavLink to="/admin/users" onClick={onClose} className={navItemClass}>
                  <Users className="w-4 h-4 text-amber-300" />
                  User & Role Accounts
                </NavLink>
                <NavLink to="/crops" onClick={onClose} className={navItemClass}>
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  Crop Registry
                </NavLink>
                <NavLink to="/admin/analytics" onClick={onClose} className={navItemClass}>
                  <BarChart3 className="w-4 h-4 text-cyan-300" />
                  System Analytics
                </NavLink>
                <NavLink to="/admin/logs" onClick={onClose} className={navItemClass}>
                  <Activity className="w-4 h-4 text-rose-300" />
                  Activity Audit Logs
                </NavLink>
              </div>
            </div>
          )}

          {/* 4. SHARED WEATHER & INTELLIGENCE */}
          <div>
            <p className="px-3 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-2">
              Weather & Reports
            </p>
            <div className="space-y-1">
              <NavLink to="/live-weather" onClick={onClose} className={navItemClass}>
                <CloudSun className="w-4 h-4 text-amber-300" />
                Live Weather Station
              </NavLink>
              <NavLink to="/forecast" onClick={onClose} className={navItemClass}>
                <CalendarDays className="w-4 h-4 text-sky-300" />
                5-Day Forecast & Charts
              </NavLink>
              <NavLink to="/alerts" onClick={onClose} className={navItemClass}>
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                Weather Alerts
              </NavLink>
              <NavLink to="/reports" onClick={onClose} className={navItemClass}>
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                Mandatory Reports (PDF/CSV)
              </NavLink>
            </div>
          </div>
        </div>

        {/* Bottom User / University Badge */}
        <div className="p-3 border-t border-emerald-800 bg-emerald-950/40 text-[11px] text-emerald-300">
          <p className="font-semibold text-white truncate">SR University</p>
          <p className="text-[10px] text-emerald-400">Warangal, Telangana</p>
          <p className="text-[9px] text-emerald-500 mt-0.5">DevOps & Full Stack • 2026-27</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
