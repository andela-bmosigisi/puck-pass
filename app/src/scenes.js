(function () {
  Crafty.scene('GameStart',  function () {
    // represents the synced state.
    var Game = function () {
      this.puck = {};
      this.players = {};
      this.goals = {
        blue: {},
        green: {}
      };
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
      var u = Crafty.e('Wall').attr({x: 0, y: -1, w: 1200, h: 1});
      u.side = 'u';
      var l = Crafty.e('Wall').attr({x: -1, y: 0, w: 1, h: 640});
      l.side = 'l';
      var d = Crafty.e('Wall').attr({x: 0, y: 640, w: 1200, h: 1});
      d.side = 'd';
      var r = Crafty.e('Wall').attr({x: 1200, y: 0, w: 1, h: 640});
      r.side = 'r';

      // Initialize the puck.
      game.puck = Crafty.e('Puck').attr({x: 592, y: 312});
      game.puck.destroyed = false;

      // Create the scoring entities.
      game.goals.blue.a = Crafty.e('Goal')
        .attr({x: 0, y: 0})
        .color('#BBEAF8');
      game.goals.blue.b = Crafty.e('Goal')
        .attr({x: 1140, y: 580})
        .color('#BBEAF8');
      game.goals.green.a = Crafty.e('Goal')
        .attr({x: 0, y: 580})
        .color('#C5FBB3');
      game.goals.green.b = Crafty.e('Goal')
        .attr({x: 1140, y: 0})
        .color('#C5FBB3');
      game.goals.green.a.color = 'G';
      game.goals.green.b.color = 'G';
      game.goals.blue.a.color = 'B';
      game.goals.blue.b.color = 'B';

      // initialize the scoring areas.
      game.scores.blue = Crafty.e('2D, DOM, Text')
        .attr({x: 537, y: 10, z: -1})
        .textFont({ size: '30px'})
        .textColor('#BBEAF8');
      game.scores.green = Crafty.e('2D, DOM, Text')
        .attr({x: 650, y: 10, z: -1})
        .textFont({ size: '30px'})
        .textColor('#C5FBB3');
    };

    // all socket events are emited and handled here.
    var socketEvents = function () {
      socket.emit('game started', {});

      socket.on('update live state', function (data) {
        // data contains new positions of new player.
        updateLiveState(data.game);
      });

      socket.on('game over', function (data) {

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

    var outOfBounds = function (positionObj) {
      var changed = false;
      if (positionObj.x <= 0) {
        positionObj.x = 1;
        changed = true;
      } else if (positionObj.x > 1180) {
        positionObj.x = 1179;
        changed = true;
      }
      if (positionObj.y <= 0) {
        positionObj.y = 1;
        changed = true;
      } else if (positionObj.y > 620) {
        positionObj.y = 619;
        changed = true;
      }
      return changed;
    };

    // update positions of players on field
    var updateLiveState = function (data) {
      var gameUpdate = data;
      // update players
      for (var key in gameUpdate.players) {
        if (gameUpdate.players.hasOwnProperty(key)) {
          // check if position is out of bounds, and rectify.
          var changed = outOfBounds(gameUpdate.players[key].position);
          if (key != me.playerId) {
            game.players[key].attr(gameUpdate.players[key].position);
            game.players[key].hasPuck = gameUpdate.players[key].hasPuck;
            var ext = game.players[key].hasPuck ? '-puck.png' : '.png';
            var img = '/assets/img/' +
              (game.players[key].team == 'G' ? 'green' : 'blue') + ext;
            game.players[key].image(img);
          } else {
            me.hasPuck = gameUpdate.players[key].hasPuck;
            var ext = me.hasPuck ? '-puck.png' : '.png';
            var img = '/assets/img/' + (me.team == 'G' ? 'green' : 'blue') + ext;
            me.image(img);
            if (changed) {
              me.attr(gameUpdate.players[key].position);
            }
          }
        }
      };

      // update puck.
      var puck = gameUpdate.puck;
      if (puck.destroyed && !game.puck.destroyed) {
        game.puck.destroy();
        game.puck = {};
        game.puck.destroyed = true;
      } else if (!puck.destroyed && game.puck.destroyed) {
        // check if puck entity exists, otherwise create it.
        game.puck.destroyed = false;
        game.puck = Crafty.e('Puck').attr({
          x: puck.x,
          y: puck.y
        });
        game.puck.vx = puck.vx;
        game.puck.vy = puck.vy;
      } else if (!game.puck.destroyed && !puck.moving) {
        game.puck.attr({
          x: puck.x,
          y: puck.y
        });
        game.puck.vx = puck.vx;
        game.puck.vy = puck.vy;
      }

      // update scores.
      var scores = gameUpdate.scores;
      game.scores.blue.text(scores.B);
      game.scores.green.text(scores.G);

    };
  }, function () {

  });
})();
