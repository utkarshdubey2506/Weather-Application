import React, { useState, useCallback } from "react";
import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

function Forecast({ icon, weather, city, onCitySelect, currentWeather }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const search = useCallback(async (cityName) => {
    const searchCity = cityName !== "[object Object]" ? cityName : query;
    
    try {
      const response = await fetch(
        `${apiKeys.base}weather?q=${searchCity}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await response.json();
      
      if (response.ok) {
        const cityName = data.name;
        setQuery("");
        setSearchResults([]);
        
        setRecentSearches(prev => {
          const filtered = prev.filter(city => city !== cityName);
          return [cityName, ...filtered].slice(0, 2);
        });
        
        onCitySelect?.(cityName);
      }
    } catch (error) {
      console.error("Search error:", error);
      setQuery("");
      setSearchResults([]);
    }
  }, [query, onCitySelect]);

  const searchCities = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${apiKeys.base}find?q=${searchQuery}&appid=${apiKeys.key}&units=metric`
      );
      const data = await response.json();
      setSearchResults(data.list || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchCities(value);
  };

  const selectCity = (cityName) => {
    setQuery(cityName);
    setSearchResults([]);
    search(cityName);
  };

  const defaults = {
    color: "white",
    size: 112,
    animate: true,
  };

  return (
    <div className="forecast">
      <div className="forecast-icon">
        <ReactAnimatedWeather
          icon={icon}
          color={defaults.color}
          size={defaults.size}
          animate={defaults.animate}
        />
      </div>
      <div className="today-weather">
        <h3>{weather}</h3>
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search any city"
            onChange={handleInputChange}
            value={query}
          />
          <div className="img-box">
            <img
              src="https://images.avishkaar.cc/workflow/newhp/search-white.png"
              onClick={() => search()}
              alt="search"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="search-suggestions">
              {searchResults.slice(0, 5).map((result, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectCity(result.name)}
                >
                  {result.name}, {result.sys.country}
                </div>
              ))}
            </div>
          )}
        </div>
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h4>Recent Searches</h4>
            {recentSearches.map((city, index) => (
              <div 
                key={index} 
                className="recent-search-item"
                onClick={() => search(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}
        <ul>
          {currentWeather && city ? (
            <div>
              <li>
                City <span className="temp">{city}</span>
              </li>
              <li>
                Humidity <span className="temp">{Math.round(currentWeather.humidity)}%</span>
              </li>
              <li>
                Wind Speed <span className="temp">{currentWeather.windSpeed ? Math.round(currentWeather.windSpeed) : 'N/A'} Km/h</span>
              </li>
            </div>
          ) : (
            <li>No weather data available</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Forecast;