const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./db');
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const workRoutes = require('./routes/workorders');
const inventoryRoutes = require('./routes/inventory');
const pmRoutes = require('./routes/pm');
const { ensureTables } = require('./init');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());

ensureTables(); // create tables if they don't exist

app.use('/auth', authRoutes);
app.use('/assets', assetsRoutes);
app.use('/workorders', workRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/pm', pmRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'EAM prototype API' });
});

app.listen(PORT, () => {
  console.log(`EAM backend listening on port ${PORT}`);
});