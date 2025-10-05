// Load environment variables
require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { auth } = require('./controllers/auth');

const app = express();

const associations = require('./models/associations');

// Initialize app settings
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', '_layouts/default');
app.set("layout extractScripts", true);

// Mount Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'))

// Setup sequelize associations
associations();

// Register Routes
const publicRoutes = require('./routes/public.route');
const dashboardRoutes = require('./routes/dashboard.route');

app.use('/', publicRoutes);
app.use('/dashboard', auth, dashboardRoutes)

// app.get('/dashboard', (req, res) => {
//   res.render('cfi/dashboard', {});
// });

// app.get('/dashboard/student', (req, res) => {
//   res.render('student-dashboard', {});
// });

// app.get('/admin', (req, res) => {
//   res.render('local-admin', {});
// });


app.listen(3000);
