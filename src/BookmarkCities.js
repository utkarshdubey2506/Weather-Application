import React, { useState, useEffect, useCallback } from "react";
import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

const BookmarkTime = ({ timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (timezone * 1000));
      setTime(localTime);
    }, 60000); // Update every minute

    // Initial update
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 1000));
    setTime(localTime);

    return () => clearInterval(timer);
  }, [timezone]);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = hours.toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${ampm}`;
  };

  return <span style={{fontSize: '22px', color: '#ccc'}}>{formatTime(time)}</span>;
};

const defaults = {
  color: "white",
  size: 60,
  animate: true,
};

const getWeatherIcon = (weatherMain) => {
  const iconMap = {
    "Haze": "CLEAR_DAY",
    "Clouds": "CLOUDY",
    "Rain": "RAIN",
    "Snow": "SNOW",
    "Dust": "WIND",
    "Drizzle": "SLEET",
    "Fog": "FOG",
    "Smoke": "FOG",
    "Tornado": "WIND"
  };
  return iconMap[weatherMain] || "CLEAR_DAY";
};

function BookmarkCities() {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [addSearchResults, setAddSearchResults] = useState([]);

  const getWeather = useCallback(async (lat, lon, cityName) => {
    try {
      const response = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await response.json();
      
      setWeatherData(prev => ({
        ...prev,
        [cityName]: {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: data.wind?.speed || null,
          main: data.weather[0].main,
          icon: getWeatherIcon(data.weather[0].main)
        }
      }));
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }, []);

  const deleteCity = (cityId) => {
    setCities(prev => prev.filter(city => city.id !== cityId));
  };

  const toggleHome = (cityId) => {
    setCities(prev => {
      const updatedCities = prev.map(city => ({
        ...city,
        isHome: city.id === cityId
      }));
      return updatedCities.sort((a, b) => b.isHome - a.isHome);
    });
  };

  const getWeatherByName = useCallback(async (cityName, cityId) => {
    try {
      const response = await fetch(
        `${apiKeys.base}weather?q=${cityName}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await response.json();
      
      setCities(prev => prev.map(city => 
        city.id === cityId ? {
          ...city,
          country: data.sys.country,
          lat: data.coord.lat,
          lon: data.coord.lon,
          timezone: data.timezone
        } : city
      ));
      
      getWeather(data.coord.lat, data.coord.lon, cityName);
    } catch (error) {
      console.error("Error fetching city weather:", error);
    }
  }, [getWeather]);

  const addCity = useCallback((cityName) => {
    if (cities.length < 3) {
      const city = {
        id: Date.now(),
        name: cityName,
        country: "Unknown",
        isHome: false,
        lat: 0,
        lon: 0,
        timezone: 0
      };
      setCities(prev => [...prev, city]);
      getWeatherByName(cityName, city.id);
    }
  }, [cities.length, getWeatherByName]);

  const searchAddCities = useCallback(async (query) => {
    if (query.length < 2) {
      setAddSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `${apiKeys.base}find?q=${query}&appid=${apiKeys.key}&units=metric`
      );
      const data = await response.json();
      setAddSearchResults(data.list || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  }, []);

  const handleAddSearch = (e) => {
    const query = e.target.value;
    setAddQuery(query);
    searchAddCities(query);
  };

  const selectAddCity = (result) => {
    addCity(result.name);
    setShowAddForm(false);
    setAddQuery("");
    setAddSearchResults([]);
  };

  useEffect(() => {
    cities.forEach(city => {
      if (!weatherData[city.name] && city.lat && city.lon) {
        getWeather(city.lat, city.lon, city.name);
      }
    });
  }, [cities, weatherData, getWeather]);

  const sortedCities = cities.sort((a, b) => b.isHome - a.isHome);
  
  return (
    <div className="bookmark-cities">
      {sortedCities.map((city) => {
        const weather = weatherData[city.name];
        return (
          <div key={city.id} className="bookmark-card">
            <div className="card-actions">
              <button onClick={() => deleteCity(city.id)} className="delete-btn">×</button>
            </div>
            {city.isHome && <div className="home-badge">🏠 Home</div>}

            <div className="bookmark-top-section">
              <div className="bookmark-city-info">
                <h3>{city.name}, {city.country}</h3>
                <div className="bookmark-time">
                  <BookmarkTime timezone={city.timezone || 0} />
                </div>
              </div>
              {weather ? (
                <div className="bookmark-weather">
                  <div className="bookmark-weather-icon">
                    <ReactAnimatedWeather
                      icon={weather.icon}
                      color={defaults.color}
                      size={50}
                      animate={defaults.animate}
                    />
                  </div>
                  <div className="bookmark-temp">{weather.temperature}°C</div>
                  <div className="bookmark-desc">{weather.main}</div>
                </div>
              ) : (
                <div className="bookmark-loading">Loading...</div>
              )}
            </div>
            {weather && (
              <div className="bookmark-bottom-section">
                <div className="bookmark-details">
                  <div className="bookmark-humidity">Humidity: {weather.humidity}%</div>
                  <div className="bookmark-windspeed">Wind: {weather.windSpeed ? Math.round(weather.windSpeed) : 'N/A'} km/h</div>
                </div>
                {!city.isHome && (
                  <button onClick={() => toggleHome(city.id)} className="set-home-btn">
                    Set as Home
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {cities.length < 3 && (
        <div className="bookmark-card add-card">
          {!showAddForm ? (
            <div>
              <div className="add-city-text">
                <h3>Add City</h3>
                <p>Click to search and add cities</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddForm(true);
                  setTimeout(() => {
                    const input = document.querySelector('.add-search-container .search-bar');
                    if (input) input.focus();
                  }, 100);
                }} 
                className="add-bookmark-btn"
              >
                + Add City
              </button>
            </div>
          ) : (
            <div className="add-search-container">
              <div className="search-box">
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search city to add..."
                  value={addQuery}
                  onChange={handleAddSearch}
                />
                <div className="img-box">
                  <img src="https://images.avishkaar.cc/workflow/newhp/search-white.png" alt="search" />
                </div>
              </div>
              {addSearchResults.length > 0 && (
                <div className="add-search-results">
                  {addSearchResults.slice(0, 5).map((result, index) => (
                    <div
                      key={index}
                      className="add-search-item"
                      onClick={() => selectAddCity(result)}
                    >
                      {result.name}, {result.sys.country}
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setAddQuery("");
                  setAddSearchResults([]);
                }} 
                className="cancel-add-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookmarkCities;