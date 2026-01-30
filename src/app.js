const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const moduleRoutes = require('./routes/rootmodule.routes');

// require('./config/env');

const app = express();
connectDB();
// Adding Super admin credentials just after connected DB();
const seedSuperAdmin = require('./script/seedDefaultValue');
seedSuperAdmin();



app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tenants', require('./routes/tenant.routes'));
app.use('/api/modules', require('./routes/rootmodule.routes'));



app.use('/api/modules', moduleRoutes);

// Default end point to check server is running....
app.use('/', (req, res) => res.send('APIs are running on port 4000...'));
app.listen(process.env.PORT, () => {
console.log('Server running on port', process.env.PORT);
});

