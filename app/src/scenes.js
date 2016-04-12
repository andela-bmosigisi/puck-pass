(function () {
  Crafty.scene('GameStart',  function () {
    document.body.removeChild(document.getElementById('controlsarea'));
    me.addComponent('Me');
    me.fourway(250)
      .gamepadMultiway({
        speed: 250,
        gamepadIndex: 0
      });

    // create the walls.
    Crafty.e('Wall').attr({x: 0, y: -1, w: 1200, h: 1});
    Crafty.e('Wall').attr({x: -1, y: 0, w: 1, h: 640});
    Crafty.e('Wall').attr({x: 0, y: 640, w: 1200, h: 1});
    Crafty.e('Wall').attr({x: 1200, y: 0, w: 1, h: 640});
  }, function () {

  });
})();
