import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { weatherAPI } from '../services/api';
import {
  CalendarDays,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  Sun,
  Filter,
  BarChart2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastPage = () => {
  const { city } = useWeather();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('temp'); // 'temp', 'rain', 'humidity'
  const [selectedDay, setSelectedDay] = useState('all');

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await weatherAPI.getForecast({ city });
      if (res.data.success) {
        setForecastData(res.data.forecast);
      }
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [city]);

  if (loading) {
    return <div className="text-center py-16 text-xs font-semibold text-slate-500">Loading 5-day meteorological forecast...</div>;
  }

  const rawForecasts = forecastData?.forecasts || [];

  // Group forecasts by date
  const groupedByDay = {};
  rawForecasts.forEach((item) => {
    const dayKey = item.dateTime.split('T')[0];
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(item);
  });

  const dailySummaries = Object.entries(groupedByDay).map(([date, items]) => {
    const temps = items.map((i) => i.temperature);
    const rainProbs = items.map((i) => i.rainProbability);
    const humidities = items.map((i) => i.humidity);
    const winds = items.map((i) => i.windSpeed);

    return {
      date,
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
      avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      maxRainProb: Math.max(...rainProbs),
      maxWind: Math.max(...winds),
      condition: items[Math.floor(items.length / 2)]?.condition || 'Clear',
      description: items[Math.floor(items.length / 2)]?.description || 'Clear skies',
      items
    };
  });

  // Filter items for chart
  const displayedItems = selectedDay === 'all'
    ? rawForecasts.slice(0, 24) // First 3 days at 3h intervals
    : (groupedByDay[selectedDay] || []);

  const chartLabels = displayedItems.map((item) => {
    const d = new Date(item.dateTime);
    return `${d.toLocaleDateString([], { weekday: 'short' })} ${d.getHours()}:00`;
  });

  // Chart Data Configurations
  const tempChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: displayedItems.map((i) => i.temperature),
        borderColor: '#e76f51',
        backgroundColor: 'rgba(231, 111, 81, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#e76f51'
      }
    ]
  };

  const rainChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Rain Probability (%)',
        data: displayedItems.map((i) => i.rainProbability),
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }
    ]
  };

  const humidityChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Relative Humidity (%)',
        data: displayedItems.map((i) => i.humidity),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' } } },
      tooltip: { padding: 10 }
    },
    scales: {
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Agricultural Weather Forecasting
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            5-Day / 3-Hour Granular Forecast: {city}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly and multi-day meteorological forecasts mapped against irrigation thresholds and field operations.
          </p>
        </div>

        <button
          onClick={fetchForecast}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Update Forecast</span>
        </button>
      </div>

      {/* 5-Day Daily Summary Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-700" />
          Daily Five-Day Agricultural Outlook
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {dailySummaries.slice(0, 5).map((day) => {
            const isSelected = selectedDay === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(isSelected ? 'all' : day.date)}
                className={`agri-card p-4 text-left transition-all ${
                  isSelected ? 'ring-2 ring-emerald-600 bg-emerald-50/60' : 'hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>

                <div className="my-2">
                  <span className="text-xl font-black text-slate-900">
                    {Math.round(day.maxTemp)}°C
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    / {Math.round(day.minTemp)}°C
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Rain chance:</span>
                    <span className={`font-bold ${day.maxRainProb > 50 ? 'text-blue-600' : 'text-slate-800'}`}>
                      {day.maxRainProb}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Humidity:</span>
                    <span className="font-semibold text-slate-800">{day.avgHumidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max Wind:</span>
                    <span className="font-semibold text-slate-800">{day.maxWind} km/h</span>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-emerald-700 font-bold capitalize truncate">
                  {day.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-700" />
              Forecast Metric Visualizer {selectedDay !== 'all' ? `(${selectedDay})` : '(Multi-Day)'}
            </h3>
            <p className="text-xs text-slate-500">
              Select metric tabs to inspect temperature curves, expected rainfall probability, or relative humidity.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('temp')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'temp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveTab('rain')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'rain' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rain Probability
            </button>
            <button
              onClick={() => setActiveTab('humidity')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'humidity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Humidity
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full pt-2">
          {activeTab === 'temp' && <Line data={tempChartData} options={chartOptions} />}
          {activeTab === 'rain' && <Bar data={rainChartData} options={chartOptions} />}
          {activeTab === 'humidity' && <Line data={humidityChartData} options={chartOptions} />}
        </div>
      </div>

      {/* Hourly / 3-Hour Forecast Detailed Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          3-Hour Granular Interval Observations
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Rainfall Chance</th>
                <th className="py-2.5 px-3">Rain Amount</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Wind Speed</th>
                <th className="py-2.5 px-3">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedItems.slice(0, 12).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {new Date(item.dateTime).toLocaleString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-3 capitalize text-slate-700">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {item.temperature}°C
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-600">
                    {item.rainProbability}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.rainAmount || 0} mm
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.humidity}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.windSpeed} km/h
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.pressure} hPa
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
