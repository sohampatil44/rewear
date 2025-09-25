import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import API from "../services/api";

function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get("/items").then((res) => setItems(res.data));
  }, []);

  return (
    <Grid container spacing={2} sx={{ mt: 3 }}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item._id}>
          <Card>
            {item.image && (
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:5000${item.image}`}
                alt={item.title}
              />
            )}
            <CardContent>
              <Typography variant="h6">{item.title}</Typography>
              <Typography>{item.description}</Typography>
              <Typography variant="caption">By {item.user?.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ItemList;
