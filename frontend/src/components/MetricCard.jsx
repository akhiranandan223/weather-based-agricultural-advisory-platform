import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, badge, color = 'emerald' }) => {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  const iconBgStyles = {
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-500 text-white',
    blue: 'bg-sky-600 text-white',
    purple: 'bg-purple-600 text-white',
    rose: 'bg-rose-600 text-white'
  };

  return (
    <div className="agri-card p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${iconBgStyles[color] || iconBgStyles.emerald}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {badge && (
        <div className="mt-3">
          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ${colorStyles[color] || colorStyles.emerald}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
