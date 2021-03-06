(function () {
  Crafty.c('Player', {
    init: function () {
      this.addComponent('2D, DOM, Image, Persist, Solid, Collision');
      this.hasPuck = false;
    }
  });

  Crafty.c('Me', {
    init: function () {
      this.addComponent('Fourway, GamepadMultiway, Collision')
        .collideWithSolids()
        .collideWithPuck()
        .bind('Move', function () {
          this.trigger('positionChanged', window.socket);
        });

      this.previousPosition = { x: 0, y: 0};

      this.bind('Moved', function (from) {
        if (this.hit('Wall')) {
          this[from.axis] = from.oldValue;
        }
        // store the previous location, if has puck.
        if (this.hasPuck) {
          this.previousPosition[from.axis] = from.oldValue;
        }
      });

      this.bind('KeyDown', function(e) {
        if (e.key == Crafty.keys.SPACE && this.hasPuck) {
          // create puck and send into motion.
          var xAttr = this.x - this.previousPosition.x;
          xAttr = xAttr == 0 ? 1 : xAttr / Math.abs(xAttr);
          var yAttr = this.y - this.previousPosition.y;
          yAttr = yAttr == 0 ? 1 : yAttr / Math.abs(yAttr);
          // calculate appropriate position for puck creation.
          var x = 30 * xAttr + this._x;
          var y = 30 * yAttr + this._y;
          x = x >= 1200 ? x - 25 : x;
          x = x <= 0 ? x + 25 : x;
          y = y >= 640 ? y - 25 : y;
          y = y <= 0 ? y + 25 : y;
          game.puck = Crafty.e('Puck').attr({
            x: x,
            y: y
          });
          game.puck.vx = 250 * xAttr;
          game.puck.vy = 250 * yAttr;
          game.puck.destroyed = false;

          // send out event to signify puck has moved.
          var puckData = {};
          puckData.destroyed = game.puck.destroyed;
          puckData.x = game.puck.x;
          puckData.y = game.puck.y;
          puckData.vx = game.puck.vx;
          puckData.vy = game.puck.vy;
          puckData.moving = true;
          socket.emit('changed puck', puckData);
          this.hasPuck = false;
          var imageUrl = '/assets/img/' + (this.team == 'B' ? 'blue': 'green') + '.png';
          this.image(imageUrl);
          var imageData = { puckery: {} };
          imageData.puckery[this.playerId] = false;
          socket.emit('changed image', imageData);
        }
      });

      this.hasPuck = false;
    },

    events: {
      'positionChanged': function(socket) {
        socket.emit('changed position',
          {x: this.x, y: this.y});
      }
    },

    collideWithSolids: function () {
      this.onHit('Solid', function (collisionInfo) {
        var hitData = collisionInfo[0];
        var collider = collisionInfo[0].obj;
        this.x -= hitData.overlap * hitData.normal.x;
        this.y -= hitData.overlap * hitData.normal.y;
        if (this.hasPuck) {
          this.hasPuck = false;
          var imageUrlA = '/assets/img/' + (this.team == 'B' ? 'blue': 'green') + '.png';
          var imageUrlB = '/assets/img/' + (collider.team == 'B' ? 'blue': 'green') + '-puck.png';
          var imageData = { puckery: {} };
          imageData.puckery[this.playerId] = false;
          imageData.puckery[collider.playerId] = true;
          window.socket.emit('changed image', imageData);
          this.image(imageUrlA);
          collider.image(imageUrlB);
          collider.hasPuck = true;
        } else if (collider.hasPuck) {
          var imageUrlA = '/assets/img/' + (this.team == 'B' ? 'blue' : 'green') + '-puck.png';
          var imageUrlB = '/assets/img/' + (collider.team == 'B' ? 'blue': 'green') + '.png';
          var imageData = { puckery: {} };
          imageData.puckery[this.playerId] = true;
          imageData.puckery[collider.playerId] = false;
          window.socket.emit('changed image', imageData);
          collider.hasPuck = false;
          this.hasPuck = true;
          this.image(imageUrlA);
          collider.image(imageUrlB);
        }
      });

      return this;
    },

    collideWithPuck: function () {
      this.onHit('Puck', function (collisionInfo) {
        var color = this.team == 'B' ? 'blue': 'green';
        var imageUrl = '/assets/img/' + color + '-puck.png';
        this.image(imageUrl);
        this.hasPuck = true;
        var imageData = { puckery: {} };
        var puckData = { destroyed: true};
        imageData.puckery[this.playerId] = true;
        window.socket.emit('changed image', imageData);
        window.socket.emit('changed puck', puckData);
        game.puck.destroy();
      });

      return this;
    }
  });

  Crafty.c('Wall', {
    init: function () {
      this.addComponent('2D');
    }
  });

  Crafty.c('Puck', {
    init: function () {
      this.addComponent('2D, DOM, Image, Collision, Motion')
        .attr({w: 16, h: 16})
        .image('/assets/img/puck.png');

      this.onHit('Wall', function (collisionInfo) {
        var side = collisionInfo[0].obj.side;
        switch (side) {
          case 'l':
            this.vx = this.vx * -1;
            this.x = this.x + 12;
            break;
          case 'r':
            this.vx = this.vx * -1;
            this.x = this.x - 12;
            break;
          case 'u':
            this.vy = this.vy * -1;
            this.y = this.y + 12;
            break;
          case 'd':
            this.vy = this.vy * -1;
            this.y = this.y - 12;
            break;
        }
      });
    }
  });

  Crafty.c('Goal', {
    init: function () {
      this.addComponent('2D, DOM, Collision, Color')
        .attr({w: 60, h: 60, z: -1});

      this.onHit('Player', function (collisionData) {
        var player = collisionData[0].obj;
        var overlap = collisionData[0].overlap;
        var increment = false;
        if (player.hasPuck && overlap <= -20) {
          switch (player.team) {
            case 'B':
              if (this.color == 'B') {
                increment = true;
              }
              break;
            case 'G':
              if (this.color == 'G') {
                increment = true;
              }
              break;
          }
        }
        if (increment) {
          socket.emit('changed scores', {team: player.team});
        }
      });
    }
  })
})()