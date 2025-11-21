require('./src/config/env');
const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json());

// agar Vercel bisa menemukan folder 'public' dengan tepat
app.use(express.static(path.join(process.cwd(), 'public')));

// Routes API
app.use('/api', routes);

// Route default kalau user buka root url
app.get('/', (req, res) => {
  res.send('Sentinel API is Running. Go to /admin.html');
});

module.exports = app;