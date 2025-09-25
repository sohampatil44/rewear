// components/Footer.js
import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              ReWear
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Sustainable fashion through clothing swaps. Join our community and give your clothes a new life.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'white' }}><Facebook /></IconButton>
              <IconButton sx={{ color: 'white' }}><Twitter /></IconButton>
              <IconButton sx={{ color: 'white' }}><Instagram /></IconButton>
              <IconButton sx={{ color: 'white' }}><Email /></IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>Quick Links</Typography>
            <Link href="/" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Home</Link>
            <Link href="/browse" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Browse Items</Link>
            <Link href="/add" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Add Item</Link>
            <Link href="/dashboard" color="inherit" display="block" underline="hover">Dashboard</Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>Support</Typography>
            <Link href="/help" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Help Center</Link>
            <Link href="/contact" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Contact Us</Link>
            <Link href="/faq" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>FAQ</Link>
            <Link href="/guidelines" color="inherit" display="block" underline="hover">Community Guidelines</Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>Legal</Typography>
            <Link href="/privacy" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Privacy Policy</Link>
            <Link href="/terms" color="inherit" display="block" underline="hover" sx={{ mb: 1 }}>Terms of Service</Link>
            <Link href="/cookies" color="inherit" display="block" underline="hover">Cookie Policy</Link>
          </Grid>
        </Grid>
        
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3, mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} ReWear. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;