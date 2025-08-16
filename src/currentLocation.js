import React, { useState, useEffect, useCallback } from "react";
import apiKeys from "./apiKeys";

import Forecast from "./Forecast";
import loader from "./images/WeatherIcons.gif";
import cityDay from "./images/city.jpg";
import cityNight from "./images/city1.jpg";
import ReactAnimatedWeather from "react-animated-weather";

const LocalTime = ({ timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (timezone * 1000));
      setTime(localTime);
    }, 1000);

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

  return <span>{formatTime(time)}</span>;
};

const dateBuilder = (d) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
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

const getBackgroundImage = (timezone) => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (timezone * 1000));
  const hour = localTime.getHours();
  
  return (hour >= 6 && hour < 18) ? cityDay : cityNight;
};

function CurrentLocation() {
  const [weather, setWeather] = useState({
    lat: null,
    lon: null,
    temperatureC: null,
    city: null,
    country: null,
    humidity: null,
    main: null,
    icon: "CLEAR_DAY",
    windSpeed: null,
    visibility: null,
    timezone: 0,
    backgroundImage: cityDay
  });

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const getWeather = useCallback(async (lat, lon) => {
    try {
      const response = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await response.json();
      
      setWeather({
        lat,
        lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
        visibility: data.visibility,
        windSpeed: data.wind?.speed || null,
        icon: getWeatherIcon(data.weather[0].main),
        timezone: data.timezone,
        backgroundImage: getBackgroundImage(data.timezone)
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  }, []);

  const searchByCity = async (cityName) => {
    try {
      const response = await fetch(
        `${apiKeys.base}weather?q=${cityName}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await response.json();
      
      setWeather({
        lat: data.coord.lat,
        lon: data.coord.lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
        visibility: data.visibility,
        windSpeed: data.wind?.speed || null,
        icon: getWeatherIcon(data.weather[0].main),
        timezone: data.timezone,
        backgroundImage: getBackgroundImage(data.timezone)
      });
    } catch (error) {
      console.error("Error fetching city weather:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          getWeather(28.67, 77.22);
        }
      );
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      getPosition()
        .then((position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch(() => {
          getWeather(28.67, 77.22);
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }
  }, [getWeather]);

  if (weather.temperatureC) {
    return (
      <>
        <button onClick={getCurrentLocation} className="location-btn">
          📍
        </button>
        <div className="city" style={{backgroundImage: `url(${weather.backgroundImage})`}}>
          <div className="title">
            <h2>{weather.city}</h2>
            <h3>{weather.country}</h3>
          </div>
          <div className="mb-icon">
            <ReactAnimatedWeather
              icon={weather.icon}
              color={defaults.color}
              size={defaults.size}
              animate={defaults.animate}
            />
            <p>{weather.main}</p>
          </div>
          <div className="date-time">
            <div className="dmy">
              <div className="current-time">
                <LocalTime timezone={weather.timezone} />
              </div>
              <div className="current-date">{dateBuilder(new Date())}</div>
            </div>
            <div className="temperature">
              <p>
                {weather.temperatureC}°<span>C</span>
              </p>
            </div>
          </div>
        </div>
        <Forecast 
          icon={weather.icon} 
          weather={weather.main} 
          city={weather.city}
          onCitySelect={searchByCity}
          currentWeather={{
            humidity: weather.humidity,
            windSpeed: weather.windSpeed
          }}
        />
      </>
    );
  }

  return (
    <>
      <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} alt="Loading" />
      <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
        Detecting your location
      </h3>
      <h3 style={{ color: "white", marginTop: "10px" }}>
        Your current location will be displayed on the App <br /> & used
        for calculating Real time weather.
      </h3>
    </>
  );
}

export default CurrentLocation;