const express = require('express');
const bodyParser = require('body-parser');
const pool = require('../database');   // <-- use the new pool

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const API_BASE = process.env.API_BASE_IWLS;

/**
 * GET /stations/:stationId/data?...
 * Proxy to IWLS API for observed/predicted data
 */
router.get("/stations/:stationId/data", async (req, res) => {
  try {
    const { stationId } = req.params;
    console.log("IWLS data route, stationId:", stationId);

    if (!stationId || !/^[A-Za-z0-9_-]+$/.test(stationId)) {
      return res.status(400).json({ error: "Invalid stationId" });
    }

    const qs = new URLSearchParams(req.query).toString();
    const url = `${API_BASE}/stations/${encodeURIComponent(stationId)}/data${qs ? `?${qs}` : ""}`;
    console.log("IWLS upstream URL:", url);

    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return res.status(resp.status).json({ error: "Upstream error", detail: text });
    }

    const json = await resp.json();
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /:stationName
 * Render tidal location page by name
 */
router.get("/:stationName", async (req, res, next) => {
  try {
    console.log("Hello I am debugging here!!!");
    console.log("params:", req.params, "query:", req.query);

    const stationName = req.params.stationName;
    const sql = `SELECT * FROM tidal_locations WHERE name = ? LIMIT 1`;

    const [rows] = await pool.query(sql, [stationName]);
    console.log(rows);

    if (!rows.length) {
      return res.status(404).send('Location not found');
    }

    res.render('_tidal_location', { location: rows[0] });
  } catch (err) {
    next(err); // pass to Express error handler
  }
});

module.exports = router;
