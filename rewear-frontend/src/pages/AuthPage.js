// src/AuthPage.js

import React from "react";
import "./AuthPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom"; // Import Link

const AuthPage = ({ type }) => {
  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-container">
        <h2>{type === "login" ? "Login to ReWear" : "Create an Account"}</h2>
        <p>
          {type === "login"
            ? "Welcome back! Please log in to continue swapping."
            : "Join the ReWear community and start swapping sustainably."}
        </p>

        <form className="auth-form">
          {type === "register" && (
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" required />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" required />
          </div>

          <button type="submit" className="auth-btn">
            {type === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-link">
          {type === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <Link to={type === "login" ? "/register" : "/"}>
            {type === "login" ? "Register" : "Login"}
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;