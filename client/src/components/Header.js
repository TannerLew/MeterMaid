// Header.js

import React from "react";
import "./Header.css";

function Header({ firstName, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-left">
        {firstName ? <span>Welcome, {firstName}</span> : <span>&nbsp;</span>}
      </div>
      <div className="header-center">
        <h1>MeterMaid</h1>
      </div>
      <div className="header-right">
        {firstName && (
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
