import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { useToast } from '../context/ToastContext';
import { queryAPI, cropAPI } from '../services/api';
import Modal from '../components/Modal';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  Calendar,
  Send,
  Filter
} from 'lucide-react';

const FarmerQueryPage = () => {
  const { user } = useAuth();
  const { city } = useWeather();
  const { addToast } = useToast();

  const [queries, setQueries] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // New Query Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [queryFormData, setQueryFormData] = useState({
    title: '',
    cropName: 'Rice',
    cropId: '',
    growthStage: 'Vegetative',
    urgency: 'Medium',
    problemDescription: '',
    farmingLocation: {
      state: user?.state || 'Telangana',
      district: user?.district || 'Warangal',
      village: user?.village || 'Ananthasagar'
    }
  });

  // Thread detail view modal state
  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState(null);

  const fetchQueriesAndCrops = async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        queryAPI.getQueries(),
        cropAPI.getCrops()
      ]);
      if (qRes.data.success) {
        setQueries(qRes.data.queries || []);
      }
      if (cRes.data.success) {
        setCrops(cRes.data.crops || []);
        if (cRes.data.crops && cRes.data.crops.length > 0) {
          setQueryFormData((prev) => ({
            ...prev,
            cropName: cRes.data.crops[0].cropName,
            cropId: cRes.data.crops[0]._id,
            growthStage: cRes.data.crops[0].growthStage
          }));
        }
      }
    } catch (err) {
      addToast('Failed to load consultation queries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueriesAndCrops();
  }, []);

  const handleCropSelectChange = (e) => {
    const selectedCropId = e.target.value;
    const selectedObj = crops.find((c) => c._id === selectedCropId);
    if (selectedObj) {
      setQueryFormData({
        ...queryFormData,
        cropId: selectedCropId,
        cropName: selectedObj.cropName,
        growthStage: selectedObj.growthStage
      });
    } else {
      setQueryFormData({
        ...queryFormData,
        cropId: '',
        cropName: 'General / Other',
        growthStage: 'Vegetative'
      });
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!queryFormData.title || !queryFormData.problemDescription) {
      addToast('Please provide both query title and detailed description.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await queryAPI.submitQuery(queryFormData);
      if (res.data.success) {
        setQueries([res.data.query, ...queries]);
        addToast('Query successfully dispatched to agricultural scientists!', 'success');
        setModalOpen(false);
        setQueryFormData({
          title: '',
          cropName: crops[0]?.cropName || 'Rice',
          cropId: crops[0]?._id || '',
          growthStage: crops[0]?.growthStage || 'Vegetative',
          urgency: 'Medium',
          problemDescription: '',
          farmingLocation: {
            state: user?.state || 'Telangana',
            district: user?.district || 'Warangal',
            village: user?.village || 'Ananthasagar'
          }
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting query.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyles = {
    Pending: 'bg-amber-100 text-amber-900 border-amber-300',
    'In Progress': 'bg-blue-100 text-blue-900 border-blue-300',
    Answered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const urgencyStyles = {
    Urgent: 'bg-rose-100 text-rose-800 border-rose-300',
    High: 'bg-amber-100 text-amber-800 border-amber-300',
    Medium: 'bg-sky-100 text-sky-800 border-sky-300',
    Low: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const filteredQueries = queries.filter((q) => {
    return selectedStatus === 'All' || q.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Agricultural Extension Desk
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Farmer Consultation & Expert Support
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit crop queries with field and weather context directly to qualified agronomists and agricultural research scientists.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ask New Question</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Status:</span>
          <div className="flex items-center gap-1">
            {['All', 'Pending', 'In Progress', 'Answered', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queries Feed */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading queries...</div>
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No consultation queries found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Need advice on pest control, blossom drop, or irrigation scheduling? Submit a query above.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Ask Agronomist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <div
              key={query._id}
              className="agri-card p-5 space-y-3 hover:border-emerald-300 transition-all cursor-pointer"
              onClick={() => {
                setActiveQuery(query);
                setThreadModalOpen(true);
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    🌾 {query.cropName} ({query.growthStage})
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgencyStyles[query.urgency] || urgencyStyles.Medium}`}>
                    Urgency: {query.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusStyles[query.status] || statusStyles.Pending}`}>
                    ● {query.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{query.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {query.problemDescription}
                </p>
              </div>

              {/* Latest Expert Response Preview */}
              {query.responses && query.responses.length > 0 ? (
                <div className="mt-3 p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs">
                  <div className="flex items-center justify-between text-purple-900 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-purple-700" />
                      {query.responses[query.responses.length - 1].expertName} ({query.responses[query.responses.length - 1].expertQualification || 'Scientist'})
                    </span>
                    <span className="text-[10px] text-purple-700">
                      {new Date(query.responses[query.responses.length - 1].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {query.responses[query.responses.length - 1].message}
                  </p>
                  {query.responses[query.responses.length - 1].recommendedAction && (
                    <p className="mt-1.5 text-emerald-800 font-bold bg-white/70 p-1.5 rounded-lg border border-purple-100">
                      Recommended Action: {query.responses[query.responses.length - 1].recommendedAction}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting review by an agricultural extension scientist. Typical response time &lt; 24h.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Query Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Consultation Query to Agriculture Experts"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitQuery} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Query Subject / Title *</label>
            <input
              type="text"
              required
              value={queryFormData.title}
              onChange={(e) => setQueryFormData({ ...queryFormData, title: e.target.value })}
              placeholder="e.g. Yellowing of lower cotton leaves and squaring drop"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Registered Crop</label>
              <select
                value={queryFormData.cropId}
                onChange={handleCropSelectChange}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold"
              >
                {crops.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.cropName} ({c.variety || 'Hybrid'})
                  </option>
                ))}
                <option value="">Other / General Question</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
              <select
                value={queryFormData.urgency}
                onChange={(e) => setQueryFormData({ ...queryFormData, urgency: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
              >
                <option value="Urgent">Urgent (Immediate Crop Threat)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low / General Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Problem Description *
            </label>
            <textarea
              rows="4"
              required
              value={queryFormData.problemDescription}
              onChange={(e) => setQueryFormData({ ...queryFormData, problemDescription: e.target.value })}
              placeholder="Detail visual symptoms, soil moisture levels, recent pesticide or fertilizer sprays, and how many days this has persisted..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
            ✓ The system will automatically attach your farm location ({user?.district || 'Warangal'}) and latest live weather snapshot to help agronomists diagnose accurately.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Send Query to Experts'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Query Detail / Response Thread Modal */}
      {activeQuery && (
        <Modal
          isOpen={threadModalOpen}
          onClose={() => setThreadModalOpen(false)}
          title={`Query Consultation Thread #${activeQuery._id.slice(-6)}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  🌾 {activeQuery.cropName} ({activeQuery.growthStage})
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeQuery.title}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusStyles[activeQuery.status]}`}>
                {activeQuery.status}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Farmer Problem Statement:</span>
              {activeQuery.problemDescription}
            </div>

            {/* Weather Snapshot Context */}
            {activeQuery.weatherContext && (
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                <span>📍 Location: {activeQuery.farmingLocation?.district || 'Warangal'}</span>
                <span>🌡️ Weather at query: {activeQuery.weatherContext.temperature}°C ({activeQuery.weatherContext.condition})</span>
              </div>
            )}

            {/* Responses Thread */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900">Expert Responses ({activeQuery.responses?.length || 0})</h4>

              {activeQuery.responses?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No responses posted yet. Under scientific review.</p>
              ) : (
                activeQuery.responses.map((resp, idx) => (
                  <div key={idx} className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-purple-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-purple-700" />
                        {resp.expertName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(resp.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed">{resp.message}</p>

                    {resp.recommendedAction && (
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 font-semibold">
                        <b>Action:</b> {resp.recommendedAction}
                      </div>
                    )}

                    {resp.weatherConsiderations && (
                      <p className="text-[11px] text-slate-600">
                        <b>Weather Considerations:</b> {resp.weatherConsiderations}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setThreadModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Close Thread
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FarmerQueryPage;
