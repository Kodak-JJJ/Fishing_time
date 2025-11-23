const express = require('express');
const bodyParser = require('body-parser');
const pool = require('../database');   // ✅ use the pool, not old connection

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', async (req, res, next) => {
  try {
    const tidal_sql = "SELECT * FROM tidal_locations";
    const river_sql = "SELECT * FROM river_locations";

    // You can run them sequentially (simple & fine):
    const [tidal_location_data] = await pool.query(tidal_sql);
    const [river_location_data] = await pool.query(river_sql);

    console.log(river_location_data);
    console.log(tidal_location_data);

    res.render('_home_page', {
      tidal_location_data,
      river_location_data
    });
  } catch (err) {
    // Don’t throw; pass to Express error handler
    next(err);
  }
});

module.exports = router;


module.exports = router;
