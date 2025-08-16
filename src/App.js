import React, { useState, useRef } from "react";
import CurrentLocation from "./currentLocation";
import BookmarkCities from "./BookmarkCities";
import "./App.css";

function App() {
  const bookmarkRef = useRef();

  const handleAddBookmark = (cityName) => {
    if (bookmarkRef.current) {
      bookmarkRef.current.addCity(cityName);
    }
  };

  return (
    <React.Fragment>
      <div className="container">
        <CurrentLocation onAddBookmark={handleAddBookmark} />
      </div>
      <BookmarkCities ref={bookmarkRef} />
      <div className="footer-info">
         Developed by{" "}
        <a target="_blank" href="https://github.com/utkarshdubey2506">
          Utkarsh Dubey
        </a>{" "}
       
      </div>
    </React.Fragment>
  );
}

export default App;
