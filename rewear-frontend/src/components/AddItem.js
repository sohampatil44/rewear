import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Stack, Alert } from "@mui/material";

export default function AddItem({ token, onItemAdded }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (!token) { setMessage("You must be logged in"); return; }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("size", size);
    formData.append("condition", condition);
    if (image) formData.append("image", image);

    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message || "Item added successfully!");
    setTitle(""); setType(""); setSize(""); setCondition(""); setImage(null);
    if (onItemAdded) onItemAdded();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">Add New Item</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Type" value={type} onChange={(e) => setType(e.target.value)} fullWidth />
          <TextField label="Size" value={size} onChange={(e) => setSize(e.target.value)} fullWidth />
          <TextField label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} fullWidth />
          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
          </Button>
          <Button variant="contained" onClick={handleSubmit}>Add Item</Button>
          {message && <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
}
