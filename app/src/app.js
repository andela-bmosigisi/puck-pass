(function () {

  // global variables.
  var players = Array();
  var socket = {};
  var rootAssetUrl = '/assets';
  var me = {};
  var livePlayers = {};

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
  window.chooseTeam = function (team) {
    var pname = document.getElementById('playerName').value;
    if (pname.length == 0) {
      alert('Your name is needed.');
      return;
    } else {
      disableControls('all');
      playerObj = addPlayer(team, pname);
      socket.emit('I have chosen', playerObj);
    }
  };

  // add a single player.
  var addPlayer = function (team, name) {
    var playerObj = {first: false, initialised: false};

    if (players.length == 0) {
      playerObj.first = true;
    }
    playerObj.team = team;
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
        var img = players[i].team == 'G' ? 'green' : 'blue';
        if (players[i].playerId == socket.id) {
          me = Crafty.e('Player, Me')
            .attr(players[i].state)
            .image(rootAssetUrl + '/img/' + img + '.png')
            .fourway(250);
          players[i].initialised = true;
          nameText.textFont({
            weight: 'bold'
          });

          me.bind('Move', function () {
            me.trigger('positionChanged', socket);
          });
        } else {
          var temp = Crafty.e('Player')
            .attr(players[i].state)
            .image(rootAssetUrl + '/img/' + img + '.png');
          players[i].initialised = true;
          livePlayers[players[i].playerId] = temp;
        }
      }
    }
  };

  // update the local copy of players.
  var updateLocalPlayersCopy = function (sentPlayers) {
    for (var i = 0; i < sentPlayers.length; i++) {
      if (checkObjectInArray(players, sentPlayers[i].playerId,
        'playerId') == -1) {
          players.push(Object.create(sentPlayers[i]));
      }
    }
    // some garbage collection.
    sentPlayers = undefined;

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

  var checkGameStart = function () {
    if (players.length == 4) {
      var start = 5;
      Crafty.e('2D, DOM, Color')
        .attr({x: 0, y: 0, w: 1200, h: 640})
        .color('rgba(216,216,216,0.50)');
      var countdown = Crafty.e('2D, DOM, Text')
        .attr({x: 580, y: 300})
        .text(start)
        .textFont({
          size: '45px'
        });
      var interval = setInterval(function () {
        countdown.text(start--);
        if (start == -1) {
          Crafty.enterScene('GameStart');
          clearInterval(interval);
        }
      }, 1000);
    }
  };

  // update positions of players on field
  var updatePositionState = function (data) {
    var socketKeys = Object.keys(data);
    for (var i = 0; i < socketKeys.length; i++) {
      if (socketKeys[i] != socket.id) {
        livePlayers[socketKeys[i]].x = data[socketKeys[i]].x;
        livePlayers[socketKeys[i]].y = data[socketKeys[i]].y;
      }
    }
  };

  var handlePlayerSocket = function (socket) {
    // once a player chooses a team, the server broadcasts this event.
    socket.on('game state update', function (data) {
      console.log('Players sent from server: ', data.players);
      updateLocalPlayersCopy(data.players);
      updateChooseControls();
      initUpdatePlayers();
      checkGameStart();
    });

    socket.on('full game prompt', function () {
      alert('Game already full. Choose another or make one.');
      window.location.href = '/';
    });

    socket.on('update position state', function (data) {
      // data contains new positions of new player.
      updatePositionState(data.players);
    });
  };
})();