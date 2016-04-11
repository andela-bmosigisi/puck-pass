(function () {
  Crafty.c('Player', {
    init: function () {
      this.addComponent('2D, DOM, Image, Persist');
    }

  });
<<<<<<< da6966c99b8011b591ccc1e7e16216615b8c7993

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
=======
>>>>>>> separate out components
})()