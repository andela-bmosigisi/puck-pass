(function () {

  window.loadevent = new Event('load');
  var gamearea = document.getElementById('gamearea');
  gamearea.addEventListener('load',
    function (e) {
      Crafty.init(1200,640, gamearea);
      var gameId = String(e.target.getAttribute('gameId'));
      window.socket= io('/' + gameId);
    },
    false
  );

  window.chooseTeam = function () {
    var pname = document.getElementById('playerName').value;
    if (pname.length == 0) {
      alert('Your name is needed.');
      return;
    } else {
      disableControls();
    }
  };

  // disable adding name and choosing team controls.
  var disableControls = function () {
    var buttons = document.getElementsByTagName('button');
    document.getElementById('playerName').disabled = true;
    buttons['bluebtn'].disabled = true;
    buttons['greenbtn'].disabled = true;
  };
})();