import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

export default function Landing() {
  const [items, setItems] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      setItems(data.slice(0, 5)); // top 5 items for carousel
    };
    fetchItems();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  };

  return (
    <Slider {...settings}>
      {items.map((item) => (
        <Card key={item._id} sx={{ m: 2 }}>
          {item.image && <CardMedia component="img" height="200" image={item.image} alt={item.title} />}
          <CardContent>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body2">{item.type} - {item.size} - {item.condition}</Typography>
          </CardContent>
        </Card>
      ))}
    </Slider>
  );
}
