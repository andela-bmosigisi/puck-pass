(function () {
  Crafty.scene('GameStart',  function () {
    // represents the synced state.
    var Game = function () {
      this.puck = {};
      this.players = {};
      this.scores = {};
    };

    var initializeGame = function () {
      window.game = new Game();
      // populate game object with the entities.
      for (var key in livePlayers) {
        if (livePlayers.hasOwnProperty(key)) {
          game.players[key] = livePlayers[key];
        }
      }

      // create the walls.
      Crafty.e('Wall').attr({x: 0, y: -1, w: 1200, h: 1});
      Crafty.e('Wall').attr({x: -1, y: 0, w: 1, h: 640});
      Crafty.e('Wall').attr({x: 0, y: 640, w: 1200, h: 1});
      Crafty.e('Wall').attr({x: 1200, y: 0, w: 1, h: 640});

      // Initialize the puck.
      game.puck = Crafty.e('Puck').attr({x: 592, y: 312});
    };

    // all socket events are emited and handled here.
    var socketEvents = function () {
      socket.emit('game started', {});

      socket.on('update live state', function (data) {
        // data contains new positions of new player.
        updateLiveState(data.game);
      });
    };

    document.body.removeChild(document.getElementById('controlsarea'));
    me.addComponent('Me');
    me.fourway(250)
      .gamepadMultiway({
        speed: 250,
        gamepadIndex: 0
      });
    initializeGame();
    socketEvents();

    // update positions of players on field
    var updateLiveState = function (data) {
      var gameUpdate = data;
      // update players
      for (var key in gameUpdate.players) {
        if (gameUpdate.players.hasOwnProperty(key)) {
          if (key != me.playerId) {
            game.players[key].image(gameUpdate.players[key].imageUrl);
            game.players[key].imageUrl = gameUpdate.players[key].imageUrl;
            game.players[key].attr(gameUpdate.players[key].position);
            game.players[key].hasPuck = gameUpdate.players[key].hasPuck;
          } else {
            me.hasPuck = gameUpdate.players[key].hasPuck;
            me.imageUrl = gameUpdate.players[key].imageUrl;
            me.image(gameUpdate.players[key].imageUrl);
          }
        }
      }

      // update puck and scores.
    };
  }, function () {

  });
})();
