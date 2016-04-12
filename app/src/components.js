(function () {
  Crafty.c('Player', {
    init: function () {
      this.addComponent('2D, DOM, Image, Persist');
    }

  });

  Crafty.c('Me', {
    init: function () {
      this.addComponent('Fourway');
    },
    events: {
      'positionChanged': function(socket) {
        socket.emit('changed position',
          {x: this.x, y: this.y});
      }
    }
  });
})()