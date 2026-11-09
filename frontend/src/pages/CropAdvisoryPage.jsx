import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { useToast } from '../context/ToastContext';
import { advisoryAPI, cropAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import {
  Lightbulb,
  Sprout,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Droplets,
  Wind,
  ShieldCheck,
  Check,
  Archive
} from 'lucide-react';

const CropAdvisoryPage = () => {
  const { user } = useAuth();
  const { city, currentWeather } = useWeather();
  const { addToast } = useToast();

  const [advisories, setAdvisories] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const fetchAdvisoriesAndCrops = async () => {
    setLoading(true);
    try {
      const [advRes, cropRes] = await Promise.all([
        advisoryAPI.getAdvisories(),
        cropAPI.getCrops()
      ]);
      if (advRes.data.success) {
        setAdvisories(advRes.data.advisories || []);
      }
      if (cropRes.data.success) {
        setCrops(cropRes.data.crops || []);
      }
    } catch (err) {
      addToast('Failed to load advisories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisoriesAndCrops();
  }, []);

  const handleGenerateLiveAdvisory = async () => {
    setGenerating(true);
    try {
      const res = await advisoryAPI.generateAdvisory({ city });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchAdvisoriesAndCrops();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error triggering advisory engine.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await advisoryAPI.updateStatus(id, status);
      if (res.data.success) {
        setAdvisories(advisories.map((a) => (a._id === id ? { ...a, status } : a)));
        addToast(`Advisory marked as ${status}.`, 'info');
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  const priorityStyles = {
    High: 'bg-rose-100 text-rose-800 border-rose-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };

  // Filter logic
  const filteredAdvisories = advisories.filter((adv) => {
    const matchesCrop = selectedCropFilter === 'All' || adv.cropName === selectedCropFilter;
    const matchesPriority = selectedPriority === 'All' || adv.priority === selectedPriority;
    return matchesCrop && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Automated Agronomic Advisory Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Crop-Specific Field Guidance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, rule-based field advisories synthesized from real-time atmospheric variables and crop phenology.
          </p>
        </div>

        <button
          onClick={handleGenerateLiveAdvisory}
          disabled={generating}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Evaluating Engine...' : 'Run Advisory Engine Now'}</span>
        </button>
      </div>

      {/* Atmospheric Engine Input Parameter Banner */}
      {currentWeather && (
        <div className="agri-card p-4 bg-emerald-950 text-white flex flex-wrap items-center justify-between gap-3 text-xs border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-emerald-200">Advisory Engine Feeding Telemetry:</span>
            <span className="text-white font-semibold">{city}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-emerald-300">
            <span>🌡️ Temp: <b className="text-white">{currentWeather.temperature}°C</b></span>
            <span>💧 Humidity: <b className="text-white">{currentWeather.humidity}%</b></span>
            <span>💨 Wind: <b className="text-white">{currentWeather.windSpeed} km/h</b></span>
            <span>🌧️ Rain: <b className="text-white">{currentWeather.rainfall || 0} mm</b></span>
            <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-mono text-emerald-100">
              {currentWeather.dataSource}
            </span>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Advisories"
          value={advisories.length}
          subtitle="System recommendations active"
          icon={Lightbulb}
          color="amber"
        />
        <MetricCard
          title="High Priority Actions"
          value={advisories.filter((a) => a.priority === 'High').length}
          subtitle="Critical interventions required"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Monitored Crops"
          value={crops.length}
          subtitle="Configured field plots"
          icon={Sprout}
          color="emerald"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter by Crop:</span>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
          >
            <option value="All">All Crops</option>
            {crops.map((c) => (
              <option key={c._id} value={c.cropName}>
                {c.cropName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700">Priority:</span>
          <div className="flex items-center gap-1">
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedPriority === p
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advisories Feed */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading crop advisories...</div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <Lightbulb className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No advisories match current filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Run Advisory Engine Now" to trigger live meteorological evaluation for your registered crops.
          </p>
          <button
            onClick={handleGenerateLiveAdvisory}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Evaluate Engine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAdvisories.map((adv) => (
            <div key={adv._id} className="agri-card p-5 space-y-3 relative overflow-hidden flex flex-col justify-between">
              <div>
                {/* Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                        🌾 {adv.cropName} ({adv.growthStage})
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {adv.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {adv.advisoryTitle}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${priorityStyles[adv.priority] || priorityStyles.Medium}`}>
                    {adv.priority} Priority
                  </span>
                </div>

                {/* Triggering Atmospheric Condition */}
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                  <Wind className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">Atmospheric Trigger:</span>
                    <span className="text-[11px]">{adv.weatherCondition}</span>
                  </div>
                </div>

                {/* Agronomic Description */}
                <p className="text-xs text-slate-700 leading-relaxed mt-2.5">
                  {adv.description}
                </p>

                {/* Recommended Field Action */}
                <div className="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-emerald-900 block text-[11px] uppercase tracking-wide">
                      Recommended Field Action:
                    </span>
                    <span className="text-xs leading-relaxed">{adv.recommendedAction}</span>
                  </div>
                </div>
              </div>

              {/* Footer Bar: Date & Status Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(adv.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600">
                    Status: {adv.status}
                  </span>
                  {adv.status !== 'Acknowledged' && (
                    <button
                      onClick={() => handleUpdateStatus(adv._id, 'Acknowledged')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px] shadow-2xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      Mark Acknowledged
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropAdvisoryPage;
