(function () {
  Crafty.c('Player', {
    init: function () {
      this.addComponent('2D, DOM, Image, Persist, Solid, Collision');
    }
  });

  Crafty.c('Me', {
    init: function () {
      this.addComponent('Fourway, GamepadMultiway, Collision');
      this.collideWithSolids();
      this.bind('Move', function () {
        this.trigger('positionChanged', window.socket);
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
})()