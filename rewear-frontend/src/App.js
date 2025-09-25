import React, { useState } from "react";
import { Container, Typography, Divider } from "@mui/material";
import Landing from "./components/Landing";
import Auth from "./components/Auth";
import AddItem from "./components/AddItem";
import Items from "./components/Items";
import Swaps from "./components/Swaps";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState("");
  const [refresh, setRefresh] = useState(false);

  const handleItemAdded = () => setRefresh(!refresh);
  const handleSwapAction = () => setRefresh(!refresh);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        ReWear
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Landing page carousel */}
      <Landing />

      {/* Auth */}
      <Auth setToken={setToken} />

      {/* Dashboard */}
      {token && <Dashboard token={token} />}

      {/* Add Items */}
      <AddItem token={token} onItemAdded={handleItemAdded} />

      {/* Items List */}
      <Items token={token} refresh={refresh} onSwap={handleSwapAction} />

      {/* Swaps */}
      <Swaps token={token} />
    </Container>
  );
}

export default App;
