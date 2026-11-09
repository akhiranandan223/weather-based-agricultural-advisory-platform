import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import {
  Shield,
  Users,
  Sprout,
  Lightbulb,
  HelpCircle,
  Activity,
  CloudSun,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  RefreshCw,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // User management filter state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Edit user modal state
  const [editUserModal, setEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    role: 'farmer',
    isActive: true,
    district: '',
    state: ''
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getAnalytics()
      ]);

      if (dashRes.data.success) {
        setStats(dashRes.data.stats);
        setLogs(dashRes.data.recentLogs || []);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch (err) {
      addToast('Failed to load administrator dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      district: u.district || 'Warangal',
      state: u.state || 'Telangana'
    });
    setEditUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await adminAPI.updateUser(editingUser._id, userFormData);
      if (res.data.success) {
        setUsers(users.map((u) => (u._id === editingUser._id ? { ...u, ...userFormData } : u)));
        addToast(`User ${userFormData.name} updated successfully!`, 'success');
        setEditUserModal(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating user.', 'error');
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      const res = await adminAPI.updateUser(targetUser._id, {
        isActive: !targetUser.isActive
      });
      if (res.data.success) {
        setUsers(users.map((u) => (u._id === targetUser._id ? { ...u, isActive: !targetUser.isActive } : u)));
        addToast(`Account for ${targetUser.name} ${!targetUser.isActive ? 'activated' : 'deactivated'}.`, 'info');
      }
    } catch (err) {
      addToast('Error toggling user status.', 'error');
    }
  };

  // Filter users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.district && u.district.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Analytics Chart Data
  const cropDistData = {
    labels: (analytics?.cropDistribution || []).map((c) => c._id),
    datasets: [
      {
        data: (analytics?.cropDistribution || []).map((c) => c.count),
        backgroundColor: [
          '#2d6a4f',
          '#52b788',
          '#74c69d',
          '#b7e4c7',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#3b82f6'
        ],
        borderWidth: 2
      }
    ]
  };

  const queryStatusData = {
    labels: (analytics?.queryBreakdown || []).map((q) => q._id),
    datasets: [
      {
        label: 'Queries',
        data: (analytics?.queryBreakdown || []).map((q) => q.count),
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
        borderRadius: 6
      }
    ]
  };

  if (loading) {
    return <div className="text-center py-16 text-xs font-semibold text-slate-500">Loading administrator control center...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            System Administration & Platform Governance
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Admin Dashboard & Ecosystem Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time system metrics, manage user role permissions, track API usage, and inspect security audit logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All Metrics</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total User Accounts"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalFarmers || 0} Farmers • ${stats?.totalExperts || 0} Experts`}
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Registered Crops"
          value={stats?.totalCrops || 0}
          subtitle="Portfolio plots monitored"
          icon={Sprout}
          color="amber"
        />
        <MetricCard
          title="Generated Advisories"
          value={stats?.totalAdvisories || 0}
          subtitle="Agronomic recommendations"
          icon={Lightbulb}
          color="blue"
        />
        <MetricCard
          title="Weather API Calls"
          value={stats?.weatherApiCount || 0}
          subtitle="Cached observations & feeds"
          icon={CloudSun}
          color="purple"
        />
      </div>

      {/* System Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            Registered Crop Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Aggregated crop acreage and distribution across farming zones.
          </p>
          <div className="h-60 flex items-center justify-center">
            {cropDistData.labels.length > 0 ? (
              <Doughnut data={cropDistData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p className="text-xs text-slate-400">No crop distribution data available.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-700" />
            Farmer Consultation Query Statuses
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Progress of queries through Pending, In Progress, Answered, and Closed stages.
          </p>
          <div className="h-60 flex items-center justify-center">
            {queryStatusData.labels.length > 0 ? (
              <Bar data={queryStatusData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p className="text-xs text-slate-400">No query data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* User Accounts Management Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              User Accounts & Role Permissions ({filteredUsers.length})
            </h3>
            <p className="text-xs text-slate-500">
              Manage farmers, agricultural scientists, and system administrators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="expert">Experts</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : u.role === 'expert'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {u.district || 'Warangal'}, {u.state || 'Telangana'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2 py-1 font-semibold rounded text-[11px] ${
                        u.isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Activity Audit Logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          Recent Platform Activity Audit Trail
        </h3>

        <div className="space-y-2">
          {logs.slice(0, 8).map((log) => (
            <div
              key={log._id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                  {log.module}
                </span>
                <span className="font-bold text-slate-900">{log.action}</span>
                <span className="text-slate-600 truncate max-w-md">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={editUserModal}
        onClose={() => setEditUserModal(false)}
        title={`Edit User Account: ${editingUser?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">User Role</label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
            >
              <option value="farmer">Farmer</option>
              <option value="expert">Agriculture Expert</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={userFormData.district}
                onChange={(e) => setUserFormData({ ...userFormData, district: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={userFormData.state}
                onChange={(e) => setUserFormData({ ...userFormData, state: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={userFormData.isActive}
              onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-800">
              Account Active & Authorized to Log In
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditUserModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm"
            >
              Save User Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
