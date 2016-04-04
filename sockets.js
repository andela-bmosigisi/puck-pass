var mongoose = require('mongoose');
var Game = mongoose.model('Game');

module.exports = function(io) {

  var sockets = {};

  sockets.init = function() {
    io.on('connection', function (socket) {
      Game.find({open: true}, function(err, docs) {
        if (err) {
          console.log('Mongoose error: ', err);
          socket.emit('game update', {games : []});
        } else {
          socket.emit('game update', {games: docs});
        }
      });
    });
  };

  return sockets;
};
