import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./AddItem.css";

const AddItem = () => {
  return (
    <div className="add-page">
      <Navbar />

      <div className="add-container">
        <h2>Add New Item</h2>
        <p>Upload clothing you no longer use and make it available for swapping!</p>

        <form className="add-form">
          <div className="form-group">
            <label>Item Name</label>
            <input type="text" placeholder="Ex: Blue T-Shirt" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Brief details about your item..." rows="3" required></textarea>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select required>
              <option value="">Select category</option>
              <option value="tops">Tops</option>
              <option value="dresses">Dresses</option>
              <option value="outerwear">Outerwear</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div className="form-group">
            <label>Upload Image</label>
            <input type="file" accept="image/*" required />
          </div>

          <button type="submit" className="add-btn">Add Item</button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddItem;
