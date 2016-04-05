var mongoose = require('mongoose');
var Game = mongoose.model('Game');

module.exports = function(io) {

  var sockets = {};

  sockets.init = function() {
    io.on('connection', function (socket) {
      updateGames();
      socket.on('new game', function(data, socket) {
        addGame(data);
      });
    });
  };

  var updateGames = function() {
    Game.find({open: true}, function(err, docs) {
      if (err) {
        console.log('Mongoose error: ', err);
        io.sockets.emit('game update', {games : []});
      } else {
        io.sockets.emit('game update', {games: docs});
      }
    });
  };

  var addGame = function(data, socket) {
    if (data.name) {
      var game = new Game({
        name: data.name,
        players: 1,
        open: true
      });

      game.save(function(err) {
        if (err) {
          console.log('Mongoose error: ', err);
        } else {
          updateGames();
          socket.emit('game added', {id: game.id});
        }
      })
    }
  };

  return sockets;
};
