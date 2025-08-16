import React from "react";
import CurrentLocation from "./currentLocation";
import BookmarkCities from "./BookmarkCities";
import "./App.css";

function App() {
  return (
    <>
      <div className="container">
        <CurrentLocation />
      </div>
      <BookmarkCities />
      <div className="footer-info">
        
      </div>
    </>
  );
}

export default App;