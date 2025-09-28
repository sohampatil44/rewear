import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./AddItem.css";
import axios from "axios";
import { toast } from "react-toastify";

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("⚠️ Please login first!");
        navigate("/login");
        return;
      }

      // ✅ Prepare form data for file upload
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("image", formData.image);

      // ✅ Send to backend
      await axios.post("http://localhost:5000/api/items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Item request sent to admin. Await approval!");
      navigate("/browse"); // redirect
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to upload item. Try again!");
    }
  };

  return (
    <div className="add-page">
      <Navbar />

      <div className="add-container">
        <h2>Add New Item</h2>
        <p>Upload clothing you no longer use and make it available for swapping!</p>

        <form className="add-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="title"
              placeholder="Ex: Blue T-Shirt"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Brief details about your item..."
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
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
            <input type="file" name="image" accept="image/*" onChange={handleChange} required />
          </div>

          <button type="submit" className="add-btn">
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
