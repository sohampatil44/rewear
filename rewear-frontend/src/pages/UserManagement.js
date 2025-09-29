import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Card, CardContent,
  CardActions, Button, Grid
} from "@mui/material";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch all users
  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));
  }, [token]);

  // Toggle Admin Role
  const toggleAdmin = (id) => {
    axios.put(
      `http://localhost:5000/api/admin/users/${id}/toggle-admin`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      setUsers(prev => prev.map(u => (u._id === id ? res.data : u)));
    });
  };

  // Delete User
  const deleteUser = (id) => {
    axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setUsers(prev => prev.filter(u => u._id !== id));
    });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Grid container spacing={2}>
        {users.map(user => (
          <Grid item xs={12} md={6} key={user._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{user.name}</Typography>
                <Typography>Email: {user.email}</Typography>
                <Typography>
                  Role: {user.isAdmin ? "Admin ✅" : "User"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => toggleAdmin(user._id)}
                  color={user.isAdmin ? "warning" : "success"}
                >
                  {user.isAdmin ? "Demote to User" : "Promote to Admin"}
                </Button>
                <Button
                  onClick={() => deleteUser(user._id)}
                  color="error"
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default UserManagement;
