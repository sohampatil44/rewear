// src/pages/SwapRequest.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Typography, Card, CardContent, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";

const SwapRequest = () => {
  const { itemId } = useParams(); // item to request
  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch the requested item details
  useEffect(() => {
    if (!itemId) return;
    axios
      .get(`http://localhost:5000/api/items/${itemId}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error(err));
  }, [itemId]);

  // Fetch user's own items
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/items/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyItems(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const handleSwap = (offeredItemId) => {
    axios
      .post(
        "http://localhost:5000/api/swaps",
        {
          itemRequested: itemId,
          itemOffered: offeredItemId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("✅ Swap request sent!");
        navigate("/swap");
      })
      .catch(() => toast.error("❌ Failed to send swap request"));
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 12, mb: 6 }}>
        {item && (
          <>
            <Typography variant="h4" gutterBottom>
              Swap for: {item.title}
            </Typography>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <img
                  src={`http://localhost:5000${item.imageUrl}`}
                  alt={item.title}
                  style={{ width: "200px", borderRadius: "8px" }}
                />
                <Typography>{item.description}</Typography>
                <Typography color="text.secondary">Listed by {item.uploader?.name}</Typography>
              </CardContent>
            </Card>
          </>
        )}

        <Typography variant="h5" gutterBottom>
          Choose one of your items to offer:
        </Typography>
        <Grid container spacing={3}>
          {myItems.length === 0 ? (
            <Typography>You don’t have any items listed yet.</Typography>
          ) : (
            myItems.map((myItem) => (
              <Grid item xs={12} md={4} key={myItem._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{myItem.title}</Typography>
                    <Typography>{myItem.description}</Typography>
                  </CardContent>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSwap(myItem._id)}
                  >
                    Offer this
                  </Button>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default SwapRequest;
