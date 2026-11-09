import React from 'react';
import { Download, Printer, Search, RefreshCw, Filter } from 'lucide-react';

const ExportToolbar = ({
  searchQuery,
  onSearchChange,
  onExportCSV,
  onPrint,
  onRefresh,
  loading = false,
  placeholder = 'Search records...',
  extraFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
      {/* Left: Search input */}
      <div className="flex items-center gap-3 w-full md:w-auto flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {extraFilters}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        )}

        {onPrint && (
          <button
            onClick={onPrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ExportToolbar;
