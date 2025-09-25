import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Stack, CardMedia } from "@mui/material";

export default function ItemDetail({ open, onClose, item, token, onAction }) {
  if (!item) return null;

  const handleSwap = async () => {
    if (!token) { alert("Login required"); return; }
    const res = await fetch(`${process.env.REACT_APP_API_URL}/swaps/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId: item._id }),
    });
    const data = await res.json();
    alert(data.message || JSON.stringify(data));
    if (onAction) onAction();
    onClose();
  };

  const handleRedeem = async () => {
    if (!token) { alert("Login required"); return; }
    const res = await fetch(`${process.env.REACT_APP_API_URL}/swaps/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId: item._id }),
    });
    const data = await res.json();
    alert(data.message || JSON.stringify(data));
    if (onAction) onAction();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item.title}</DialogTitle>
      <DialogContent dividers>
        {item.image && <CardMedia component="img" image={item.image} alt={item.title} sx={{ mb: 2, maxHeight: 300, objectFit: "contain" }} />}
        <Stack spacing={1}>
          <Typography>Type: {item.type}</Typography>
          <Typography>Size: {item.size}</Typography>
          <Typography>Condition: {item.condition}</Typography>
          <Typography>Category: {item.category || "N/A"}</Typography>
          <Typography>Tags: {item.tags ? item.tags.join(", ") : "N/A"}</Typography>
          <Typography>Availability: {item.available ? "Available" : "Not available"}</Typography>
          <Typography>Uploaded by: {item.user?.name || "Anonymous"}</Typography>
          <Typography>Description: {item.description || "No description"}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        {item.available && <Button onClick={handleSwap} variant="contained">Swap Request</Button>}
        {item.available && <Button onClick={handleRedeem} variant="outlined">Redeem Points</Button>}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
