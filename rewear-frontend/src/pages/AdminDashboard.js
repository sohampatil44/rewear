import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Inventory,
  SwapHoriz,
  People,
  Assessment,
  ThumbUp,
  ThumbDown,
  Delete,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";

// ✅ Import Navbar & Footer
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const drawerWidth = 240;

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("items");
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch data
  useEffect(() => {
    if (activePage === "items") {
      axios
        .get("http://localhost:5000/api/admin/items", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setItems(res.data))
        .catch((err) => console.error(err));
    } else if (activePage === "swaps") {
      axios
        .get("http://localhost:5000/api/admin/swaps", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setSwaps(res.data))
        .catch((err) => console.error(err));
    } else if (activePage === "users") {
      axios
        .get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [activePage, token]);

  // Actions
  const handleApprove = (id) => {
    axios
      .put(`http://localhost:5000/api/admin/items/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/admin/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setItems((prev) => prev.filter((i) => i._id !== id));
      });
  };

  const handleSwapStatus = (id, status) => {
    axios
      .put(
        `http://localhost:5000/api/admin/swaps/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setSwaps((prev) => prev.map((s) => (s._id === id ? res.data : s)));
      });
  };

  // Sidebar menu
  const menu = [
    { text: "Dashboard", icon: <Dashboard />, page: "dashboard" },
    { text: "Items", icon: <Inventory />, page: "items" },
    { text: "Swaps", icon: <SwapHoriz />, page: "swaps" },
    { text: "Users", icon: <People />, page: "users" },
    { text: "Reports", icon: <Assessment />, page: "reports" },
  ];

  return (
    <>
      {/* ✅ Top Navbar */}
      <Navbar />

      <Box sx={{ display: "flex", minHeight: "80vh" }}>
        {/* Sidebar */}
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "#1976d2",
              color: "#fff",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Typography variant="h5" align="center" sx={{ py: 3, fontWeight: "bold" }}>
            Admin Panel
          </Typography>
          <List>
            {menu.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => setActivePage(item.page)}
                sx={{
                  background: activePage === item.page ? "rgba(255,255,255,0.2)" : "transparent",
                  borderRadius: 2,
                  mx: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </Typography>

          {/* Items Page */}
          {activePage === "items" && (
            <Grid container spacing={3}>
              {items.map((item) => (
                <Grid item xs={12} md={6} key={item._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2">Uploader: {item.uploader?.name}</Typography>
                      <Typography variant="body2">Condition: {item.condition}</Typography>
                      {item.isApproved ? (
                        <Chip icon={<CheckCircle />} label="Approved" color="success" sx={{ mt: 1 }} />
                      ) : (
                        <Chip icon={<HourglassEmpty />} label="Pending" color="warning" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                    <CardActions>
                      {!item.isApproved && (
                        <Button
                          startIcon={<ThumbUp />}
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(item._id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        startIcon={<Delete />}
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Swaps Page */}
          {activePage === "swaps" && (
            <Grid container spacing={3}>
              {swaps.map((swap) => (
                <Grid item xs={12} md={6} key={swap._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Typography>
                        {swap.fromUser?.name} offered <b>{swap.itemOffered?.title}</b> to{" "}
                        {swap.toUser?.name} for <b>{swap.itemRequested?.title}</b>
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
                          startIcon={<ThumbUp />}
                          variant="contained"
                          color="success"
                          onClick={() => handleSwapStatus(swap._id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          startIcon={<ThumbDown />}
                          variant="outlined"
                          color="error"
                          onClick={() => handleSwapStatus(swap._id, "rejected")}
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

          {/* Users Page */}
          {activePage === "users" && (
            <Grid container spacing={2}>
              {users.map((user) => (
                <Grid item xs={12} md={6} key={user._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography>Email: {user.email}</Typography>
                      <Chip
                        label={user.isAdmin ? "Admin" : "User"}
                        color={user.isAdmin ? "success" : "default"}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Reports Page */}
          {activePage === "reports" && (
            <Typography variant="h6" color="text.secondary">
              📊 Reports feature coming soon...
            </Typography>
          )}
        </Box>
      </Box>

      {/* ✅ Footer */}
      <Footer />
    </>
  );
}
