import React, { Component } from "react";
import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

const defaults = {
  color: "white",
  size: 60,
  animate: true,
};

class BookmarkCities extends Component {
  state = {
    cities: [],
    weatherData: {},
    showAddForm: false,
    addQuery: "",
    addSearchResults: []
  };

  componentDidMount() {
    // No default cities to load
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cities.length !== this.state.cities.length) {
      this.state.cities.forEach(city => {
        if (!this.state.weatherData[city.name]) {
          this.getWeather(city.lat, city.lon, city.name);
        }
      });
    }
  }

  getWeather = async (lat, lon, cityName) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      
      let icon = "CLEAR_DAY";
      switch (data.weather[0].main) {
        case "Haze": icon = "CLEAR_DAY"; break;
        case "Clouds": icon = "CLOUDY"; break;
        case "Rain": icon = "RAIN"; break;
        case "Snow": icon = "SNOW"; break;
        case "Dust": icon = "WIND"; break;
        case "Drizzle": icon = "SLEET"; break;
        case "Fog": icon = "FOG"; break;
        case "Smoke": icon = "FOG"; break;
        case "Tornado": icon = "WIND"; break;
        default: icon = "CLEAR_DAY";
      }

      this.setState(prevState => ({
        weatherData: {
          ...prevState.weatherData,
          [cityName]: {
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            main: data.weather[0].main,
            icon: icon
          }
        }
      }));
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  deleteCity = (cityId) => {
    this.setState(prevState => ({
      cities: prevState.cities.filter(city => city.id !== cityId)
    }));
  };





  toggleHome = (cityId) => {
    this.setState(prevState => {
      const updatedCities = prevState.cities.map(city => ({
        ...city,
        isHome: city.id === cityId
      }));
      return {
        cities: updatedCities.sort((a, b) => b.isHome - a.isHome)
      };
    });
  };

  addCity = (cityName) => {
    if (this.state.cities.length < 3) {
      const city = {
        id: Date.now(),
        name: cityName,
        country: "Unknown",
        isHome: false,
        lat: 0,
        lon: 0
      };
      this.setState(prevState => ({
        cities: [...prevState.cities, city]
      }));
      this.getWeatherByName(cityName, city.id);
    }
  };

  getWeatherByName = async (cityName, cityId) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?q=${cityName}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      
      this.setState(prevState => ({
        cities: prevState.cities.map(city => 
          city.id === cityId ? {
            ...city,
            country: data.sys.country,
            lat: data.coord.lat,
            lon: data.coord.lon
          } : city
        )
      }));
      
      this.getWeather(data.coord.lat, data.coord.lon, cityName);
    } catch (error) {
      console.error("Error fetching city weather:", error);
    }
  };

  searchAddCities = async (query) => {
    if (query.length < 2) {
      this.setState({ addSearchResults: [] });
      return;
    }
    try {
      const response = await fetch(
        `${apiKeys.base}find?q=${query}&appid=${apiKeys.key}&units=metric`
      );
      const data = await response.json();
      this.setState({ addSearchResults: data.list || [] });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  handleAddSearch = (e) => {
    const query = e.target.value;
    this.setState({ addQuery: query });
    this.searchAddCities(query);
  };

  selectAddCity = (result) => {
    this.addCity(result.name);
    this.setState({ 
      showAddForm: false, 
      addQuery: "", 
      addSearchResults: [] 
    });
  };

  render() {
    const { cities } = this.state;
    const sortedCities = cities.sort((a, b) => b.isHome - a.isHome);
    
    return (
      <div className="bookmark-cities">
        {sortedCities.map((city) => {
          const weather = this.state.weatherData[city.name];
          return (
            <div key={city.id} className="bookmark-card">
              <div className="card-actions">
                <button onClick={() => this.deleteCity(city.id)} className="delete-btn">×</button>
              </div>
              {city.isHome && <div className="home-badge">🏠 Home</div>}
              {!city.isHome && (
                <button onClick={() => this.toggleHome(city.id)} className="set-home-btn">
                  Set as Home
                </button>
              )}
              <div className="bookmark-city-info">
                <h3>{city.name}</h3>
                <p>{city.country}</p>
              </div>
              {weather ? (
                <div className="bookmark-weather">
                  <ReactAnimatedWeather
                    icon={weather.icon}
                    color={defaults.color}
                    size={defaults.size}
                    animate={defaults.animate}
                  />
                  <div className="bookmark-temp">{weather.temperature}°C</div>
                  <div className="bookmark-desc">{weather.main}</div>
                </div>
              ) : (
                <div className="bookmark-loading">Loading...</div>
              )}
            </div>
          );
        })}
        {cities.length < 3 && (
          <div className="bookmark-card add-card">
            {!this.state.showAddForm ? (
              <div>
                <div className="add-city-text">
                  <h3>Add City</h3>
                  <p>Click to search and add cities</p>
                </div>
                <button 
                  onClick={() => {
                    this.setState({ showAddForm: true });
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
                    value={this.state.addQuery}
                    onChange={this.handleAddSearch}
                  />
                  <div className="img-box">
                    <img src="https://images.avishkaar.cc/workflow/newhp/search-white.png" alt="search" />
                  </div>
                </div>
                {this.state.addSearchResults.length > 0 && (
                  <div className="add-search-results">
                    {this.state.addSearchResults.slice(0, 5).map((result, index) => (
                      <div
                        key={index}
                        className="add-search-item"
                        onClick={() => this.selectAddCity(result)}
                      >
                        {result.name}, {result.sys.country}
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => this.setState({ showAddForm: false, addQuery: "", addSearchResults: [] })} 
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
}

export default BookmarkCities;