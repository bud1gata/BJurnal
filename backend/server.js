require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Inisialisasi DB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://jurnal.budiputra.web.id', 'https://jurnal.budiputra.web.id'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('BJurnal API Server is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
