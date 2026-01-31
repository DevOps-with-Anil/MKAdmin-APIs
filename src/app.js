const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const moduleRoutes = require('./routes/rootmodule.routes');

const seedSuperAdmin = require('./script/seedDefaultValue');

const app = express();
connectDB();

// Seed only in development
if (process.env.NODE_ENV === 'development') {
  seedSuperAdmin();
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// ================= SUPER ADMIN ROUTES =================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/adminProfile.routes'));
// ======================================================

app.get('/', (req, res) => {
  res.send('APIs are running...');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});



