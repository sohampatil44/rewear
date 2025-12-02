import React, { useEffect, useState } from "react";
import API from "../services/api"; // ✅ added
import {
  Container, Typography, Card, CardContent,
  CardActions, Button, Grid
} from "@mui/material";

function UserManagement() {
  const [users, setUsers] = useState([]);

  // ✅ Fetch all users
  useEffect(() => {
    API.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Toggle admin role
  const toggleAdmin = (id) => {
    API.put(`/admin/users/${id}/toggle-admin`, {})
      .then(res => {
        setUsers(prev => prev.map(u => (u._id === id ? res.data : u)));
      })
      .catch(err => console.error(err));
  };

  // ✅ Delete user
  const deleteUser = (id) => {
    API.delete(`/admin/users/${id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u._id !== id));
      })
      .catch(err => console.error(err));
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
