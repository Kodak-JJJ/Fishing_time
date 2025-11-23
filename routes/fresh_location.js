const express = require('express');
const bodyParser = require('body-parser');
const pool = require('../database');  // <-- use pool now

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const API_BASE = process.env.API_BASE_GEOMET;

// Proxy to GeoMet API (this part was already fine)
router.get("/api/items", async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const url = `${API_BASE}/items${qs ? `?${qs}` : ""}`;
    console.log("checking url here. url >>>", url);

    const resp = await fetch(url, { headers: { Accept: "application/json" } });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return res.status(resp.status).json({ error: "Upstream error", detail: text });
    }

    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// River location page, now using async/await and pool.query
router.get("/:stationName", async (req, res, next) => {
  try {
    console.log("params:", req.params, "query:", req.query);

    const stationName = req.params.stationName;
    const sql = `SELECT * FROM river_locations WHERE name = ? LIMIT 1`;

    const [rows] = await pool.query(sql, [stationName]);

    console.log(rows);
    if (!rows.length) {
      return res.status(404).send('Location not found');
    }

    res.render('_river_location', { location: rows[0] });
  } catch (err) {
    next(err);  // pass to Express error handler
  }
});

module.exports = router;



module.exports = router;
