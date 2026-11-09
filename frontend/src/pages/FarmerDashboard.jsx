import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { cropAPI, advisoryAPI, alertAPI, queryAPI } from '../services/api';
import WeatherWidget from '../components/WeatherWidget';
import MetricCard from '../components/MetricCard';
import {
  Sprout,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Droplets,
  Wind
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { city, currentWeather } = useWeather();

  const [crops, setCrops] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [cropRes, advRes, alertRes, qRes] = await Promise.allSettled([
          cropAPI.getCrops(),
          advisoryAPI.getAdvisories({ limit: 4 }),
          alertAPI.getAlerts({ district: user?.district || city }),
          queryAPI.getQueries({ limit: 3 })
        ]);

        if (cropRes.status === 'fulfilled' && cropRes.value.data.success) {
          setCrops(cropRes.value.data.crops || []);
        }
        if (advRes.status === 'fulfilled' && advRes.value.data.success) {
          setAdvisories(advRes.value.data.advisories || []);
        }
        if (alertRes.status === 'fulfilled' && alertRes.value.data.success) {
          setAlerts(alertRes.value.data.alerts || []);
        }
        if (qRes.status === 'fulfilled' && qRes.value.data.success) {
          setQueries(qRes.value.data.queries || []);
        }
      } catch (err) {
        console.error('Failed to load farmer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, city]);

  const priorityStyles = {
    High: 'bg-rose-100 text-rose-800 border-rose-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const statusStyles = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    Answered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Closed: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Farmer Control Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Namaskaram, {user?.name || 'Farmer'}! 🌾
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm Location: <b>{user?.village || 'Ananthasagar'}, {user?.district || 'Warangal'}, {user?.state || 'Telangana'}</b></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/crops"
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sown Crop
          </Link>
          <Link
            to="/queries"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Ask Agronomist
          </Link>
        </div>
      </div>

      {/* Weather Station Widget */}
      <WeatherWidget />

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Crops"
          value={crops.length}
          subtitle={`${crops.reduce((acc, c) => acc + (c.farmArea || 0), 0).toFixed(1)} Acres under Cultivation`}
          icon={Sprout}
          color="emerald"
        />
        <MetricCard
          title="Generated Advisories"
          value={advisories.length}
          subtitle="Real-time agronomic guidance"
          icon={Lightbulb}
          color="amber"
        />
        <MetricCard
          title="Active Alerts"
          value={alerts.length}
          subtitle={`${alerts.filter(a => a.severity === 'High').length} High Severity Warnings`}
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Consultation Queries"
          value={queries.length}
          subtitle={`${queries.filter(q => q.status === 'Answered').length} Answered by Experts`}
          icon={HelpCircle}
          color="blue"
        />
      </div>

      {/* Active Weather Alerts Carousel / Alert Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Active Agro-Climatic Alerts for Your District
            </h2>
            <Link to="/alerts" className="text-xs font-bold text-emerald-700 hover:underline">
              View All Alerts →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert._id}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-slate-800 flex items-start gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950">{alert.alertTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                      {alert.severity} Severity
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 leading-relaxed">{alert.description}</p>
                  {alert.recommendedPrecaution && (
                    <p className="mt-2 text-rose-900 font-semibold bg-white/70 p-2 rounded-lg border border-rose-100">
                      💡 Precaution: {alert.recommendedPrecaution}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Registered Crops & Latest Crop Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Crops Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              My Registered Crops
            </h2>
            <Link to="/crops" className="text-xs font-bold text-emerald-700 hover:underline">
              Manage Crops →
            </Link>
          </div>

          <div className="space-y-3">
            {crops.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
                <Sprout className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No registered crops yet.</p>
                <Link
                  to="/crops"
                  className="mt-3 inline-block px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Register First Crop
                </Link>
              </div>
            ) : (
              crops.slice(0, 3).map((crop) => (
                <div key={crop._id} className="agri-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      {crop.cropName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{crop.cropName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {crop.variety} • {crop.farmArea} {crop.areaUnit}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Stage: {crop.growthStage}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/advisory?cropId=${crop._id}`}
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors"
                    title="View Advisories for this crop"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Latest Crop Advisories */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Latest Agricultural Advisories
            </h2>
            <Link to="/advisory" className="text-xs font-bold text-emerald-700 hover:underline">
              All Advisories →
            </Link>
          </div>

          <div className="space-y-3">
            {advisories.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
                <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No active advisories generated yet.</p>
                <Link
                  to="/advisory"
                  className="mt-3 inline-block px-3 py-1.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg"
                >
                  Generate Live Advisory
                </Link>
              </div>
            ) : (
              advisories.slice(0, 3).map((adv) => (
                <div key={adv._id} className="agri-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        {adv.cropName} • {adv.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {adv.advisoryTitle}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityStyles[adv.priority] || priorityStyles.Medium}`}>
                      {adv.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {adv.description}
                  </p>

                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-semibold text-emerald-900 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><b>Action:</b> {adv.recommendedAction}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Expert Consultation Queries Thread */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            Recent Expert Consultation Questions
          </h2>
          <Link to="/queries" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Queries →
          </Link>
        </div>

        {queries.length === 0 ? (
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No queries submitted yet. Encountering any pest, disease, or watering doubt? Click <b>Ask Agronomist</b> above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queries.map((q) => (
              <div key={q._id} className="agri-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900">
                    🌾 {q.cropName} ({q.growthStage})
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyles[q.status] || statusStyles.Pending}`}>
                    {q.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800">{q.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{q.problemDescription}</p>

                {q.responses && q.responses.length > 0 && (
                  <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-900">
                    <p className="font-bold flex items-center gap-1">
                      🔬 Expert Advice ({q.responses[q.responses.length - 1].expertName}):
                    </p>
                    <p className="mt-1 text-slate-700">
                      {q.responses[q.responses.length - 1].message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
