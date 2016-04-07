(function () {

  // global variables.
  var players = Array();
  var playerNameEntities = Array();
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
      disableControls('all');
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
    return playerObj;
  };

  // update the players who are connected.
  var initUpdatePlayers = function () {
    for (var i = 0; i < players.length; i++) {
      if (!players[i].initialised) {
        console.log('Player Id: ', players[i].playerId);
        console.log('socket Id: ', socket.id);
        var nameText = Crafty.e('2D, DOM, Text')
          .attr({x: players[i].state.x, y: players[i].state.y + 25})
          .text(players[i].name)
          .textFont({
            size: '15px'
          });
        if (players[i].playerId == socket.id) {
          Crafty.e('2D, DOM, Color, Fourway')
            .attr(players[i].state)
            .color(players[i].color)
            .fourway(200);
          players[i].initialised = true;
          nameText.textFont({
            weight: 'bold'
          });
        } else {
          Crafty.e('2D, DOM, Color')
            .attr(players[i].state)
            .color(players[i].color);
          players[i].initialised = true;
        }
        playerNameEntities.push(nameText);
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

  // disable adding name and choosing team controls.
  var disableControls = function (filter) {
    var buttons = document.getElementsByTagName('button');
    switch (filter) {
      case 'all':
        document.getElementById('playerName').disabled = true;
        buttons['bluebtn'].disabled = true;
        buttons['greenbtn'].disabled = true;
        break;
      case 'blue':
        buttons['bluebtn'].disabled = true;
        break;
      case 'green':
        buttons['greenbtn'].disabled = true;
        break;
    }
  };

  // Check which players are already in the game.
  // In order to decide which teams allowed to join.
  var updateChooseControls = function () {
    var grn = 0, blue = 0;
    for (var i = 0; i < players.length; i++) {
      if (players[i].team === 'G') {
        grn++;
      } else {
        blue++;
      }
    }
    if (grn === 2) {
      disableControls('green');
    } else if (blue === 2) {
      disableControls('blue');
    }
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
      updateChooseControls();
      initUpdatePlayers();
    });

    socket.on('full game prompt', function () {
      alert('Game already full. Choose another or make one.');
      window.location.href = '/';
    });
  };
})();