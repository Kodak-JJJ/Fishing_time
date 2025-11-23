const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/home_page', homepageRouter);
app.use('/tidal_location', tidalLocationRouter);
app.use('/river_location', freshLocationRouter);

// error handler
app.use(function(err, req, res, next) {
  console.error(err);

  if (res.headersSent) return next(err);

  if (req.accepts('html')) {
    res.status(err.status || 500).send(
      `<h1>Server Error</h1><pre>${err.message}</pre>`
    );
  } else {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// 👉 Only ONE listen, at the very end
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
