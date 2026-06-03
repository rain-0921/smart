const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const authRoutes       = require('./routes/authRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const advisorRoutes    = require('./routes/advisorRoutes');

app.use('/api/auth',       authRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/student',    studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/advisor',    advisorRoutes);

app.get('/', (req, res) => res.send('Smart Learning System API is running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));