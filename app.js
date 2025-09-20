const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Initialize app settings

app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('layout', '_layouts/default');
app.set("layout extractScripts", true);

// Mount Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

// Register Routes
const publicRoutes = require('./routes/public');
app.use('/', publicRoutes);

// app.get('/dashboard', (req, res) => {
//   res.render('cfi/dashboard', {});
// });

// app.get('/dashboard/student', (req, res) => {
//   res.render('student-dashboard', {});
// });

// app.get('/admin', (req, res) => {
//   res.render('local-admin', {});
// });

// app.get('/global-admin', (req, res) => {
//   res.render('global-admin', {});
// });


app.listen(3000);
