const mysql = require('mysql2');

var connection = mysql.createConnection({
	host : 'localhost',
	database : 'Fishing_Spot',
	user : 'root',
	password : 'kokiKodak',
    dateStrings:true,
    port: 3307
});

connection.connect(function(error){
	if(error)
	{
		throw error;
	}
	else
	{
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;