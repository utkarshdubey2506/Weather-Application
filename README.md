# Weather App - React 18

A modern, responsive weather application built with React 18 that provides real-time weather information with enhanced features.

## 🌟 Features

### Core Weather Features
- **📍 Current Location Weather**: Automatic weather detection based on user's GPS location
- **🔍 City Search**: Live search with autocomplete suggestions for any city worldwide
- **🕒 Recent Searches**: Quick access to your last 2 searched cities
- **⭐ Bookmark Cities**: Save up to 3 favorite cities with one designated as "home"
- **🌡️ Detailed Weather Info**: Temperature, humidity, wind speed, and visibility
- **🎨 Animated Weather Icons**: Dynamic weather animations based on current conditions
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Weather Data Displayed
- **Temperature**: Current temperature in Celsius
- **Weather Condition**: Clear, cloudy, rainy, snowy, foggy, etc.
- **Humidity**: Air moisture percentage
- **Wind Speed**: Current wind speed in Km/h
- **Location**: City name and country code
- **Real-time Updates**: Weather data refreshes automatically every 10 minutes

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- npm 6 or higher

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Allow location access for automatic weather detection

### Build for Production
```bash
npm run build
```

## 🛠️ Technology Stack

- **React 18**: Latest stable version with modern hooks
- **JavaScript ES6+**: Modern JavaScript features
- **OpenWeatherMap API**: Real-time weather data
- **React Animated Weather**: Beautiful weather icons
- **CSS3**: Responsive styling and animations
- **React Live Clock**: Real-time clock display

## 📱 How to Use

1. **Initial Load**: App automatically detects your location and shows current weather
2. **Search Cities**: Use the search bar to find weather for any city
3. **Recent Searches**: Click on recently searched cities for quick access
4. **Bookmark Cities**: Add up to 3 favorite cities and set one as "home"
5. **Location Button**: Click the 📍 button to refresh current location weather

## 🔧 Configuration

- Weather data is provided by OpenWeatherMap API
- Location detection uses browser's Geolocation API
- Default fallback location: New Delhi, India (28.67°N, 77.22°E)

## ✨ Features

- **Modern React 18**: Built with the latest stable version
- **Functional Components**: All components use modern hooks
- **Performance Optimized**: Using useCallback and proper dependency management
- **Clean Architecture**: Simplified and maintainable codebase
- **No Legacy Dependencies**: Only essential, up-to-date packages
- **Direct Start**: Simple `npm install` and `npm start` - no configuration needed
- **Build Optimized**: Fast builds and optimized bundle size

## 📦 Project Structure

```
src/
├── components/
│   ├── App.js              # Main app component
│   ├── CurrentLocation.js  # Current location weather
│   ├── Forecast.js         # Weather forecast and search
│   └── BookmarkCities.js   # Bookmark cities management
├── images/                 # Weather icons and assets
├── apiKeys.js             # API configuration
├── App.css               # Styling
└── index.js              # App entry point
```

## 🌐 API

This app uses the OpenWeatherMap API for weather data. The API key is included for demo purposes.