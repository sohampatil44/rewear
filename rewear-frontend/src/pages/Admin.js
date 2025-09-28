import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  Box,
  Paper,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  Delete,
  HourglassEmpty,
  ThumbUp,
  ThumbDown,
  PersonRemove,
  AdminPanelSettings,
  Person,
} from "@mui/icons-material";

// ✅ Navbar & Footer
import Navbar from "./Navbar";
import Footer from "./Footer";

function Admin() {
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // ✅ Protect Admin Page
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/login"); // redirect non-admins
    }
  }, [user, navigate]);

  // Load items, swaps, users
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:5000/api/admin/items", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/admin/swaps", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSwaps(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  // Approve item
  const handleApprove = (id) => {
    axios
      .put(`http://localhost:5000/api/admin/items/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setItems((prev) => prev.map((i) => (i._id === id ? res.data : i))));
  };

  // Delete item
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/admin/items/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setItems((prev) => prev.filter((i) => i._id !== id)));
  };

  // Update swap status
  const handleSwapStatus = (id, status) => {
    axios
      .put(`http://localhost:5000/api/admin/swaps/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setSwaps((prev) => prev.map((s) => (s._id === id ? res.data : s))));
  };

  // Delete user
  const handleDeleteUser = (id) => {
    axios
      .delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setUsers((prev) => prev.filter((u) => u._id !== id)));
  };

  // Toggle admin role
  const handleToggleAdmin = (id, makeAdmin) => {
    axios
      .put(
        `http://localhost:5000/api/admin/users/${id}/role`,
        { isAdmin: makeAdmin },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u))));
  };

  return (
    <>

      {/* Main Content */}
      <Container sx={{ mt: 6, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg,#f5f7fa,#c3cfe2)" }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" color="primary">
            Admin Dashboard
          </Typography>
          <Typography align="center" sx={{ mb: 4 }} color="text.secondary">
            Manage Items, Swaps & Users
          </Typography>

          {/* Items Section */}
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
            Items Pending Approval
          </Typography>
          <Grid container spacing={3}>
            {items.length === 0 && (
              <Typography sx={{ ml: 2 }} color="text.secondary">
                ✅ No items pending.
              </Typography>
            )}
            {items.map((item) => (
              <Grid item xs={12} md={6} key={item._id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                  <CardContent>
                    {/* Item image */}
                    {item.imageUrl && (
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "10px" }}
                        />
                      </Box>
                    )}

                    <Typography variant="h6" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>

                    {/* Uploader info */}
                    <Box mt={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar>{item.uploader?.name?.charAt(0)}</Avatar>
                      <Box>
                        <Typography>{item.uploader?.name || "Unknown"}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.uploader?.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={{ mt: 1 }}>Condition: {item.condition}</Typography>
                    <Box mt={1}>
                      {item.isApproved ? (
                        <Chip icon={<CheckCircle />} label="Approved" color="success" />
                      ) : (
                        <Chip icon={<HourglassEmpty />} label="Pending" color="warning" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    {!item.isApproved && (
                      <Button variant="contained" startIcon={<ThumbUp />} color="success" onClick={() => handleApprove(item._id)}>
                        Approve
                      </Button>
                    )}
                    <Button variant="outlined" startIcon={<Delete />} color="error" onClick={() => handleDelete(item._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5 }} />

          {/* Swaps Section */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            Swaps Management
          </Typography>
          <Grid container spacing={3}>
            {swaps.length === 0 && (
              <Typography sx={{ ml: 2 }} color="text.secondary">
                🔄 No swaps to review.
              </Typography>
            )}
            {swaps.map((swap) => (
              <Grid item xs={12} md={6} key={swap._id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                  <CardContent>
                    <Typography>
                      <b>{swap.fromUser?.name}</b> offered <b>{swap.itemOffered?.title}</b> to{" "}
                      <b>{swap.toUser?.name}</b> for <b>{swap.itemRequested?.title}</b>
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={swap.status.toUpperCase()}
                        color={
                          swap.status === "accepted"
                            ? "success"
                            : swap.status === "rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    </Box>
                  </CardContent>
                  {swap.status === "pending" && (
                    <CardActions>
                      <Button variant="contained" color="success" startIcon={<ThumbUp />} onClick={() => handleSwapStatus(swap._id, "accepted")}>
                        Accept
                      </Button>
                      <Button variant="outlined" color="error" startIcon={<ThumbDown />} onClick={() => handleSwapStatus(swap._id, "rejected")}>
                        Reject
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 5 }} />

          {/* ✅ Users Section */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            User Management
          </Typography>
          <Grid container spacing={3}>
            {users.length === 0 && (
              <Typography sx={{ ml: 2 }} color="text.secondary">
                👤 No users found.
              </Typography>
            )}
            {users.map((usr) => (
              <Grid item xs={12} md={6} key={usr._id}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                  <CardContent>
                    <Typography variant="h6">{usr.name}</Typography>
                    <Typography>Email: {usr.email}</Typography>
                    <Chip
                      icon={usr.isAdmin ? <AdminPanelSettings /> : <Person />}
                      label={usr.isAdmin ? "Admin" : "User"}
                      color={usr.isAdmin ? "success" : "default"}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    {usr.isAdmin ? (
                      <Button variant="outlined" color="warning" onClick={() => handleToggleAdmin(usr._id, false)}>
                        Remove Admin
                      </Button>
                    ) : (
                      <Button variant="contained" color="primary" onClick={() => handleToggleAdmin(usr._id, true)}>
                        Make Admin
                      </Button>
                    )}
                    <Button variant="outlined" startIcon={<PersonRemove />} color="error" onClick={() => handleDeleteUser(usr._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

    </>
  );
}

export default Admin;
