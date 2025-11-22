var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const axios = require('axios');
const cheerio = require('cheerio');
const { response } = require('express');
const PORT = process.env.PORT;

var homepageRouter = require('./routes/home_page');
var tidalLocationRouter = require('./routes/tidal_location');
var freshLocationRouter = require('./routes/fresh_location');

var app = express();





app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});
app.set('view engine', 'ejs')
.listen(PORT,() => console.log(`server is working on ${PORT}`));
app.set('views', path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(express.json());
//ask chatgpt about this later
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//ask chatgpt about this later
app.use(express.static(path.join(__dirname, 'public')));

app.use('/home_page',homepageRouter);
app.use('/tidal_location',tidalLocationRouter);
app.use('/river_location',freshLocationRouter);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
//   });

// error handler
app.use(function(err, req, res, next) {
  console.error(err); // keep the stack in server logs

  if (res.headersSent) return next(err);

  // Send plain HTML or JSON instead of rendering a view
  if (req.accepts('html')) {
    res.status(err.status || 500).send(
      `<h1>Server Error</h1><pre>${err.message}</pre>`
    );
  } else {
    res.status(err.status || 500).json({ error: err.message });
  }
  });

module.exports = app;
