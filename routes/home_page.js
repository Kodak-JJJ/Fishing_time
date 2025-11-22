var express = require('express');

var router = express.Router();
const bodyParser = require('body-parser');
var connection = require('../database');
var urlencodedParser = bodyParser.urlencoded({extended: false});

router.get('/',(req, res) => {
    var tidal_sql= "SELECT * FROM tidal_locations";
    var river_sql= "SELECT * FROM river_locations";

    connection.query(tidal_sql,function(err, tidal_location_data){
        if(err) throw err;
        connection.query(river_sql,function(err, river_location_data){
            if(err) throw err;

            console.log(river_location_data);
            console.log(tidal_location_data);
            res.render('_home_page',
            {
                tidal_location_data: tidal_location_data,
                river_location_data: river_location_data
            });
        });

    });
});


module.exports = router;