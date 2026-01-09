import React, { useState, useEffect } from "react";
import API from "../services/api";
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

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const drawerWidth = 240;

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("items");
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch data with dependency on activePage
  const fetchData = () => {
    if (activePage === "items") {
      API.get("/admin/items")
        .then((res) => setItems(res.data))
        .catch((err) => console.error("Fetch items error:", err));
    } else if (activePage === "swaps") {
      API.get("/admin/swaps")
        .then((res) => setSwaps(res.data))
        .catch((err) => console.error("Fetch swaps error:", err));
    } else if (activePage === "users") {
      API.get("/admin/users")
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Fetch users error:", err));
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePage, token]);

  // ✅ Approve item and refetch
  const handleApprove = (id) => {
    API.put(`/admin/items/${id}/approve`)
      .then((res) => {
        console.log("Item approved:", res.data);
        fetchData(); // ✅ Refetch to update UI
      })
      .catch((err) => console.error("Approve error:", err));
  };

  // ✅ Delete item and refetch
  const handleDelete = (id) => {
    API.delete(`/admin/items/${id}`)
      .then(() => {
        console.log("Item deleted");
        fetchData(); // ✅ Refetch to update UI
      })
      .catch((err) => console.error("Delete error:", err));
  };

  // ✅ Update swap status and refetch
  const handleSwapStatus = (id, status) => {
    API.put(`/admin/swaps/${id}`, { status })
      .then((res) => {
        console.log("Swap status updated:", res.data);
        fetchData(); // ✅ Refetch to update UI
      })
      .catch((err) => console.error("Swap status error:", err));
  };

  const menu = [
    { text: "Dashboard", icon: <Dashboard />, page: "dashboard" },
    { text: "Items", icon: <Inventory />, page: "items" },
    { text: "Swaps", icon: <SwapHoriz />, page: "swaps" },
    { text: "Users", icon: <People />, page: "users" },
    { text: "Reports", icon: <Assessment />, page: "reports" },
  ];

  return (
    <>
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
              {items.length === 0 ? (
                <Grid item xs={12}>
                  <Typography>No items found</Typography>
                </Grid>
              ) : (
                items.map((item) => (
                  <Grid item xs={12} md={6} key={item._id}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2">Uploader: {item.uploader?.name}</Typography>
                        <Typography variant="body2">Category: {item.category}</Typography>
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
                ))
              )}
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

      <Footer />
    </>
  );
}