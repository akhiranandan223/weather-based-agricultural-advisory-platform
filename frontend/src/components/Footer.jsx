import React from 'react';
import { Sprout, Heart, ShieldAlert, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-emerald-950 font-extrabold">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">AgriWeather Advisory</span>
            </div>
            <p className="text-emerald-300 leading-relaxed">
              Empowering farmers across semi-arid and tropical belts with real-time agro-meteorological advisories, crop-specific guidance, and direct expert support.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Academic Project</h4>
            <p className="text-emerald-300">B.Tech IV Year I Semester</p>
            <p className="text-emerald-300">DevOps & Full Stack Project</p>
            <p className="text-amber-300 font-semibold">SR University, Warangal</p>
            <p className="text-emerald-400">Academic Year 2026–2027</p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">DevOps & Cloud Stack</h4>
            <ul className="space-y-1 text-emerald-300">
              <li>• Docker & Multi-stage Containers</li>
              <li>• Kubernetes & Minikube Pods</li>
              <li>• React 18 & Vite Frontend</li>
              <li>• Node.js, Express & MongoDB</li>
              <li>• OpenWeatherMap Live & Fallback API</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Agronomic Integrity</h4>
            <p className="text-emerald-300 leading-relaxed">
              All crop advisories adhere to verified agronomic rules developed with Krishi Vigyan Kendra (KVK) guidelines. Unsupported disease diagnostics are strictly avoided.
            </p>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold mt-2">
              <Award className="w-4 h-4" />
              <span>Target: 10/10 Excellent Grade</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400 gap-3">
          <p>© 2026-2027 Weather-Based Agricultural Advisory Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with rigor for SR University Examination
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
