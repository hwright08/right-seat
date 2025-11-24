// Load environment variables
require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./utils/db');

// Init the app
const app = express();

// --------------------
// Set up db associations
// --------------------
require('./models/associations')();

// --------------------
// Set up app config
// --------------------
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', '_layouts/default');
app.set('layout extractScripts', true);

// --------------------
// Set up middleware
// --------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
// Register session middleware (should come before routes)

app.use(
  session({
    secret: process.env.SECRET_ACCESS_TOKEN || 'secret', // The longer the better!
    resave: false, // Don't resave session data if nothing has changed
    saveUninitialized: false, // Don't automatically create a session object if not initialized by app code
    store: new SequelizeStore({ db }),
    cookie: {
      maxAge : 1000 * 60 * 60, // cookie lasts for one hour (in milliseconds)
      sameSite: true // prevent cookie from being sent to other sites (CSRF)
    }
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || {};
  res.locals.data = {};
  res.locals.errors = [];
  res.locals.flashMessages = req.flash(); // Retrieve any flash messages and make them available to views
  next();
});

// --------------------
// Set up routes
// --------------------
const authMiddleware = require('./middleware/auth');
const publicRoutes = require('./routes/public.route');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const globalRoutes = require('./routes/global.route');
const entityRoutes = require('./routes/entity.route');
const syllabusRoutes = require('./routes/syllabus.route');
const reportRoutes = require('./routes/report.route');

app.use('/auth', authRoutes);
app.use(publicRoutes);

// make sure we're authorized to access the remaining routes
app.use(authMiddleware.auth);
app.use(userRoutes);
app.use('/global', globalRoutes);
app.use('/entity', entityRoutes);
app.use('/syllabus', syllabusRoutes);
app.use('/report', reportRoutes);

// --------------------
// Handle errors
// --------------------
const errorController = require('./controllers/error.controller');
const { Sequelize } = require('sequelize');
app.use(errorController.get404);
app.use(errorController.get500);

// Listen on port
app.listen(3000);
