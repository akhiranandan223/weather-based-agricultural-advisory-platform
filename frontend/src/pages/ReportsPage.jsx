import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { useToast } from '../context/ToastContext';
import { reportAPI } from '../services/api';
import ExportToolbar from '../components/ExportToolbar';
import {
  FileSpreadsheet,
  CloudSun,
  CalendarDays,
  Lightbulb,
  HelpCircle,
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Building,
  GraduationCap
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const { city } = useWeather();
  const { addToast } = useToast();

  const [activeReport, setActiveReport] = useState('weather'); // 'weather', 'forecast', 'advisory', 'queries'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (activeReport === 'weather') {
        const res = await reportAPI.getWeatherHistory({ city, startDate, endDate });
        if (res.data.success) setReportData(res.data.data || []);
      } else if (activeReport === 'forecast') {
        const res = await reportAPI.getForecastSummary({ city });
        if (res.data.success) setReportData(res.data.summary || []);
      } else if (activeReport === 'advisory') {
        const res = await reportAPI.getCropAdvisory({ startDate, endDate });
        if (res.data.success) setReportData(res.data.data || []);
      } else if (activeReport === 'queries') {
        const res = await reportAPI.getFarmerQueries();
        if (res.data.success) setReportData(res.data.data || []);
      }
    } catch (err) {
      addToast('Failed to retrieve report data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, city]);

  const handleExportCSV = () => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    let url = `${baseUrl}/reports/`;
    if (activeReport === 'weather') url += `weather-history?city=${city}&format=csv`;
    else if (activeReport === 'forecast') url += `forecast-summary?city=${city}&format=csv`;
    else if (activeReport === 'advisory') url += `crop-advisory?format=csv`;
    else if (activeReport === 'queries') url += `farmer-queries?format=csv`;

    // Trigger direct browser download
    const token = localStorage.getItem('agri_token');
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast('CSV spreadsheet downloaded successfully!', 'success');
      })
      .catch(() => addToast('Error downloading CSV.', 'error'));
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items by search query
  const filteredData = reportData.filter((item) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return JSON.stringify(item).toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Printable Report Header for University Examination (Visible only in print) */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
          SR University • Department of Computer Science & Engineering
        </h1>
        <h2 className="text-base font-bold text-slate-800">
          Weather-Based Agricultural Advisory Platform — Official Report
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Generated: {new Date().toLocaleString()} • Evaluator Copy • Location: {city}, Telangana
        </p>
      </div>

      {/* Screen Header */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Academic & Field Analytics
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Mandatory Reports & CSV/PDF Export Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Satisfies all 4 mandatory university reports with tabular breakdown, CSV export, and clean print format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Printable / PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Report Selector Tabs */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveReport('weather')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeReport === 'weather'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CloudSun className="w-5 h-5 mb-2 text-amber-400" />
          <h3 className="text-xs font-bold">1. Weather History Report</h3>
          <p className="text-[10px] opacity-80 mt-0.5">Historical temp, rain & humidity</p>
        </button>

        <button
          onClick={() => setActiveReport('forecast')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeReport === 'forecast'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-2 text-sky-400" />
          <h3 className="text-xs font-bold">2. Forecast Summary Report</h3>
          <p className="text-[10px] opacity-80 mt-0.5">5-day period agronomic forecast</p>
        </button>

        <button
          onClick={() => setActiveReport('advisory')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeReport === 'advisory'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-5 h-5 mb-2 text-amber-300" />
          <h3 className="text-xs font-bold">3. Crop Advisory Report</h3>
          <p className="text-[10px] opacity-80 mt-0.5">Crop actions & priority audit</p>
        </button>

        <button
          onClick={() => setActiveReport('queries')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeReport === 'queries'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-2 text-purple-300" />
          <h3 className="text-xs font-bold">4. Farmer Query Report</h3>
          <p className="text-[10px] opacity-80 mt-0.5">Scientific consultation logs</p>
        </button>
      </div>

      {/* Export & Date Filter Toolbar */}
      <div className="no-print">
        <ExportToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          onRefresh={fetchReport}
          loading={loading}
          placeholder={`Search ${activeReport} records...`}
          extraFilters={
            (activeReport === 'weather' || activeReport === 'advisory') && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs p-1.5 border border-slate-300 rounded-lg"
                  title="Start Date"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs p-1.5 border border-slate-300 rounded-lg"
                  title="End Date"
                />
                <button
                  onClick={fetchReport}
                  className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Filter
                </button>
              </div>
            )
          }
        />
      </div>

      {/* Tabular Reports Rendering */}
      <div className="agri-card p-6 border-slate-200 shadow-sm bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {activeReport === 'weather' && '1. Weather History Observation Report'}
              {activeReport === 'forecast' && '2. Five-Day Forecast Summary Report'}
              {activeReport === 'advisory' && '3. Crop-Specific Agricultural Advisory Report'}
              {activeReport === 'queries' && '4. Farmer Consultation Query & Expert Response Report'}
            </h2>
            <p className="text-xs text-slate-500">
              Station: {city} • Total records: {filteredData.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs font-semibold text-slate-500">
            Generating tabular report data...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 text-xs font-semibold text-slate-500">
            No records found for the selected parameters.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            {/* 1. Weather History Table */}
            {activeReport === 'weather' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">City / Station</th>
                    <th className="py-2.5 px-3">Temp (°C)</th>
                    <th className="py-2.5 px-3">Humidity (%)</th>
                    <th className="py-2.5 px-3">Rainfall (mm)</th>
                    <th className="py-2.5 px-3">Wind Speed</th>
                    <th className="py-2.5 px-3">Pressure</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {new Date(row.recordedAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">{row.location?.city}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.temperature}°C</td>
                      <td className="py-2.5 px-3">{row.humidity}%</td>
                      <td className="py-2.5 px-3 text-blue-600 font-semibold">{row.rainfall || 0} mm</td>
                      <td className="py-2.5 px-3">{row.windSpeed} km/h</td>
                      <td className="py-2.5 px-3">{row.pressure} hPa</td>
                      <td className="py-2.5 px-3 capitalize">{row.condition}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {row.dataSource}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Forecast Summary Table */}
            {activeReport === 'forecast' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Forecast Date</th>
                    <th className="py-2.5 px-3">Min Temp</th>
                    <th className="py-2.5 px-3">Max Temp</th>
                    <th className="py-2.5 px-3">Avg Humidity</th>
                    <th className="py-2.5 px-3">Rain Chance</th>
                    <th className="py-2.5 px-3">Rain Accumulation</th>
                    <th className="py-2.5 px-3">Max Wind Speed</th>
                    <th className="py-2.5 px-3">Forecast Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3 text-sky-700 font-semibold">{row.minTemperature}°C</td>
                      <td className="py-2.5 px-3 text-rose-700 font-bold">{row.maxTemperature}°C</td>
                      <td className="py-2.5 px-3">{row.averageHumidity}%</td>
                      <td className="py-2.5 px-3 font-bold text-blue-600">{row.rainProbability}%</td>
                      <td className="py-2.5 px-3">{row.expectedRainfall} mm</td>
                      <td className="py-2.5 px-3">{row.maxWindSpeed} km/h</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.forecastSummary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. Crop Advisory Table */}
            {activeReport === 'advisory' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Crop Name</th>
                    <th className="py-2.5 px-3">Growth Stage</th>
                    <th className="py-2.5 px-3">Advisory Title</th>
                    <th className="py-2.5 px-3">Weather Trigger</th>
                    <th className="py-2.5 px-3">Recommended Action</th>
                    <th className="py-2.5 px-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.cropName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.growthStage}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.advisoryTitle}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.weatherCondition}</td>
                      <td className="py-2.5 px-3 font-medium text-emerald-800">{row.recommendedAction}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            row.priority === 'High'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : row.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. Farmer Query Table */}
            {activeReport === 'queries' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Crop</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Latest Response</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, idx) => {
                    const latestResp = row.responses && row.responses.length > 0 ? row.responses[row.responses.length - 1].message : 'Pending Response';
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.farmerName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.farmingLocation?.district || 'Warangal'}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-800">{row.cropName}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.title}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{latestResp}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
