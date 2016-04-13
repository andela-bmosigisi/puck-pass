(function () {
  Crafty.c('Player', {
    init: function () {
      this.addComponent('2D, DOM, Image, Persist, Solid, Collision');
    }
  });

  Crafty.c('Me', {
    init: function () {
      this.addComponent('Fourway, GamepadMultiway, Collision')
        .collideWithSolids()
        .bind('Move', function () {
          this.trigger('positionChanged', window.socket);
        });
      this.bind('Moved', function (from) {
        if (this.hit('Wall')) {
          this[from.axis] = from.oldValue;
        }
      });
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
        this.x -= hitData.overlap * hitData.normal.x;
        this.y -= hitData.overlap * hitData.normal.y;
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
      this.addComponent('2D, DOM, Image')
        .attr({w: 16, h: 16})
        .image('/assets/img/puck.png');
    }
  });
})()