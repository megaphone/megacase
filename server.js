var express       = require('express'),
    util          = require("util"),
    Mongo         = require('mongodb')

var app = express.createServer();

app.get("/", function(req, res) {
  global.mongo_db.collection("tweets", function(err, collection) {
    // if limit == 1 this does not leak cursors
    // if limit > total objects this does not leak cursors
    var options = { limit: 2 };
    var conditions = {};
    var fields = { _id: true };
    
    collection.find(conditions, fields, options).toArray(function(err, tweets) {
      res.send(util.inspect(tweets));
    });
  });
});

var port = process.env.PORT || 3000;

// Environment variables which specify the connection
var mongo_config = {
  host: process.env.MONGO_HOST,
  port: parseInt(process.env.MONGO_PORT),
  db: process.env.MONGO_NAME,
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASS,
  auto_reconnect: true
}

mongo_server = new Mongo.Server(mongo_config.host, mongo_config.port, {
  auto_reconnect: true,
  safe: true,
  native_parser: true
});
global.mongo_db = new Mongo.Db(mongo_config.db, mongo_server, {});
mongo_db.open(function(err, db) {
  // If you remove db.authenticate then the collection.find does not leak
  db.authenticate(mongo_config.username, mongo_config.password, function(err, success) {
    app.listen(port, function() {
      console.log("Listening on port " + port);
    });
 });
});
