import React, { useState } from "react";
import axios from "axios";
import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

function Forcast(props) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Search for weather by city name
  const search = (city) => {
    axios
      .get(
        `${apiKeys.base}weather?q=${
          city != "[object Object]" ? city : query
        }&units=metric&APPID=${apiKeys.key}`
      )
      .then((response) => {
        const cityName = response.data.name;
        setQuery("");
        setSearchResults([]);
        
        // Keep last 2 searches
        setRecentSearches(prev => {
          const filtered = prev.filter(city => city !== cityName);
          return [cityName, ...filtered].slice(0, 2);
        });
        
        if (props.onCitySelect) {
          props.onCitySelect(cityName);
        }
      })
      .catch(() => {
        setQuery("");
        setSearchResults([]);
      });
  };

  // Get live city suggestions
  const searchCities = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `${apiKeys.base}find?q=${query}&appid=${apiKeys.key}&units=metric`
      );
      setSearchResults(response.data.list || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

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
          icon={props.icon}
          color={defaults.color}
          size={defaults.size}
          animate={defaults.animate}
        />
      </div>
      <div className="today-weather">
        <h3>{props.weather}</h3>
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
              onClick={search}
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
          {props.currentWeather ? (
            <div>
              <li>
                Humidity <span className="temp">{Math.round(props.currentWeather.humidity)}%</span>
              </li>
              <li>
                Visibility <span className="temp">{props.currentWeather.visibility ? Math.round(props.currentWeather.visibility / 1000) : 'N/A'} km</span>
              </li>
              <li>
                Wind Speed <span className="temp">{props.currentWeather.windSpeed ? Math.round(props.currentWeather.windSpeed) : 'N/A'} Km/h</span>
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
export default Forcast;
