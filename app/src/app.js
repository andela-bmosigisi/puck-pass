(function () {

  // global variables.
  var players = Array();
  var socket = {};

  window.loadevent = new Event('load');
  var gamearea = document.getElementById('gamearea');
  gamearea.addEventListener('load',
    function (e) {
      Crafty.init(1200,640, gamearea);
      var gameId = String(e.target.getAttribute('gameId'));
      socket = io('/' + gameId);
      handlePlayerSocket(socket);
    },
    false
  );

  // respond to the choose team onclick.
  window.chooseTeam = function (color) {
    var pname = document.getElementById('playerName').value;
    if (pname.length == 0) {
      alert('Your name is needed.');
      return;
    } else {
      disableControls();
      playerObj = addPlayer(color, pname);
      socket.emit('I have chosen', playerObj);
    }
  };

  // add a single player.
  var addPlayer = function (color, name) {
    var playerObj = {first: false, initialised: false};

    if (players.length == 0) {
      playerObj.first = true;
    }
    playerObj.color = color;
    playerObj.team = color == '#60b044' ? 'G' : 'B';
    playerObj.name = name;
    playerObj.state = calculatePosition(playerObj.team);
    return playerObj;
  };

  // update the players who are connected.
  var initUpdatePlayers = function () {
    for (var i = 0; i < players.length; i++) {
      if (!players[i].initialised) {
        Crafty.e('2D, DOM, Color')
          .attr(players[i].state)
          .color(players[i].color);
        players[i].initialised = true;
      }
    }
  };

  // update the local copy of players.
  var updateLocalPlayersCopy = function (sentPlayers) {
    for (var i = 0; i < sentPlayers.length; i++) {
      if (checkObjectInArray(players, sentPlayers[i].playerId,
        'playerId') == -1) {
          players.push(sentPlayers[i]);
      }
    }
    // some garbage collection.
    delete sentPlayers;

    return;
  };

  // calculate position for the newly arrived player.
  // Green always on top.
  var calculatePosition = function (team) {
    var state = {x: 0, y: 0, h: 40, w: 40};
    // first is number of greens, other blues.
    var pThere = [0, 0];
    for (var i = 0; i < players.length; i++) {
      if (players[i].team == 'G') {
        pThere[0] += 1;
      } else if (players[i].team == 'B') {
        pThere[1] += 1;
      }
    }
    if (team == 'G') {
      // if already there's a green.
      if (pThere[0] == 1) {
        state.x = 880;
        state.y = 140;
      } else {
        state.x = 280;
        state.y = 140;
      }
    } else {
      if (pThere[1] == 1) {
        state.x = 880;
        state.y = 440;
      } else {
        state.x = 280;
        state.y = 440;
      }
    }

    return state;
  };

  // disable adding name and choosing team controls.
  var disableControls = function () {
    var buttons = document.getElementsByTagName('button');
    document.getElementById('playerName').disabled = true;
    buttons['bluebtn'].disabled = true;
    buttons['greenbtn'].disabled = true;
  };

  // returns -1 if an object with that key is in the array.
  // otherwise, returns the location.
  var checkObjectInArray = function (theArray, value, key) {
    for (var i = 0; i < theArray.length; i++) {
      if (theArray[i][key] == value) {
        return i;
      }
    }
    return -1;
  };

  var handlePlayerSocket = function (socket) {
    // once a player chooses a team, the server broadcasts this event.
    socket.on('game state update', function (data) {
      console.log('Players sent from server: ', data.players);
      updateLocalPlayersCopy(data.players);
      initUpdatePlayers();
    });
  };
})();