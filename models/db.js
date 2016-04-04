var mongoose = require('mongoose');
var Log = require('log');
var log = new Log('mongoose');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
  name: { type: String, required: true },
  players: Number,
  open: Boolean
});

mongoose.model('Game', gameSchema);

var url = process.env.MONGO_URL;
mongoose.connect(url);

var db = mongoose.connection;
db.on('error', function(err) {
  log.error(err);
});

db.once('open', function() {
  log.info('mongoose connected');
});

module.exports = db;
