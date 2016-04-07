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
    Game.find({open: true, players: { $lt: 4}},
      function(err, docs) {
        if (err) {
          console.log('Mongoose error: ', err);
          io.sockets.emit('game update', {games : []});
        } else {
          io.sockets.emit('game update', {games: docs});
        }
      }
    );
  };

  var addGame = function(data, socket) {
    if (data.name) {
      var game = new Game({
        name: data.name,
        players: 0,
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
    Game.find({open: true, players: { $lt: 4}},
      function(err, docs) {
        if (err) {
          console.log('Mongoose error: ', err);
        } else {
          // create namespaces
          docs.forEach(function (el) {
            pushSingleNamespace(String(el._id));
          });
        }
      }
    );
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
        nsp.players = Array();
        nsp.on('connection', function (sckt) {
          console.log('New guy connected to game_id: ', sckt.nsp.name);
          console.log('Connected guy: ', sckt.id);
          handleGamer(sckt);
          incrementPlayers(sckt.nsp.name);
          nsp.emit('game state update', {players: nsp.players});
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

  // increase number of players in game.
  var incrementPlayers = function (gameId) {
    Game.findOne({_id: gameId.substring(1)}, function (err, game) {
      if (err) {
        console.log('Mongoose error: ', err);
      } else if (!game) {
        console.log('No such game exists. ', game._id);
      } else {
        game.players += 1;
        game.save(function (err) {
          if (err) {
            console.log('Mongoose error: ', err);
          } else {
            console.log('Players incremented successfuly.');
            updateGames();
          }
        });
      }
    });
  };

  // calculate position for the newly arrived player.
  // Green always on top.
  var calculatePosition = function (team, players) {
    var state = {x: 0, y: 0, h: 20, w: 20};
    // first is number of greens, other blues.
    var pThere = [0, 0];
    for (var i = 0; i < players.length; i++) {
      if (players[i].team == 'G') {
        pThere[0] += 1;
      } else if (players[i].team == 'B') {
        pThere[1] += 1;
      }
    }
    if (team == 'G') {
      // if already there's a green.
      if (pThere[0] == 1) {
        state.x = 780;
        state.y = 200;
      } else {
        state.x = 380;
        state.y = 200;
      }
    } else {
      if (pThere[1] == 1) {
        state.x = 780;
        state.y = 380;
      } else {
        state.x = 380;
        state.y = 380;
      }
    }

    return state;
  };

  // control the gaming connections.
  var handleGamer = function (socket) {
    socket.on('I have chosen', function (data) {
      data.playerId = socket.client.id;
      data.state = calculatePosition(data.team, socket.nsp.players);
      if (socket.nsp.players.length < 4) {
        socket.nsp.players.push(data);
        socket.nsp.emit('game state update', {players: socket.nsp.players});
      } else {
        socket.emit('full game prompt', {});
      }
    });
  };

  return sockets;
};
