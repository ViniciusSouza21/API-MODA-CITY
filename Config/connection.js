const mysql = require('mysql');

var pool = mysql.createPool({

    "user" : "root",
    "password": "root",
    "database" : "PRODUCT_STORE",
    "host" : "localhost",
    "port" : 3300

});

console.log("Database connection successfully established!");

exports.pool = pool;