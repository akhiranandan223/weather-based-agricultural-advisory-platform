import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expertAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import {
  GraduationCap,
  HelpCircle,
  Clock,
  CheckCircle,
  MessageSquare,
  Search,
  Filter,
  Send,
  RefreshCw,
  User,
  Sprout,
  MapPin,
  CloudSun
} from 'lucide-react';

const ExpertDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Response Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyData, setReplyData] = useState({
    message: '',
    recommendedAction: '',
    weatherConsiderations: '',
    status: 'Answered'
  });

  const fetchExpertData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes] = await Promise.all([
        expertAPI.getStats(),
        expertAPI.getQueries({ limit: 50 })
      ]);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (queriesRes.data.success) {
        setQueries(queriesRes.data.queries || []);
      }
    } catch (err) {
      addToast('Failed to load expert desk data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertData();
  }, []);

  const handleOpenReplyModal = (q) => {
    setSelectedQuery(q);
    setReplyData({
      message: '',
      recommendedAction: '',
      weatherConsiderations: 'Spray only during calm wind conditions (< 12 km/h).',
      status: 'Answered'
    });
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyData.message) {
      addToast('Please enter an expert recommendation message.', 'warning');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await expertAPI.submitResponse({
        queryId: selectedQuery._id,
        message: replyData.message,
        recommendedAction: replyData.recommendedAction,
        weatherConsiderations: replyData.weatherConsiderations,
        status: replyData.status
      });

      if (res.data.success) {
        setQueries(queries.map((q) => (q._id === selectedQuery._id ? res.data.query : q)));
        addToast('Agronomic advisory response transmitted to farmer successfully!', 'success');
        setReplyModalOpen(false);
        // Refresh stats
        const statsRes = await expertAPI.getStats();
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting response.', 'error');
    } finally {
      setSubmittingReply(false);
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

  // Filter queries
  const filteredQueries = queries.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.problemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesCrop = cropFilter === 'All' || q.cropName === cropFilter;
    return matchesSearch && matchesStatus && matchesCrop;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
            Agricultural Research & Extension Desk
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Expert Advisory Console & Query Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review field queries submitted by farmers, inspect microclimate data, and prescribe evidence-based agronomic recommendations.
          </p>
        </div>

        <button
          onClick={fetchExpertData}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Farmer Inquiries"
          value={stats?.totalQueries || 0}
          subtitle="Cumulative submitted cases"
          icon={HelpCircle}
          color="purple"
        />
        <MetricCard
          title="Pending Action"
          value={stats?.pendingQueries || 0}
          subtitle="Awaiting scientific response"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="In Progress"
          value={stats?.inProgressQueries || 0}
          subtitle="Under agronomic review"
          icon={MessageSquare}
          color="blue"
        />
        <MetricCard
          title="Resolved & Answered"
          value={stats?.answeredQueries || 0}
          subtitle={`${stats?.responseRate || 0}% Overall response rate`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer, crop, symptom..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Answered">Answered</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Crop:</span>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
            >
              <option value="All">All Crops</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Chilli">Chilli</option>
              <option value="Maize">Maize</option>
              <option value="Tomato">Tomato</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Queue List */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading query queue...</div>
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching queries found in queue</h3>
          <p className="text-xs text-slate-500">All submitted farmer consultations have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <div key={query._id} className="agri-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200">
                    🌾 {query.cropName} ({query.growthStage})
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgencyStyles[query.urgency] || urgencyStyles.Medium}`}>
                    Urgency: {query.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusStyles[query.status]}`}>
                    ● {query.status}
                  </span>
                  <button
                    onClick={() => handleOpenReplyModal(query)}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>{query.responses?.length > 0 ? 'Add Response' : 'Reply to Farmer'}</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{query.title}</h3>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {query.problemDescription}
                </p>
              </div>

              {/* Farmer and Weather Metadata Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  Farmer: {query.farmerName} {query.farmerPhone ? `(${query.farmerPhone})` : ''}
                </span>

                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {query.farmingLocation?.village}, {query.farmingLocation?.district}, {query.farmingLocation?.state}
                </span>

                {query.weatherContext && (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                    Observed: {query.weatherContext.temperature}°C • {query.weatherContext.condition}
                  </span>
                )}
              </div>

              {/* Existing Responses Thread */}
              {query.responses && query.responses.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Recorded Responses ({query.responses.length})
                  </h4>
                  {query.responses.map((resp, idx) => (
                    <div key={idx} className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-purple-900 font-bold">
                        <span>{resp.expertName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(resp.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{resp.message}</p>
                      {resp.recommendedAction && (
                        <p className="text-emerald-800 font-semibold">
                          <b>Action:</b> {resp.recommendedAction}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedQuery && (
        <Modal
          isOpen={replyModalOpen}
          onClose={() => setReplyModalOpen(false)}
          title={`Prescribe Advisory for: ${selectedQuery.title}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block">Farmer Query:</span>
              <p className="text-slate-700 mt-1 italic">"{selectedQuery.problemDescription}"</p>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Crop: <b>{selectedQuery.cropName}</b></span>
                <span>Stage: <b>{selectedQuery.growthStage}</b></span>
                <span>Location: <b>{selectedQuery.farmingLocation?.district}</b></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expert Diagnostic & Agronomic Recommendation *
              </label>
              <textarea
                rows="4"
                required
                value={replyData.message}
                onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                placeholder="Provide clear scientific diagnosis and verified field steps. Avoid unsupported claims."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescribed Immediate Field Action
              </label>
              <input
                type="text"
                value={replyData.recommendedAction}
                onChange={(e) => setReplyData({ ...replyData, recommendedAction: e.target.value })}
                placeholder="e.g. Apply foliar spray of Planofix @ 4ml/15L water in early morning"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weather & Spray Considerations
              </label>
              <input
                type="text"
                value={replyData.weatherConsiderations}
                onChange={(e) => setReplyData({ ...replyData, weatherConsiderations: e.target.value })}
                placeholder="e.g. Postpone application if wind velocity exceeds 15 km/h"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Update Case Status
              </label>
              <select
                value={replyData.status}
                onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
              >
                <option value="Answered">Answered (Resolved)</option>
                <option value="In Progress">In Progress (Further Tests Requested)</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReply}
                className="px-5 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-sm"
              >
                {submittingReply ? 'Sending Advisory...' : 'Transmit Response'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExpertDashboardPage;
