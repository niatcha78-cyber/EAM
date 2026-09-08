require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const workRoutes = require('./routes/workorders');
const inventoryRoutes = require('./routes/inventory');
const pmRoutes = require('./routes/pm');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/assets', assetsRoutes);
app.use('/workorders', workRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/pm', pmRoutes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'EAM prototype API (Firebase Auth + Firestore)' });
});

app.listen(PORT, () => {
  console.log(`EAM backend listening on port ${PORT}`);
});
