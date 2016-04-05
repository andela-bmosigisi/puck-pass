(function () {

  window.loadevent = new Event('load');
  var gamearea = document.getElementById('gamearea');
  gamearea.addEventListener('load',
    function (e) {
      Crafty.init(1200,640, gamearea);
      var gameId = String(e.target.getAttribute('gameId'));
    },
    false
  );
})();