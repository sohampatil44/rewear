import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
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
  CircularProgress,
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
import { toast } from "react-toastify";

function Admin() {
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // ✅ Protect Admin Page
  useEffect(() => {
    if (!user || !user.isAdmin) {
      toast.error("Access denied. Admin only.");
      navigate("/login");
    }
  }, [user, navigate]);

  // ✅ Fetch all data
  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // ✅ Add timestamp to bust cache
      const timestamp = Date.now();
      
      const [itemsRes, swapsRes, usersRes] = await Promise.all([
        API.get(`/admin/items?_=${timestamp}`),
        API.get(`/admin/swaps?_=${timestamp}`),
        API.get(`/admin/users?_=${timestamp}`),
      ]);
  
      console.log("✅ Items fetched:", itemsRes.data);
      console.log("✅ Swaps fetched:", swapsRes.data);
      console.log("✅ Users fetched:", usersRes.data);
  
      setItems(itemsRes.data);
      setSwaps(swapsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [token]);

  // ✅ FIX: Approve item and refetch
  const handleApprove = async (id) => {
    try {
      console.log("🔄 Approving item:", id);
     
      // ✅ FORCE immediate UI update
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === id 
            ? { ...item, isApproved: true }
            : item
        )
      );
      const res = await API.put(`/admin/items/${id}/approve`);
      console.log("✅ Item approved:", res.data);
      toast.success("Item approved successfully!");
      
      
      // ✅ Also refetch to ensure data consistency
      await fetchData();
      
    } catch (err) {
      console.error("❌ Approve error:", err);
      toast.error(err.response?.data?.message || "Failed to approve item");
    }
  };

  // ✅ Delete item and refetch
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      console.log("🗑️ Deleting item:", id);
      await API.delete(`/admin/items/${id}`);
      console.log("✅ Item deleted");
      toast.success("Item deleted successfully!");
      
      // ✅ Refetch to update list
      fetchData();
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  // ✅ Update swap status and refetch
  const handleSwapStatus = async (id, status) => {
    try {
      console.log(`🔄 Updating swap ${id} to ${status}`);
      const res = await API.put(`/admin/swaps/${id}`, { status });
      console.log("✅ Swap updated:", res.data);
      toast.success(`Swap ${status} successfully!`);
      
      // ✅ Refetch to update list
      fetchData();
    } catch (err) {
      console.error("❌ Swap status error:", err);
      toast.error(err.response?.data?.message || "Failed to update swap");
    }
  };

  // ✅ Delete user and refetch
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      console.log("🗑️ Deleting user:", id);
      await API.delete(`/admin/users/${id}`);
      console.log("✅ User deleted");
      toast.success("User deleted successfully!");
      
      // ✅ Refetch to update list
      fetchData();
    } catch (err) {
      console.error("❌ Delete user error:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // ✅ Toggle admin role and refetch
  const handleToggleAdmin = async (id, makeAdmin) => {
    try {
      console.log(`🔄 ${makeAdmin ? "Promoting" : "Demoting"} user ${id}`);
      const res = await API.put(`/admin/users/${id}/role`, { isAdmin: makeAdmin });
      console.log("✅ User role updated:", res.data);
      toast.success(`User ${makeAdmin ? "promoted to" : "demoted from"} admin!`);
      
      // ✅ Refetch to update list
      fetchData();
    } catch (err) {
      console.error("❌ Toggle admin error:", err);
      toast.error(err.response?.data?.message || "Failed to update user role");
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <>
      <Container sx={{ mt: 6, mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg,#f5f7fa,#c3cfe2)" }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" color="primary">
            🛡️ Admin Dashboard
          </Typography>
          <Typography align="center" sx={{ mb: 4 }} color="text.secondary">
            Manage Items, Swaps & Users
          </Typography>

          {/* Items Section */}
          <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
            📦 All Items (Approved + Pending)
          </Typography>
          <Grid container spacing={3}>
            {items.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  ✅ No items found
                </Typography>
              </Grid>
            ) : (
              items.map((item) => (
                <Grid item xs={12} md={6} key={item._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardContent>
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

                      <Box mt={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar>{item.uploader?.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography>{item.uploader?.name || "Unknown"}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.uploader?.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography sx={{ mt: 1 }}>
                        <strong>Category:</strong> {item.category}
                      </Typography>
                      <Box mt={1}>
                        {item.isApproved ? (
                          <Chip icon={<CheckCircle />} label="Approved" color="success" />
                        ) : (
                          <Chip icon={<HourglassEmpty />} label="Pending Approval" color="warning" />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      {!item.isApproved && (
                        <Button
                          variant="contained"
                          startIcon={<ThumbUp />}
                          color="success"
                          onClick={() => handleApprove(item._id)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
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

          <Divider sx={{ my: 5 }} />

          {/* Swaps Section */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            🔄 Swaps Management
          </Typography>
          <Grid container spacing={3}>
            {swaps.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No swaps to review
                </Typography>
              </Grid>
            ) : (
              swaps.map((swap) => (
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
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ThumbUp />}
                          onClick={() => handleSwapStatus(swap._id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<ThumbDown />}
                          onClick={() => handleSwapStatus(swap._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Divider sx={{ my: 5 }} />

          {/* Users Section */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            👥 User Management
          </Typography>
          <Grid container spacing={3}>
            {users.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No users found
                </Typography>
              </Grid>
            ) : (
              users.map((usr) => (
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
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => handleToggleAdmin(usr._id, false)}
                        >
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleToggleAdmin(usr._id, true)}
                        >
                          Make Admin
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<PersonRemove />}
                        color="error"
                        onClick={() => handleDeleteUser(usr._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>
      </Container>
    </>
  );
}

export default Admin;