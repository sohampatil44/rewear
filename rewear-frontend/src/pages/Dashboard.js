import React from "react";
import "./Dashboard.css";  
import Navbar from "./Navbar.js";  // ✅ Import Navbar component
import Footer from "./Footer.js";
import { Link } from "react-router-dom";
const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* ✅ Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <h1>Sustainable Fashion, <span>Together</span></h1>
        <p>
          Give your unused clothing a new life. Swap directly with others or use
          points to find your next favorite piece. Join a community making
          fashion circular and fun!
        </p>
        <div className="buttons">
            <Link to="/swap">
              <button className="primary">Start Swapping</button>
            </Link>
            <Link to="/browse">
              <button className="secondary">Browse Items</button>
            </Link>
        </div>

        <div className="stats">
          <div>
            <h3>1,200+</h3>
            <p>Members</p>
          </div>
          <div>
            <h3>3,500+</h3>
            <p>Items Swapped</p>
          </div>
          <div>
            <h3>2,000kg</h3>
            <p>Waste Saved</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How ReWear Works</h2>
        <div className="steps">
          <div>
            <span>⬆️</span>
            <h3>List Your Items</h3>
            <p>Upload photos and details of clothing you no longer wear.</p>
          </div>
          <div>
            <span>🔄</span>
            <h3>Swap or Redeem</h3>
            <p>Exchange directly with others or use points to get items you love.</p>
          </div>
          <div>
            <span>🌱</span>
            <h3>Reduce Waste</h3>
            <p>Help create a more sustainable fashion ecosystem.</p>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="featured">
        <h2>Featured Items</h2>
        <div className="items">
          {["👕", "👗", "🧥", "👟"].map((item, i) => (
            <div key={i} className="card">
              <span>{item}</span>
              <p>Clothing Item {i + 1}</p>
            </div>
          ))}
        </div>
      </section>

     
    </div>
  );
};

export default Dashboard;
