const mysql = require('mysql');

var pool = mysql.createPool({

    "user" : "root",
    "password": "",
    "database" : "PRODUCT_STORE",
    "host" : "localhost",
    "port" : 3306

});

console.log("Database connection successfully established!");

exports.pool = pool;