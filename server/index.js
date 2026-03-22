const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const healthRoutes = require('./routes/health');
const convertRoutes = require('./routes/convert');
const exportRoutes = require('./routes/export');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', healthRoutes);
app.use('/api', convertRoutes);
app.use('/api', exportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FlowBridge server running on port ${PORT}`);
});
