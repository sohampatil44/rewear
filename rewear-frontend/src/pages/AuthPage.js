// src/AuthPage.js
import React, { useState } from "react";
import "./AuthPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import API from "../services/api";

const AuthPage = ({ type }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (type === "login") {
        const res = await API.post("/auth/login", {
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        const res = await API.post("/auth/register", {
          name,
          email,
          password,
          isAdmin,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      alert(
        "❌ Error: " + (err.response?.data?.msg || "Something went wrong")
      );
    }
  };

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

        <form className="auth-form" onSubmit={handleSubmit}>
          {type === "register" && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {type === "register" && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />{" "}
                Register as Admin
              </label>
            </div>
          )}

          <button type="submit" className="auth-btn">
            {type === "login" ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-link">
          {type === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <Link to={type === "login" ? "/register" : "/login"}>
            {type === "login" ? "Register" : "Login"}
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default AuthPage;
