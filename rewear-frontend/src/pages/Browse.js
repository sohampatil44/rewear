import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Browse.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch only approved items
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/items/approved")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  return (
    <div className="browse-page">

      <section className="browse-hero">
        <h2>Browse Items</h2>
        <p>Explore community-listed items and start swapping sustainably!</p>
      </section>

      <div className="browse-grid">
        {items.length === 0 ? (
          <p>No approved items yet. Check back later!</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="browse-card">
              {/* ✅ Show uploaded image */}
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.title}
                className="browse-image"
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
              <p>Listed by {item.uploader?.name || "Unknown"}</p>
              <button className="browse-btn" 
              onClick={() => navigate(`/swap-request/${item._id}`)}>Swap Now</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Browse;
