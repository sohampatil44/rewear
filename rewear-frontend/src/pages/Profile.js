import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Avatar
} from "@mui/material";
import { Edit, Save, Cancel, Person, Email, Phone, Home } from "@mui/icons-material";
import API from "../services/api";
import Navbar from "../pages/Navbar"; // Adjust path as needed
import Footer from "../pages/Footer"; // Adjust path as needed

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      console.log("🔄 Fetching user profile from /api/users/me...");
      
      const response = await API.get("/users/me");
      console.log("✅ Profile data received:", response.data);
      
      setUser(response.data);
      setEditedUser(response.data);
      
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      
      let errorMsg = "Failed to load profile";
      if (error.response?.status === 401) {
        errorMsg = "Please login again";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else if (error.response?.status === 404) {
        errorMsg = "User not found";
      }
      
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      if (!editedUser.name?.trim()) {
        setMessage({ type: 'error', text: 'Name is required' });
        return;
      }

      const response = await API.put("/users/me", editedUser);
      setUser(response.data);
      setIsEditing(false);
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, py: 4 }}>
            <Container maxWidth="md">
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress size={60} />
                <Typography variant="h6">Loading your profile...</Typography>
              </Box>
            </Container>
          </Box>
          <Footer />
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Main Content */}
        <Box sx={{ flex: 1, py: 4, mt: 8 }}> {/* mt: 8 to account for fixed navbar */}
          <Container maxWidth="lg">
            {!user ? (
              <Alert severity="error" sx={{ mt: 3 }}>
                {message.text}
                <Button onClick={fetchUserProfile} sx={{ ml: 2 }} size="small">
                  Try Again
                </Button>
              </Alert>
            ) : (
              <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {user.name}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {user.email}
                      </Typography>
                      <Chip 
                        label={`User ID: ${user._id?.substring(0, 8)}...`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  {!isEditing ? (
                    <Button 
                      variant="contained" 
                      startIcon={<Edit />} 
                      onClick={handleEdit}
                      size="large"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Cancel />} 
                        onClick={handleCancel} 
                        disabled={saving}
                        size="large"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<Save />} 
                        onClick={handleSave} 
                        disabled={saving} 
                        color="success"
                        size="large"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </Box>

                {message.text && (
                  <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                  </Alert>
                )}

                <Divider sx={{ mb: 4 }} />

                {/* Profile Form */}
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                      Personal Information
                    </Typography>
                    
                    <TextField
                      label="Full Name"
                      value={editedUser.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} /> }}
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      label="Email Address"
                      type="email"
                      value={editedUser.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      label="Phone Number"
                      value={editedUser.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }}
                      placeholder="+1 (555) 123-4567"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                      Address Information
                    </Typography>
                    
                    <TextField
                      label="Street Address"
                      value={editedUser.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      fullWidth
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      multiline
                      rows={3}
                      InputProps={{ startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} /> }}
                      placeholder="Enter your complete address"
                      sx={{ mb: 3 }}
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="City"
                          value={editedUser.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          fullWidth
                          disabled={!isEditing}
                          variant={isEditing ? "outlined" : "filled"}
                          placeholder="Your city"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Zip Code"
                          value={editedUser.zipCode || ''}
                          onChange={(e) => handleChange('zipCode', e.target.value)}
                          fullWidth
                          disabled={!isEditing}
                          variant={isEditing ? "outlined" : "filled"}
                          placeholder="12345"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Additional Info Section */}
                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
                    Account Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Member Since</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">User Role</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.role || 'User'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Reward Points</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.points || 100} points
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Account Status</Typography>
                      <Chip label="Active" color="success" size="small" />
                    </Grid>
                  </Grid>
                </Box>

                {/* Edit Mode Instructions */}
                {isEditing && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> Update your profile information and click "Save Changes" to apply updates.
                    </Typography>
                  </Alert>
                )}
              </Paper>
            )}
          </Container>
        </Box>

     
      </Box>
    </>
  );
}

export default Profile;