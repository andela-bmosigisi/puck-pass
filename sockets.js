var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var namespaces = Array();

module.exports = function(io) {

  var sockets = {};

  sockets.init = function() {
    io.on('connection', function (socket) {
      updateGames();
      socket.on('new game', function(data) {
        addGame(data, socket);
      });
      socket.on('disconnect', function () {
        console.log('Game joining user disconnected.');
      });
      populateNamespaceArray();
      createNamespaces();
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
          pushSingleNamespace(String(game._id));
          createNamespaces();
          socket.emit('game added', {id: String(game._id)});
        }
      })
    }
  };

  var populateNamespaceArray = function () {
    Game.find({open: true}, function(err, docs) {
      if (err) {
        console.log('Mongoose error: ', err);
      } else {
        // create namespaces
        docs.forEach(function (el) {
          pushSingleNamespace(String(el._id));
        });
      }
    });
  };

  var pushSingleNamespace = function (nspId) {
    if (checkObjectInArray(namespaces, nspId, 'id') != -1) {
      return;
    } else {
      namespaces.push({
        id: nspId,
        registered: false
      });
    }
  };

  // create namespaces and register events.
  var createNamespaces = function() {
    for (var i = 0; i < namespaces.length; i++) {
      if (namespaces[i].registered === false) {
        var nsp = io.of('/' + namespaces[i].id);
        nsp.on('connection', function (sckt) {
          console.log('New guy connected to game_id: ', sckt.nsp.name);
          console.log('Connected guy: ', sckt.id);
        });
        namespaces[i].registered = true;
      }
    }
  };

  // returns -1 if an object with that key is in the array.
  // otherwise, returns the location.
  var checkObjectInArray = function (theArray, value, key) {
    for (var i = 0; i < theArray.length; i++) {
      if (theArray[i][key] == value) {
        return i;
      }
    }
    return -1;
  };

  return sockets;
};
