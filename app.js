// Load env
require('./src/config/env');

const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Static Files (Dashboard Admin)
// Gunakan process.cwd() yang aman untuk Vercel
app.use(express.static(path.join(process.cwd(), 'public')));

// 3. Test Route (Ping) - Taruh SEBELUM routes utama
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: "OK", 
    server: "Online", 
    cloudinary_config: process.env.CLOUDINARY_NAME ? "Loaded" : "Missing" 
  });
});

// 4. Main Routes
app.use('/api', routes);

// 5. Fallback Route (Untuk handle 404 di frontend)
// Jika route tidak ketemu, kirim admin.html (atau 404 json)
app.get('*', (req, res) => {
  // Cek request headers, kalau minta HTML kasih admin.html
  if (req.accepts('html')) {
    res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
  } else {
    res.status(404).json({ error: "Endpoint not found" });
  }
});

module.exports = app;