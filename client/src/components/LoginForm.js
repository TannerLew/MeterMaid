// LoginForm.js

import React, { useState } from "react";
import "./LoginForm.css"; // Import the CSS file

function LoginForm({ onLogin, onGoToRegister }) {
  const [mNumber, setMNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      mNumber,
      password,
    };

    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          response.json().then((data) => {
            alert(data.message || "Login failed");
          });
        }
      })
      .then((data) => {
        if (data) {
          alert("Login successful");
          onLogin(data.userID, data.firstName); // Pass firstName to onLogin
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during login");
      });
  };

  return (
    <div className="login-container">
      <h1>User Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="mNumber">M Number:</label>
          <input
            type="text"
            id="mNumber"
            value={mNumber}
            onChange={(e) => setMNumber(e.target.value)}
            required
            placeholder="Enter your M Number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="btn-login">
          Login
        </button>
      </form>
      <p className="register-link">
        Don't have an account?{" "}
        <button onClick={onGoToRegister} className="btn-register-link">
          Register here
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
