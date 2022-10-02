
// Connecting DataBase

var dbdir = './database';
var dbfile = 'helpline.db';
var dbpath = dbdir + '/' + dbfile;

// Server

var port = process.env.PORT || 3033;
var hostname = '0.0.0.0';

// Require Dependencies 

var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var app = express();


var db = new sqlite3.Database(dbpath);
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));


function HandleResult(err, str_op_type) {
    var foo;

    if (err) {
        console.error(err.message);
        return "Error during" + str_op_type;
    }

    foo = str_op_type + " successful";
    console.log(foo);
    return foo;
}


app.get("/", function (req, res) {
    res.render("home.ejs");
});


app.get('/view/:country', function (req, res) {
    db.serialize(() => {
        db.each(`SELECT Country COUNTRY, Emergency EMERGENCY,
        Police POLICE, Ambulance AMBULANCE, Fire FIRE,
        "Call Codes" CALLCODES FROM helpcode WHERE UPPER(Country) = ?
        UNION ALL
        SELECT NULL, NULL, NULL, NULL, NULL, NULL
        LIMIT 1;`,
            [req.params.country.toUpperCase()], function (err, row) {

                if (err) {
                    res.send("[GET]: failed on /view/" + req.params.country);
                    return console.error(err.message);
                }

                res.send(row);
                console.log("[GET]: successful on /view/" + req.params.country);
            });
    });
});


app.get('/allhelp', function (req, res) {
    var records = [];

    db.serialize(() => {
        db.all(`SELECT Emergency EMERGENCY,
        Police POLICE, Ambulance AMBULANCE, Fire FIRE,
        "Call Codes" CALLCODES FROM helpcode ORDER BY Country`,
            [], (err, rows) => {

                if (err) {
                    console.log("[GET]: failed on /allhelp")
                    console.log(err.message);
                }

                res.send(rows);
                console.log("[GET]: successful on /allhelp");

            });
    });
});

// If Not Found: 

app.get("*", (req, res) => {
    res.render("404.ejs");
});

app.listen(port, hostname, function () {
    console.log("Server Started on Port: " + port);
});
