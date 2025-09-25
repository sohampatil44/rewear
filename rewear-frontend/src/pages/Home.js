import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to ReWear 👕
      </Typography>
      <Typography variant="body1" gutterBottom>
        A platform to share, swap and give clothes a second life.
      </Typography>
      <Button component={Link} to="/login" variant="contained" sx={{ mr: 2 }}>
        Login
      </Button>
      <Button component={Link} to="/register" variant="outlined">
        Register
      </Button>
    </Container>
  );
}

export default Home;
