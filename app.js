const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Route modules
const homepageRouter = require('./routes/home_page');
const tidalLocationRouter = require('./routes/tidal_location');
const riverLocationRouter = require('./routes/fresh_location');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Simple health check for Railway and local root
app.get('/', (req, res) => {
  res.send('OK - app is running');
});

// // Your main routes
// app.use('/home_page', homepageRouter);
// app.use('/tidal_location', tidalLocationRouter);
// app.use('/river_location', riverLocationRouter);

// // 404 handler (optional)
// app.use((req, res, next) => {
//   next(createError(404));
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err);

//   if (res.headersSent) return next(err);

//   if (req.accepts('html')) {
//     res.status(err.status || 500).send(
//       `<h1>Server Error</h1><pre>${err.message}</pre>`
//     );
//   } else {
//     res.status(err.status || 500).json({ error: err.message });
//   }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
