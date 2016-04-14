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
      this.bind('Moved', function (from) {
        if (this.hit('Wall')) {
          this[from.axis] = from.oldValue;
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
          var imageData = {};
          imageData[this.playerId] = imageUrlA;
          imageData[collider.playerId] = imageUrlB;
          window.socket.emit('changed image', imageData);
          this.image(imageUrlA);
          collider.image(imageUrlB)
          collider.hasPuck = true;
          this.imageUrl = imageUrlA;
          collider.imageUrl = imageUrlB;
        } else if (collider.hasPuck) {
          collider.hasPuck = false;
          var imageUrlA = '/assets/img/' + (this.team == 'B' ? 'blue' : 'green') + '-puck.png';
          var imageUrlB = '/assets/img/' + (collider.team == 'B' ? 'blue': 'green') + '.png';
          var imageData = {};
          imageData[this.playerId] = imageUrlA;
          imageData[collider.playerId] = imageUrlB;
          window.socket.emit('changed image', imageData);
          this.hasPuck = true;
          this.image(imageUrlA);
          this.imageUrl = imageUrlA;
          collider.image(imageUrlB);
          collider.imageUrl = imageUrlB;
        }
      });

      return this;
    },

    collideWithPuck: function () {
      this.onHit('Puck', function (collisionInfo) {
        var color = this.team == 'B' ? 'blue': 'green';
        console.log(this.team);
        var imageUrl = '/assets/img/' + color + '-puck.png';
        this.image(imageUrl);
        this.hasPuck = true;
        this.imageUrl = imageUrl;
        var imageData = {};
        imageData[this.playerId] = imageUrl;
        window.socket.emit('changed image', imageData);
        puck.destroy();
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
      this.addComponent('2D, DOM, Image, Collision')
        .attr({w: 16, h: 16})
        .image('/assets/img/puck.png');
    }
  });
})()