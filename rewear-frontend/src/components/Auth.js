import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, Stack, Alert } from "@mui/material";

export default function Auth({ setToken }) {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    const endpoint = mode === "signup" ? "register" : "login";
    const body = mode === "signup" ? { name, email, password } : { email, password };

    const res = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setMessage("Logged in successfully!");
      setName(""); setEmail(""); setPassword("");
    } else {
      setMessage(JSON.stringify(data));
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5">{mode === "signup" ? "Signup" : "Login"}</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {mode === "signup" && (
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          )}
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSubmit}>{mode === "signup" ? "Signup" : "Login"}</Button>
            <Button variant="outlined" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
              Switch to {mode === "signup" ? "Login" : "Signup"}
            </Button>
          </Stack>
          {message && <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
}
