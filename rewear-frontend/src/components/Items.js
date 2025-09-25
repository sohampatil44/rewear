import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import ItemDetail from "./ItemDetail";

export default function Items({ token, refresh, onSwap }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      setItems(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, [refresh]);

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5">Items List</Typography>
          {items.length === 0 ? <Typography>No items yet</Typography> :
            items.map((item) => (
              <Stack key={item._id} spacing={1} sx={{ mt: 1, mb: 1 }}>
                <Typography><strong>{item.title}</strong> - {item.type} - {item.size} - {item.condition}</Typography>
                {item.image && <img src={item.image} alt={item.title} style={{ maxWidth: "100px", borderRadius: 5 }} />}
                <Button variant="outlined" onClick={() => { setSelectedItem(item); setOpenDetail(true); }}>View Details</Button>
              </Stack>
            ))
          }
        </CardContent>
      </Card>

      <ItemDetail 
        open={openDetail} 
        onClose={() => setOpenDetail(false)} 
        item={selectedItem} 
        token={token} 
        onAction={onSwap} 
      />
    </>
  );
}
