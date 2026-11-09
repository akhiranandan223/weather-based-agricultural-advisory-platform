import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cropAPI } from '../services/api';
import { getGrowthStagesForCrop } from '../constants/cropGrowthStages';
import Modal from '../components/Modal';
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';

const CropManagementPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    cropName: 'Rice',
    cropCategory: 'Cereals',
    variety: '',
    farmArea: 2.5,
    areaUnit: 'acres',
    sowingDate: new Date().toISOString().split('T')[0],
    growthStage: 'Vegetative',
    soilType: 'Red Sandy Loam',
    irrigationMethod: 'Drip Irrigation',
    notes: '',
    status: 'Active'
  });

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await cropAPI.getCrops();
      if (res.data.success) {
        setCrops(res.data.crops || []);
      }
    } catch (err) {
      addToast('Failed to load crop records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      cropName: 'Rice',
      cropCategory: 'Cereals',
      variety: 'BPT 5204 (Samba Mahsuri)',
      farmArea: 3.0,
      areaUnit: 'acres',
      sowingDate: new Date().toISOString().split('T')[0],
      growthStage: 'Vegetative',
      soilType: 'Red Sandy Loam',
      irrigationMethod: 'Drip Irrigation',
      notes: '',
      status: 'Active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (crop) => {
    setEditingId(crop._id);
    setFormData({
      cropName: crop.cropName,
      cropCategory: crop.cropCategory || 'Cereals',
      variety: crop.variety || '',
      farmArea: crop.farmArea,
      areaUnit: crop.areaUnit || 'acres',
      sowingDate: crop.sowingDate ? crop.sowingDate.split('T')[0] : '',
      growthStage: crop.growthStage,
      soilType: crop.soilType || 'Red Sandy Loam',
      irrigationMethod: crop.irrigationMethod || 'Drip Irrigation',
      notes: crop.notes || '',
      status: crop.status || 'Active'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await cropAPI.updateCrop(editingId, formData);
        if (res.data.success) {
          setCrops(crops.map((c) => (c._id === editingId ? res.data.crop : c)));
          addToast('Crop record updated successfully!', 'success');
        }
      } else {
        const res = await cropAPI.createCrop(formData);
        if (res.data.success) {
          setCrops([res.data.crop, ...crops]);
          addToast('Crop registered successfully and live advisories triggered!', 'success');
        }
      }
      setModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing crop.', 'error');
    }
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop? This will also archive related advisories.')) {
      return;
    }
    try {
      const res = await cropAPI.deleteCrop(cropId);
      if (res.data.success) {
        setCrops(crops.filter((c) => c._id !== cropId));
        addToast('Crop record removed successfully.', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete crop.', 'error');
    }
  };

  // Filter crops
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.variety && crop.variety.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (crop.notes && crop.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || crop.cropCategory === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Cereals', 'Fiber Crop', 'Oilseeds', 'Vegetables', 'Cash Crops', 'Spices', 'Pulses'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Crop Lifecycle & Sowing Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Agricultural Crop Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain crop phenological stages, sowing calendars, and plot parameters for automated advisory generation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Crop</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by crop, variety, notes..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading crops...</div>
      ) : filteredCrops.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <Sprout className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No crop records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'Try clearing your search filters.' : 'Register your first crop above to receive tailored weather advisories.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Register Crop Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => (
            <div key={crop._id} className="agri-card p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {crop.cropCategory || 'Cereals'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{crop.cropName}</h3>
                  <p className="text-xs text-slate-500">{crop.variety || 'Standard Hybrid'}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(crop)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Crop"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCrop(crop._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Crop Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cultivation Area</span>
                  <span className="font-bold text-slate-800">{crop.farmArea} {crop.areaUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sowing Date</span>
                  <span className="font-bold text-slate-800">
                    {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Soil Category</span>
                  <span className="font-bold text-slate-800">{crop.soilType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Irrigation Mode</span>
                  <span className="font-bold text-slate-800">{crop.irrigationMethod}</span>
                </div>
              </div>

              {/* Growth Stage Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/70 px-2.5 py-1 rounded-md border border-emerald-200">
                  🌱 Stage: {crop.growthStage}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {crop.status || 'Active'}
                </span>
              </div>

              {crop.notes && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{crop.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Registered Crop Information' : 'Register New Crop for Agricultural Advisory'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Name *</label>
              <select
                name="cropName"
                value={formData.cropName}
                onChange={(e) => {
                  const cropName = e.target.value;
                  const stages = getGrowthStagesForCrop(cropName);
                  setFormData({
                    ...formData,
                    cropName,
                    growthStage: stages.includes(formData.growthStage) ? formData.growthStage : 'Vegetative'
                  });
                }}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
              >
                <option value="Rice">Rice (Paddy)</option>
                <option value="Cotton">Cotton (Bt Cotton)</option>
                <option value="Maize">Maize (Corn)</option>
                <option value="Wheat">Wheat</option>
                <option value="Groundnut">Groundnut (Peanut)</option>
                <option value="Chilli">Chilli (Mirchi)</option>
                <option value="Tomato">Tomato</option>
                <option value="Soybean">Soybean</option>
                <option value="Pulses / Gram">Pulses / Red Gram / Bengal Gram</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Other">Other Crop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Category</label>
              <select
                name="cropCategory"
                value={formData.cropCategory}
                onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Cereals">Cereals</option>
                <option value="Fiber Crop">Fiber Crop</option>
                <option value="Oilseeds">Oilseeds</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Cash Crops">Cash Crops</option>
                <option value="Spices">Spices</option>
                <option value="Pulses">Pulses</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variety / Hybrid</label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g. BPT 5204 / RCH-2"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Area *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.farmArea}
                onChange={(e) => setFormData({ ...formData, farmArea: Number(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={formData.areaUnit}
                onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="guntas">Guntas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sowing Date *</label>
              <input
                type="date"
                required
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage *</label>
              <select
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
              >
                {getGrowthStagesForCrop(formData.cropName).map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Black Cotton">Black Cotton</option>
                <option value="Alluvial">Alluvial</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Laterite">Laterite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Mode</label>
              <select
                value={formData.irrigationMethod}
                onChange={(e) => setFormData({ ...formData, irrigationMethod: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Canal / Furrow">Canal / Furrow</option>
                <option value="Borewell / Tube Well">Borewell</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Field border bund planted with marigolds"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
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
              className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm"
            >
              {editingId ? 'Save Changes' : 'Register Crop'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CropManagementPage;
