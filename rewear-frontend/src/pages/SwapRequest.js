// src/pages/SwapRequest.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";  // ✅ ADDED
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Typography, Card, CardContent, Button, Grid } from "@mui/material";
import { toast } from "react-toastify";

const SwapRequest = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch the requested item details
  useEffect(() => {
    if (!itemId) return;

    API.get(`/items/${itemId}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error(err));
  }, [itemId]);

  // ✅ Fetch user's items
  useEffect(() => {
    API.get("/items/my-items")
      .then((res) => setMyItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Send swap request
  const handleSwap = (offeredItemId) => {
    API.post("/swaps", {
      itemRequested: itemId,
      itemOffered: offeredItemId,
    })
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
                  src={item.imageUrl}   // ✅ relative URL only
                  alt={item.title}
                  style={{ width: "200px", borderRadius: "8px" }}
                />
                <Typography>{item.description}</Typography>
                <Typography color="text.secondary">
                  Listed by {item.uploader?.name}
                </Typography>
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
