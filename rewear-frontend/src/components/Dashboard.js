import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function Dashboard({ token }) {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      // fetch profile
      const profileRes = await fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const profileData = await profileRes.json();
      setUser(profileData);

      // fetch user uploaded items
      const itemsRes = await fetch(`${API_URL}/items?user=true`, { headers: { Authorization: `Bearer ${token}` } });
      const itemsData = await itemsRes.json();
      setUploads(itemsData);

      // fetch swaps
      const swapsRes = await fetch(`${API_URL}/swaps`, { headers: { Authorization: `Bearer ${token}` } });
      const swapsData = await swapsRes.json();
      setSwaps(swapsData);
    };
    fetchData();
  }, [token]);

  if (!token) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">Dashboard</Typography>
        {user && <Typography>Points: {user.points}</Typography>}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="h6">Your Uploaded Items</Typography>
          {uploads.length === 0 ? <Typography>No items uploaded</Typography> :
            uploads.map((item) => <Typography key={item._id}>{item.title} - {item.type}</Typography>)
          }
        </Stack>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography variant="h6">Your Swaps</Typography>
          {swaps.length === 0 ? <Typography>No swaps yet</Typography> :
            swaps.map((swap) => <Typography key={swap._id}>{swap.item.title} - {swap.status}</Typography>)
          }
        </Stack>
      </CardContent>
    </Card>
  );
}
