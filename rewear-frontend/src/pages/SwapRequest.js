import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import "./SwapRequest.css";

const SwapRequest = () => {
  const { itemId } = useParams(); // ✅ Match route param name from App.js
  const navigate = useNavigate();
  const [requestedItem, setRequestedItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the item they want to swap
        const itemRes = await API.get(`/items/${itemId}`);
        setRequestedItem(itemRes.data);

        // Fetch user's approved items
        const myItemsRes = await API.get("/items/my-items");
        setMyItems(myItemsRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error("⚠️ Please select an item to offer");
      return;
    }

    try {
      await API.post("/swaps", {
        itemRequested: itemId,
        itemOffered: selectedItem,
      });

      toast.success("✅ Swap request sent successfully!");
      navigate("/browse");
    } catch (error) {
      console.error("Swap error:", error);
      const errorMsg = error.response?.data?.message || "Failed to create swap request";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!requestedItem) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Item not found</p>
        <button onClick={() => navigate("/browse")}>Back to Browse</button>
      </div>
    );
  }

  return (
    <div className="swap-request-page">
      <div className="swap-container">
        <h2>🔄 Request Swap</h2>

        <div className="requested-item">
          <h3>Item You Want:</h3>
          <img src={requestedItem.imageUrl} alt={requestedItem.title} />
          <p><strong>{requestedItem.title}</strong></p>
          <p>{requestedItem.description}</p>
          <p><strong>Category:</strong> {requestedItem.category}</p>
          <p><strong>Owner:</strong> {requestedItem.uploader?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="swap-form">
          <h3>Select Your Item to Offer:</h3>

          {myItems.length === 0 ? (
            <div className="no-items">
              <p>❌ You have no approved items to swap.</p>
              <p>Please add an item and wait for admin approval.</p>
              <button type="button" onClick={() => navigate("/add")}>
                ➕ Add Item
              </button>
            </div>
          ) : (
            <>
              <div className="my-items-grid">
                {myItems.map((item) => (
                  <label 
                    key={item._id} 
                    className={`item-card ${selectedItem === item._id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="itemOffered"
                      value={item._id}
                      checked={selectedItem === item._id}
                      onChange={(e) => setSelectedItem(e.target.value)}
                    />
                    <img src={item.imageUrl} alt={item.title} />
                    <p><strong>{item.title}</strong></p>
                    <p className="item-category">{item.category}</p>
                  </label>
                ))}
              </div>

              <button type="submit" className="submit-swap-btn">
                📤 Send Swap Request
              </button>
            </>
          )}
        </form>

        <button 
          type="button" 
          className="back-btn" 
          onClick={() => navigate("/browse")}
        >
          ← Back to Browse
        </button>
      </div>
    </div>
  );
};

export default SwapRequest;