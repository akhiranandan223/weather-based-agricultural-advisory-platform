import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { farmerAPI, cropAPI } from '../services/api';
import { getGrowthStagesForCrop } from '../constants/cropGrowthStages';
import Modal from '../components/Modal';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Sprout,
  Save,
  Plus,
  Trash2,
  Edit2,
  Compass,
  Layers,
  Droplets,
  Calendar
} from 'lucide-react';

const FarmerProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    state: 'Telangana',
    district: 'Warangal',
    village: 'Ananthasagar',
    farmSize: 5.0,
    landUnit: 'acres',
    soilType: 'Red Sandy Loam',
    irrigationMethod: 'Drip Irrigation',
    experienceYears: 10,
    notes: ''
  });

  const [crops, setCrops] = useState([]);

  // Crop Add/Edit Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropFormData, setCropFormData] = useState({
    cropName: 'Rice',
    cropCategory: 'Cereals',
    variety: '',
    farmArea: 2.0,
    areaUnit: 'acres',
    sowingDate: new Date().toISOString().split('T')[0],
    growthStage: 'Vegetative',
    soilType: 'Red Sandy Loam',
    irrigationMethod: 'Drip Irrigation',
    notes: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await farmerAPI.getProfile();
        if (res.data.success) {
          const u = res.data.user;
          const p = res.data.farmerProfile || {};
          setProfileData({
            name: u.name || '',
            phone: u.phone || '',
            state: u.state || 'Telangana',
            district: u.district || 'Warangal',
            village: u.village || 'Ananthasagar',
            farmSize: p.farmSize || 5.0,
            landUnit: p.landUnit || 'acres',
            soilType: p.soilType || 'Red Sandy Loam',
            irrigationMethod: p.irrigationMethod || 'Drip Irrigation',
            experienceYears: p.experienceYears || 5,
            notes: p.notes || ''
          });
          setCrops(res.data.crops || []);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await farmerAPI.updateProfile(profileData);
      if (res.data.success) {
        updateUserProfile(res.data.user);
        addToast('Farmer profile and land parameters updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Crop CRUD Handlers
  const handleOpenAddCrop = () => {
    setEditingCropId(null);
    setCropFormData({
      cropName: 'Rice',
      cropCategory: 'Cereals',
      variety: 'BPT 5204',
      farmArea: 2.0,
      areaUnit: 'acres',
      sowingDate: new Date().toISOString().split('T')[0],
      growthStage: 'Vegetative',
      soilType: profileData.soilType,
      irrigationMethod: profileData.irrigationMethod,
      notes: ''
    });
    setCropModalOpen(true);
  };

  const handleOpenEditCrop = (crop) => {
    setEditingCropId(crop._id);
    setCropFormData({
      cropName: crop.cropName,
      cropCategory: crop.cropCategory || 'Cereals',
      variety: crop.variety || '',
      farmArea: crop.farmArea,
      areaUnit: crop.areaUnit || 'acres',
      sowingDate: crop.sowingDate ? crop.sowingDate.split('T')[0] : '',
      growthStage: crop.growthStage,
      soilType: crop.soilType || profileData.soilType,
      irrigationMethod: crop.irrigationMethod || profileData.irrigationMethod,
      notes: crop.notes || ''
    });
    setCropModalOpen(true);
  };

  const handleSaveCrop = async (e) => {
    e.preventDefault();
    try {
      if (editingCropId) {
        const res = await cropAPI.updateCrop(editingCropId, cropFormData);
        if (res.data.success) {
          setCrops(crops.map((c) => (c._id === editingCropId ? res.data.crop : c)));
          addToast('Crop details updated successfully!', 'success');
        }
      } else {
        const res = await cropAPI.createCrop(cropFormData);
        if (res.data.success) {
          setCrops([res.data.crop, ...crops]);
          addToast('New crop registered successfully with initial advisories!', 'success');
        }
      }
      setCropModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving crop record.', 'error');
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this registered crop?')) return;
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

  if (loading) {
    return <div className="text-center py-12 text-xs font-semibold text-slate-500">Loading farmer profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Farmer & Land Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Farm Profile & Cultivation Specs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your exact landholdings, soil characteristics, and irrigation methods for targeted advisories.
          </p>
        </div>

        <button
          onClick={handleOpenAddCrop}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Crop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal and Farm Details Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            Farmer Identity & Agro-Ecological Coordinates
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Farming Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={profileData.district}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Mandal</label>
                <input
                  type="text"
                  name="village"
                  value={profileData.village}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Farm Area, Unit, Soil & Irrigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Farm Size</label>
                <input
                  type="number"
                  step="0.1"
                  name="farmSize"
                  value={profileData.farmSize}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Land Unit</label>
                <select
                  name="landUnit"
                  value={profileData.landUnit}
                  onChange={handleProfileChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="guntas">Guntas</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Soil Type</label>
                <select
                  name="soilType"
                  value={profileData.soilType}
                  onChange={handleProfileChange}
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Irrigation Mode</label>
                <select
                  name="irrigationMethod"
                  value={profileData.irrigationMethod}
                  onChange={handleProfileChange}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field Agronomic Notes</label>
              <textarea
                name="notes"
                rows="2"
                value={profileData.notes}
                onChange={handleProfileChange}
                placeholder="Mention any salinity, drainage slope, or organic certifications..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Registered Crop Inventory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              Registered Farm Crops ({crops.length})
            </h2>
          </div>

          <div className="space-y-3">
            {crops.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
                <Sprout className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No crops recorded.</p>
                <button
                  onClick={handleOpenAddCrop}
                  className="mt-3 px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Add First Crop
                </button>
              </div>
            ) : (
              crops.map((crop) => (
                <div key={crop._id} className="agri-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{crop.cropName}</span>
                      <span className="text-xs text-slate-500 font-medium">({crop.variety})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCrop(crop)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                        title="Edit Crop"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrop(crop._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Crop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Area</span>
                      <span className="font-semibold text-slate-800">{crop.farmArea} {crop.areaUnit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sowing Date</span>
                      <span className="font-semibold text-slate-800">
                        {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Stage: {crop.growthStage}
                    </span>
                    <span className="text-slate-500">
                      {crop.irrigationMethod}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title={editingCropId ? 'Edit Registered Crop' : 'Register New Crop'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveCrop} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Name</label>
              <select
                name="cropName"
                value={cropFormData.cropName}
                onChange={(e) => {
                  const cropName = e.target.value;
                  const stages = getGrowthStagesForCrop(cropName);
                  setCropFormData({
                    ...cropFormData,
                    cropName,
                    growthStage: stages.includes(cropFormData.growthStage) ? cropFormData.growthStage : 'Vegetative'
                  });
                }}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="Rice">Rice (Paddy)</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize (Corn)</option>
                <option value="Wheat">Wheat</option>
                <option value="Groundnut">Groundnut (Peanut)</option>
                <option value="Chilli">Chilli</option>
                <option value="Tomato">Tomato</option>
                <option value="Soybean">Soybean</option>
                <option value="Pulses / Gram">Pulses / Gram</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Variety / Hybrid</label>
              <input
                type="text"
                name="variety"
                value={cropFormData.variety}
                onChange={(e) => setCropFormData({ ...cropFormData, variety: e.target.value })}
                placeholder="e.g. BPT 5204"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Area</label>
              <input
                type="number"
                step="0.1"
                required
                value={cropFormData.farmArea}
                onChange={(e) => setCropFormData({ ...cropFormData, farmArea: Number(e.target.value) })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Land Unit</label>
              <select
                value={cropFormData.areaUnit}
                onChange={(e) => setCropFormData({ ...cropFormData, areaUnit: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="guntas">Guntas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sowing Date</label>
              <input
                type="date"
                required
                value={cropFormData.sowingDate}
                onChange={(e) => setCropFormData({ ...cropFormData, sowingDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
              <select
                value={cropFormData.growthStage}
                onChange={(e) => setCropFormData({ ...cropFormData, growthStage: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-medium"
              >
                {getGrowthStagesForCrop(cropFormData.cropName).map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Field Notes</label>
            <input
              type="text"
              value={cropFormData.notes}
              onChange={(e) => setCropFormData({ ...cropFormData, notes: e.target.value })}
              placeholder="e.g. Nursery transplanted 3 weeks ago"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCropModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm"
            >
              {editingCropId ? 'Save Changes' : 'Register Crop'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmerProfilePage;
