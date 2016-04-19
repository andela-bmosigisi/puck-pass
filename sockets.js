var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var namespaces = Array();

module.exports = function(io) {

  var sockets = {};

  var GameClass = function () {
    this.puck = {};
    this.players = {};
    this.scores = {
      B: 0,
      G: 0
    };
    this.playersCount = 0;
  };

  sockets.init = function() {
    io.on('connection', function (socket) {
      updateGames();
      socket.on('new game', function(data) {
        addGame(data, socket);
      });
      socket.on('disconnect', function () {
        console.log('A user disconnected.');
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
        nsp.gameState = {};
        nsp.game = new GameClass();
        nsp.on('connection', function (sckt) {
          console.log('New guy connected to game_id: ', sckt.nsp.name);
          console.log('Connected guy: ', sckt.id);
          handleGamer(sckt);
          incrementPlayers(sckt.nsp.name);
          nsp.emit('game state update', {game: nsp.game});
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
    for (var key in players) {
      if (players.hasOwnProperty(key)) {
        if (players[key].team == 'G') {
          pThere[0] += 1;
        } else if (players[key].team == 'B') {
          pThere[1] += 1;
        }
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
      socket.nsp.game.players[socket.client.id] = {};
      var position = calculatePosition(data.team, socket.nsp.game.players);
      if (socket.nsp.game.playersCount < 4) {
        socket.nsp.game.players[socket.client.id].position = position;
        socket.nsp.game.players[socket.client.id].team = data.team;
        socket.nsp.game.players[socket.client.id].name = data.name;
        socket.nsp.game.players[socket.client.id].imageUrl =
          '/assets/img/' + (data.team == 'G' ? 'green' : 'blue') + '.png';
        socket.nsp.game.players[socket.client.id].hasPuck = false;
        socket.nsp.game.playersCount++;
        socket.nsp.game.puck = {
          destroyed: false,
          vx: 0,
          vy: 0,
          x: 592,
          y: 312
        };
        socket.nsp.emit('game state update', {game: socket.nsp.game});
      } else {
        socket.emit('full game prompt', {});
      }
    });

    socket.on('changed position', function (data) {
      socket.nsp.game.players[socket.client.id].position = data;
      socket.nsp.emit('update live state',
        {game: socket.nsp.game});
    });

    socket.on('game started', function () {
      socket.nsp.emit('update live state',
        {game: socket.nsp.game});
    });

    // handle change of images on players.
    socket.on('changed image', function (data) {
      for (var key in data.images) {
        if (data.images.hasOwnProperty(key)) {
           socket.nsp.game.players[key].imageUrl = data.images[key];
        }
      }

      for (var key in data.puckery) {
        if (data.puckery.hasOwnProperty(key)) {
           socket.nsp.game.players[key].hasPuck = data.puckery[key];
        }
      }

      // ensure that only one player has a puck.
      var foundOne = false;
      for (var playerId in socket.nsp.game.players) {
        if (socket.nsp.game.players.hasOwnProperty(playerId)) {
          if (socket.nsp.game.players[playerId].hasPuck && !foundOne) {
            foundOne = true;
            continue;
          } else {
            socket.nsp.game.players[playerId].hasPuck = false;
          }
        }
      }

      socket.nsp.emit('update live state',
        {game: socket.nsp.game});
    });

    // handle changes in the puck position and availability.
    socket.on('changed puck', function (data) {
      console.log('puck data', data);
      if (data.destroyed) {
        socket.nsp.game.puck.destroyed = true;
      } else {
        // the puck is there, the position is changing.
        socket.nsp.game.puck.destroyed = false;
        socket.nsp.game.puck.x = data.x;
        socket.nsp.game.puck.y = data.y;
        socket.nsp.game.puck.vx = data.vx;
        socket.nsp.game.puck.vy = data.vy;
        socket.nsp.game.puck.moving = true;
      }

      socket.nsp.emit('update live state',
        {game: socket.nsp.game});
    });

    // increment the scores for the players.
    socket.on('changed scores', function (data) {
      socket.nsp.game.scores[data.team]++;

      if (socket.nsp.game.scores[data.team] >= 1000) {
        socket.nsp.emit('game over', {
          winner: data.team
        });
      }

      socket.nsp.emit('update live state',
        {game: socket.nsp.game});
    });

  };

  return sockets;
};
