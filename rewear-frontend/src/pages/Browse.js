import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Browse.css";

const Browse = () => {
  // Example items (later replace with DB data)
  const items = [
    { id: 1, emoji: "👕", name: "Blue T-Shirt", owner: "Ravi" },
    { id: 2, emoji: "👗", name: "Floral Dress", owner: "Sara" },
    { id: 3, emoji: "🧥", name: "Winter Jacket", owner: "Aman" },
    { id: 4, emoji: "👟", name: "Running Shoes", owner: "Maya" },
  ];

  return (
    <div className="browse-page">
      <Navbar />

      <section className="browse-hero">
        <h2>Browse Items</h2>
        <p>Explore community-listed items and start swapping sustainably!</p>
      </section>

      <div className="browse-grid">
        {items.map((item) => (
          <div key={item.id} className="browse-card">
            <span className="browse-icon">{item.emoji}</span>
            <h3>{item.name}</h3>
            <p>Listed by {item.owner}</p>
            <button className="browse-btn">Swap Now</button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;
