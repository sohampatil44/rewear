import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Card, CardContent,
  Button, Grid, TextField, MenuItem, Box
} from "@mui/material";

function Swap() {
  const [swaps, setSwaps] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ toUser: "", itemOffered: "", itemRequested: "" });
  const token = localStorage.getItem("token");

  // Load swaps
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/swaps", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setSwaps(res.data))
      .catch(err => console.error(err));

    axios
      .get("http://localhost:5000/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setItems(res.data))
      .catch(err => console.error(err));

    axios
      .get("http://localhost:5000/api/auth/users", {   // you'll need this route
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const handleStatusChange = (id, status) => {
    axios
      .put(
        `http://localhost:5000/api/swaps/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        setSwaps(prev =>
          prev.map(s => (s._id === id ? { ...s, status: res.data.status } : s))
        );
      });
  };

  const handleSwapRequest = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/swaps", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setSwaps(prev => [res.data, ...prev]);
        setForm({ toUser: "", itemOffered: "", itemRequested: "" });
      })
      .catch(err => console.error(err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Swaps</Typography>

      {/* Swap Request Form */}
      <Box component="form" onSubmit={handleSwapRequest} sx={{ mb: 4 }}>
        <Typography variant="h6">Propose a Swap</Typography>
        <TextField
          select fullWidth margin="normal"
          label="Select User"
          value={form.toUser}
          onChange={(e) => setForm({ ...form, toUser: e.target.value })}
        >
          {users.map(u => (
            <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select fullWidth margin="normal"
          label="Your Item to Offer"
          value={form.itemOffered}
          onChange={(e) => setForm({ ...form, itemOffered: e.target.value })}
        >
          {items.map(i => (
            <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select fullWidth margin="normal"
          label="Item You Want"
          value={form.itemRequested}
          onChange={(e) => setForm({ ...form, itemRequested: e.target.value })}
        >
          {items.map(i => (
            <MenuItem key={i._id} value={i._id}>{i.name}</MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Send Swap Request</Button>
      </Box>

      {/* Swap List */}
      <Grid container spacing={2}>
        {swaps.map(swap => (
          <Grid item xs={12} md={6} key={swap._id}>
            <Card>
              <CardContent>
                <Typography>
                  From: {swap.fromUser?.name} → To: {swap.toUser?.name}
                </Typography>
                <Typography>
                  Offered: {swap.itemOffered?.name} | Requested: {swap.itemRequested?.name}
                </Typography>
                <Typography>Status: {swap.status}</Typography>
                {swap.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(swap._id, "accepted")}
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(swap._id, "rejected")}
                      color="error"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Swap;
