import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Loader2, Search } from 'lucide-react';

const API_KEY = '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const WeatherIcon = ({ type, size = 24, className = "" }) => {
  const getIconComponent = (code) => {
    const weatherCode = code?.toLowerCase() || '';
    
    if (weatherCode.includes('01')) return (
      <div className="animate-spin-slow">
        <Sun size={size} className={`text-yellow-400 ${className}`} />
      </div>
    );
    if (weatherCode.includes('02')) return (
      <div className="relative animate-float">
        <Sun size={size} className={`text-yellow-400 ${className}`} />
        <Cloud size={size * 0.7} className="absolute bottom-0 right-0 text-gray-400" />
      </div>
    );
    if (weatherCode.includes('03') || weatherCode.includes('04')) 
      return <Cloud size={size} className={`text-gray-400 animate-bounce-slow ${className}`} />;
    if (weatherCode.includes('09') || weatherCode.includes('10')) 
      return <CloudRain size={size} className={`text-blue-400 animate-float ${className}`} />;
    if (weatherCode.includes('11')) 
      return <CloudLightning size={size} className={`text-purple-400 animate-pulse ${className}`} />;
    if (weatherCode.includes('13')) 
      return <CloudSnow size={size} className={`text-blue-200 animate-fall ${className}`} />;
    
    return <Sun size={size} className={`text-yellow-400 animate-spin-slow ${className}`} />;
  };

  return <div className={`transition-all duration-300 ${className}`}>{getIconComponent(type)}</div>;
};

const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

const getDayName = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'long' });
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${cityName}&APPID=${API_KEY}`
      );
      
      if (!currentResponse.ok) {
        throw new Error('City not found');
      }
      
      const currentData = await currentResponse.json();

      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}`
      );
      const forecastData = await forecastResponse.json();

      const dailyForecasts = forecastData.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 4);

      setWeather({
        current: {
          city: currentData.name,
          temperature: kelvinToCelsius(currentData.main.temp),
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          humidity: currentData.main.humidity,
          windSpeed: currentData.wind.speed,
          feelsLike: kelvinToCelsius(currentData.main.feels_like),
        },
        forecast: dailyForecasts.map(day => ({
          day: getDayName(day.dt),
          temp: kelvinToCelsius(day.main.temp),
          icon: day.weather[0].icon,
          description: day.weather[0].description,
        })),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  useEffect(() => {
    fetchWeather('New York');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-purple-300 p-4 transition-all duration-500">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12 transform transition-all duration-300">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full p-4 pr-12 rounded-full bg-white/90 backdrop-blur-xl 
                       text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-4 
                       focus:ring-blue-300 text-center text-lg shadow-lg transition-all 
                       duration-300 ${isSearchFocused ? 'scale-105' : ''}`}
            />
            <Search 
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 
                         text-gray-400 transition-all duration-300
                         ${isSearchFocused ? 'text-blue-500' : ''}`}
              size={24}
            />
          </form>
        </div>

        {loading && (
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto text-dark" />
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto text-center bg-red-100/90 backdrop-blur-md 
                         rounded-lg p-4 mb-4 transform animate-shake">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Current Weather Card */}
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl 
                          transform transition-all duration-500 hover:shadow-3xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h1 className="text-5xl font-bold text-dark mb-2">
                    {weather.current.city}
                  </h1>
                  <p className="text-2xl text-dark/90 capitalize mb-4">
                    {weather.current.description}
                  </p>
                  <div className="space-y-2 text-dark/80">
                    <p>Humidity: {weather.current.humidity}%</p>
                    <p>Wind Speed: {weather.current.windSpeed} m/s</p>
                    <p>Feels Like: {weather.current.feelsLike}°C</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <WeatherIcon type={weather.current.icon} size={120} />
                  <p className="text-6xl font-bold text-dark mt-4">
                    {weather.current.temperature}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Forecast Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weather.forecast.map((day, index) => (
                <div
                  key={day.day}
                  className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 text-center
                           transform transition-all duration-500 hover:scale-105
                           hover:bg-white/30 animate-slideUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-lg font-semibold text-dark mb-3">{day.day}</p>
                  <WeatherIcon type={day.icon} size={48} className="mx-auto mb-3" />
                  <p className="text-2xl font-bold text-dark mb-2">{day.temp}°C</p>
                  <p className="text-sm text-dark/80 capitalize">{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// Add these to your global CSS or Tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fall {
    0% { transform: translateY(-10px); }
    100% { transform: translateY(10px); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
  .animate-fall { animation: fall 2s ease-in-out infinite alternate; }
  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
`;
document.head.appendChild(style);
