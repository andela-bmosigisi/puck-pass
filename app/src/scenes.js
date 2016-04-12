(function () {
  Crafty.scene('GameStart',  function () {
    document.body.removeChild(document.getElementById('controlsarea'));
    me.addComponent('Me');
    me.fourway(250)
      .gamepadMultiway({
        speed: 250,
        gamepadIndex: 0
      });
  }, function () {

  });
})();
