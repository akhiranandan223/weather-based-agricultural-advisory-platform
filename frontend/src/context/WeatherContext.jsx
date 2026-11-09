import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { weatherAPI } from '../services/api';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [city, setCity] = useState(localStorage.getItem('agri_city') || 'Warangal');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  const fetchCurrentWeather = useCallback(async (targetCity) => {
    const queryCity = targetCity || city;
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const res = await weatherAPI.getCurrent({ city: queryCity });
      if (res.data.success) {
        setCurrentWeather(res.data.weather);
        setCity(res.data.weather.city);
        localStorage.setItem('agri_city', res.data.weather.city);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
      setWeatherError('Failed to fetch real-time weather. Displaying fallback data.');
    } finally {
      setLoadingWeather(false);
    }
  }, [city]);

  useEffect(() => {
    fetchCurrentWeather(city);
  }, []);

  const changeCity = (newCity) => {
    setCity(newCity);
    fetchCurrentWeather(newCity);
  };

  return (
    <WeatherContext.Provider
      value={{
        city,
        currentWeather,
        loadingWeather,
        weatherError,
        changeCity,
        refreshWeather: () => fetchCurrentWeather(city)
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
