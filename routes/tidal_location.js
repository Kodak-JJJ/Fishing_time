
var express = require('express');

var router = express.Router();
const bodyParser = require('body-parser');
const connection = require("../database");
var urlencodedParser = bodyParser.urlencoded({extended: false});

const API_BASE = process.env.API_BASE_IWLS;

router.get("/:stationName",(req,res)=> {
    console.log("Hello I am debugging here!!!");
    console.log("params:", req.params, "query:", req.query);

    const stationName = req.params.stationName;
    const sql = `SELECT * FROM tidal_locations WHERE name = ? LIMIT 1`;
    connection.query(sql, [stationName], (err, row) => {
      if (err) next(err);
      console.log(row);
      if (!row.length) return res.status(404).send('Location not found');
      res.render('_tidal_location', { location: row[0] });
    });
});


// GET /stations/:stationId/data?...
router.get("/stations/:stationId/data", async (req, res) => {
  try {
    const { stationId } = req.params;
    console.log("checking staionId over here");
    console.log(stationId);
    if (!stationId || !/^[A-Za-z0-9_-]+$/.test(stationId)) {
      return res.status(400).json({ error: "Invalid stationId" });
    }

    const qs = new URLSearchParams(req.query).toString();
    const url = `${API_BASE}/stations/${encodeURIComponent(stationId)}/data${qs ? `?${qs}` : ""}`;

    const resp = await fetch(url, { headers: { Accept: "application/json" } });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return res.status(resp.status).json({ error: "Upstream error", detail: text });
    }

    res.json(await resp.json());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
