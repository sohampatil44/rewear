import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import API from "../services/api";

function AddItem({ onItemAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      const res = await API.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onItemAdded(res.data);
      setTitle(""); setDescription(""); setCategory(""); setImage(null);
    } catch (err) {
      alert("Failed to add item");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Description"
        fullWidth
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        label="Category"
        fullWidth
        margin="normal"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Button variant="contained" component="label" sx={{ mt: 2 }}>
        Upload Image
        <input hidden type="file" onChange={(e) => setImage(e.target.files[0])} />
      </Button>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Add Item
      </Button>
    </Box>
  );
}

export default AddItem;
