require('./src/config/env');

const express = require('express');
const routes = require('./src/routes/index');

const app = express();

app.use(express.json());

app.use('/api', routes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
