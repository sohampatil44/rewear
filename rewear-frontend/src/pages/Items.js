import React, { useState, useEffect } from "react";
import { Container, Typography, Button } from "@mui/material";
import AddItem from "../components/AddItem";
import ItemList from "../components/ItemList";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Items() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const { data } = await API.get("api/items");
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemAdded = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Items</Typography>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={handleLogout}>
        Logout
      </Button>
      <AddItem onItemAdded={handleItemAdded} />
      <ItemList items={items} />
    </Container>
  );
}

export default Items;
