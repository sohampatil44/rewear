import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Container, Typography, Button, Card, CardContent } from "@mui/material";

export default function SwapItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get("/swaps").then((res) => setItems(res.data)).catch(console.error);
  }, []);

  const handleAdd = async () => {
    const sampleItem = {
      title: "Blue Jacket",
      description: "Good condition, size M",
    };
    try {
      await API.post("/swaps/create", sampleItem);
      alert("Item added!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding item");
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h5">Swap Items</Typography>
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>
        Add Sample Item
      </Button>
      {items.map((item) => (
        <Card key={item._id} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">{item.title}</Typography>
            <Typography>{item.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
