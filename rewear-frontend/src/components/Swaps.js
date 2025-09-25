import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

export default function Swaps({ token }) {
  const [swaps, setSwaps] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchSwaps = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/swaps`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSwaps(data);
  };

  useEffect(() => { fetchSwaps(); }, [token]);

  const handleRedeem = async (itemId) => {
    const res = await fetch(`${API_URL}/swaps/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId }),
    });
    const data = await res.json();
    alert(data.message || JSON.stringify(data));
    fetchSwaps();
  };

  if (!token) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">My Swaps</Typography>
        {swaps.length === 0 ? <Typography>No swaps yet</Typography> :
          swaps.map((swap) => (
            <Stack key={swap._id} spacing={1} sx={{ mt: 1, mb: 1 }}>
              <Typography>{swap.item.title} - {swap.status}</Typography>
              {swap.status === "ongoing" && <Button variant="contained" onClick={() => handleRedeem(swap.item._id)}>Redeem Points</Button>}
            </Stack>
          ))
        }
      </CardContent>
    </Card>
  );
}
