require('./src/config/env');

const express = require('express');
const path = require('path');
const routes = require('./src/routes');

const app = express();
app.use(express.json());

app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

module.exports = app;
