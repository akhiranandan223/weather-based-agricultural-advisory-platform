import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { useToast } from '../context/ToastContext';
import { alertAPI } from '../services/api';
import Modal from '../components/Modal';
import {
  AlertTriangle,
  ShieldAlert,
  Plus,
  CheckCircle,
  Filter,
  MapPin,
  Clock,
  Radio,
  Flame,
  CloudRain,
  Wind,
  Droplets,
  Snowflake
} from 'lucide-react';

const WeatherAlertsPage = () => {
  const { user } = useAuth();
  const { city } = useWeather();
  const { addToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [filterOfficial, setFilterOfficial] = useState('All');

  // Modal State for Admin Broadcast
  const [modalOpen, setModalOpen] = useState(false);
  const [alertFormData, setAlertFormData] = useState({
    alertTitle: '',
    alertType: 'Heavy Rainfall',
    description: '',
    recommendedPrecaution: '',
    severity: 'High',
    isOfficial: true,
    location: {
      city: 'Warangal',
      state: 'Telangana',
      district: 'Warangal',
      village: 'All Villages'
    }
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertAPI.getAlerts();
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      addToast('Failed to load active weather alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (alertId) => {
    try {
      const res = await alertAPI.markRead(alertId);
      if (res.data.success) {
        setAlerts(alerts.map((a) => (a._id === alertId ? { ...a, isRead: true } : a)));
        addToast('Alert marked as read.', 'info');
      }
    } catch (err) {
      // ignore
    }
  };

  const handleCreateOfficialAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await alertAPI.createAlert(alertFormData);
      if (res.data.success) {
        setAlerts([res.data.alert, ...alerts]);
        addToast('Official agricultural weather alert broadcasted successfully!', 'success');
        setModalOpen(false);
        setAlertFormData({
          alertTitle: '',
          alertType: 'Heavy Rainfall',
          description: '',
          recommendedPrecaution: '',
          severity: 'High',
          isOfficial: true,
          location: {
            city: 'Warangal',
            state: 'Telangana',
            district: 'Warangal',
            village: 'All Villages'
          }
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error broadcasting alert.', 'error');
    }
  };

  const severityStyles = {
    High: 'bg-rose-100 text-rose-900 border-rose-300',
    Medium: 'bg-amber-100 text-amber-900 border-amber-300',
    Low: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'High Temperature':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'Heavy Rainfall':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'Strong Winds':
        return <Wind className="w-5 h-5 text-teal-600" />;
      case 'High Humidity':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'Low Temperature / Frost':
        return <Snowflake className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
    }
  };

  const filteredAlerts = alerts.filter((item) => {
    const matchesSev = selectedSeverity === 'All' || item.severity === selectedSeverity;
    const matchesOff =
      filterOfficial === 'All' ||
      (filterOfficial === 'Official' && item.isOfficial) ||
      (filterOfficial === 'AppGenerated' && !item.isOfficial);
    return matchesSev && matchesOff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            Early Warning Disaster Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Weather & Extreme Event Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated threshold triggers for heavy rainfall, gales, heatwaves, and official meteorological broadcasts.
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Official Alert</span>
          </button>
        )}
      </div>

      {/* Threshold Configuration Legend */}
      <div className="bg-slate-900 text-white p-4 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <ShieldAlert className="w-4 h-4" />
          <span>Configured Automated Agricultural Thresholds:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-300 text-[11px]">
          <span>🌧️ Heavy Rain &gt; 40mm</span>
          <span>🌡️ Extreme Heat &gt; 38°C</span>
          <span>💨 Gale Wind &gt; 30 km/h</span>
          <span>💧 High Humidity &gt; 85%</span>
          <span>❄️ Frost Cold &lt; 10°C</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Severity:</span>
          <div className="flex items-center gap-1">
            {['All', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedSeverity === sev
                    ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Source:</span>
          <div className="flex items-center gap-1">
            {['All', 'Official', 'AppGenerated'].map((src) => (
              <button
                key={src}
                onClick={() => setFilterOfficial(src)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterOfficial === src
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {src === 'All' ? 'All Alerts' : src === 'Official' ? '🏛️ Official IMD' : '🤖 System Rule'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active alerts at this time</h3>
          <p className="text-xs text-slate-500">
            Weather conditions in your farming zones are currently within safe operational limits.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`agri-card p-5 border-l-4 transition-all ${
                alert.severity === 'High'
                  ? 'border-l-rose-600'
                  : alert.severity === 'Medium'
                  ? 'border-l-amber-500'
                  : 'border-l-emerald-500'
              } ${alert.isRead ? 'opacity-80 bg-slate-50/50' : 'bg-white shadow-sm'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0">
                    {getAlertIcon(alert.alertType)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border text-rose-800 bg-rose-50 border-rose-200">
                        {alert.alertType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          alert.isOfficial
                            ? 'bg-purple-100 text-purple-900 border-purple-200 font-extrabold'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {alert.isOfficial ? '🏛️ Official Government / IMD Alert' : '🤖 Application-Generated Rule'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityStyles[alert.severity] || severityStyles.Medium}`}>
                        {alert.severity} Severity
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {alert.alertTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkRead(alert._id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>

              {/* Alert Body */}
              <p className="text-xs text-slate-700 leading-relaxed mt-2.5 ml-0 sm:ml-12">
                {alert.description}
              </p>

              {alert.recommendedPrecaution && (
                <div className="mt-3 ml-0 sm:ml-12 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-950 block text-[11px]">
                      Recommended Precaution:
                    </span>
                    <span className="leading-relaxed">{alert.recommendedPrecaution}</span>
                  </div>
                </div>
              )}

              {/* Footer info: Location & Date */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 ml-0 sm:ml-12">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Target: {alert.location?.city || 'Warangal'}, {alert.location?.district || 'Warangal District'}, {alert.location?.village || 'All Villages'}
                </span>

                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Issued: {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Broadcast Alert Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Broadcast Official Weather Alert"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateOfficialAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Headline *</label>
            <input
              type="text"
              required
              value={alertFormData.alertTitle}
              onChange={(e) => setAlertFormData({ ...alertFormData, alertTitle: e.target.value })}
              placeholder="e.g. Cyclone Warning: High Intensity Rainfall over Northern Telangana"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Category</label>
              <select
                value={alertFormData.alertType}
                onChange={(e) => setAlertFormData({ ...alertFormData, alertType: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Heavy Rainfall">Heavy Rainfall</option>
                <option value="High Temperature">High Temperature (Heatwave)</option>
                <option value="Low Temperature / Frost">Low Temperature / Frost</option>
                <option value="Strong Winds">Strong Winds / Gales</option>
                <option value="Low Rainfall / Drought">Low Rainfall / Drought</option>
                <option value="High Humidity">High Humidity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Level</label>
              <select
                value={alertFormData.severity}
                onChange={(e) => setAlertFormData({ ...alertFormData, severity: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
              >
                <option value="High">High (Immediate Danger)</option>
                <option value="Medium">Medium (Precautionary)</option>
                <option value="Low">Low (Informational)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Situation Description *</label>
            <textarea
              rows="3"
              required
              value={alertFormData.description}
              onChange={(e) => setAlertFormData({ ...alertFormData, description: e.target.value })}
              placeholder="Describe meteorology, expected precipitation intensity, or temperature rise..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Precaution</label>
            <textarea
              rows="2"
              value={alertFormData.recommendedPrecaution}
              onChange={(e) => setAlertFormData({ ...alertFormData, recommendedPrecaution: e.target.value })}
              placeholder="e.g. Unblock drains, shelter livestock, postpone pesticide spraying..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-lg shadow-sm"
            >
              Broadcast Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeatherAlertsPage;
