
// Load environment variables
require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { auth } = require('./middleware/auth');

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
app.use((req, res, next) => {
  res.locals.message = '';
  res.locals.data = {};
  res.locals.errors = [];
  next();
});

// Setup sequelize associations
associations();

// Register Routes
const routes = require('./routes');

app.use('/', routes.public);

// Require authorization for everything except public routes
app.use(auth);

app.use('/dashboard', routes.dashboard);
app.use('/entity/:entityId/syllabus', routes.syllabus);
app.use('/entity/:entityId/user', routes.user);
app.use('/entity', routes.entity);

app.listen(3000);
