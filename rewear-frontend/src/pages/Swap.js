// src/pages/Swap.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";

const Swap = () => {
  const [swaps, setSwaps] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "" });

  const token = localStorage.getItem("token");

  // ✅ Fetch swaps & items
  useEffect(() => {
    if (!token) return;

    // My swap requests
    axios
      .get("http://localhost:5000/api/swaps", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSwaps(res.data))
      .catch((err) => console.error("Error fetching swaps:", err));

    // My uploaded items
    axios
      .get("http://localhost:5000/api/items/my-items", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyItems(res.data))
      .catch((err) => console.error("Error fetching my items:", err));
  }, [token]);

  // ✅ Handle swap accept/reject
  const handleUpdateSwap = (id, status) => {
    axios
      .put(
        `http://localhost:5000/api/swaps/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setSwaps((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      })
      .catch((err) => console.error(err));
  };

  // ✅ Delete item
  const handleDeleteItem = (id) => {
    axios
      .delete(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMyItems((prev) => prev.filter((i) => i._id !== id));
        toast.success("🗑️ Item deleted");
      })
      .catch((err) => {
        console.error("Delete error:", err);
        toast.error("❌ Failed to delete item");
      });
  };

  // ✅ Start editing item
  const startEdit = (item) => {
    setEditingItem(item._id);
    setEditForm({ title: item.title, description: item.description, category: item.category });
  };

  // ✅ Save edited item
  const handleEditSave = (id) => {
    axios
      .put(
        `http://localhost:5000/api/items/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setMyItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
        setEditingItem(null);
        toast.success("✏️ Item updated");
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast.error("❌ Failed to update item");
      });
  };

  return (
    <>

      <Container sx={{ mt: 12, mb: 6 }}>
        {/* ✅ My Uploaded Items */}
        <Typography variant="h4" gutterBottom>
          My Items
        </Typography>

        {myItems.length === 0 ? (
          <Typography color="text.secondary">You haven’t uploaded any items yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {myItems.map((item) => (
              <Grid item xs={12} md={6} key={item._id}>
                <Card>
                  <CardContent>
                    {editingItem === item._id ? (
                      <>
                        <TextField
                          label="Title"
                          name="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Description"
                          name="description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          multiline
                          rows={2}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                        <Select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          fullWidth
                        >
                          <MenuItem value="tops">Tops</MenuItem>
                          <MenuItem value="dresses">Dresses</MenuItem>
                          <MenuItem value="outerwear">Outerwear</MenuItem>
                          <MenuItem value="shoes">Shoes</MenuItem>
                          <MenuItem value="accessories">Accessories</MenuItem>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography>{item.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {item.category}
                        </Typography>
                        <Chip
                          label={item.isApproved ? "Approved ✅" : "Pending ⏳"}
                          color={item.isApproved ? "success" : "warning"}
                          sx={{ mt: 1 }}
                        />
                      </>
                    )}
                  </CardContent>
                  <CardActions>
                    {editingItem === item._id ? (
                      <>
                        <Button onClick={() => handleEditSave(item._id)} color="success">
                          Save
                        </Button>
                        <Button onClick={() => setEditingItem(null)} color="error">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEdit(item)} color="primary">
                          Edit
                        </Button>
                        <Button onClick={() => handleDeleteItem(item._id)} color="error">
                          Delete
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ✅ Divider */}
        <Typography variant="h4" gutterBottom sx={{ mt: 6 }}>
          My Swap Requests
        </Typography>

        {swaps.length === 0 ? (
          <Typography color="text.secondary">
            No swaps yet. Start swapping from the Browse page!
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {swaps.map((swap) => (
              <Grid item xs={12} md={6} key={swap._id}>
                <Card>
                  <CardContent>
                    <Typography>
                      <b>{swap.fromUser?.name}</b> offered <b>{swap.itemOffered?.title}</b>{" "}
                      to <b>{swap.toUser?.name}</b> for <b>{swap.itemRequested?.title}</b>
                    </Typography>
                    <Chip
                      label={swap.status.toUpperCase()}
                      color={
                        swap.status === "accepted"
                          ? "success"
                          : swap.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      sx={{ mt: 1 }}
                    />
                  </CardContent>

                  {swap.status === "pending" && (
                    <CardActions>
                      <Button
                        color="success"
                        variant="contained"
                        onClick={() => handleUpdateSwap(swap._id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => handleUpdateSwap(swap._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

    </>
  );
};

export default Swap;
