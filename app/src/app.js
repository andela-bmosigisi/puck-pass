(function () {

  // function wide variables.
  var players = Array();
  var rootAssetUrl = '/assets';

  // global variables
  window.socket = {};
  window.me = {};
  window.livePlayers = {};

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
    var playerObj = {initialised: false};

    playerObj.team = team;
    playerObj.name = name;
    return playerObj;
  };

  // update the players who are connected.
  var initUpdatePlayers = function () {
    for (var i = 0; i < players.length; i++) {
      if (!players[i].initialised) {
        var nameText = Crafty.e('2D, DOM, Text')
          .attr({x: players[i].state.x, y: players[i].state.y + 25})
          .text(players[i].name)
          .textFont({
            size: '15px'
          });
        var img = players[i].team == 'G' ? 'green' : 'blue';
        if (players[i].playerId == socket.id) {
          var imageUrl = rootAssetUrl + '/img/' + img + '.png';
          me = Crafty.e('Player')
            .attr(players[i].state)
            .image(imageUrl);
          me.team = players[i].team;
          me.playerId = players[i].playerId;
          players[i].initialised = true;
          me.imageUrl = imageUrl;
          nameText.textFont({
            weight: 'bold'
          });
        } else {
          var imageUrl = rootAssetUrl + '/img/' + img + '.png';
          var temp = Crafty.e('Player')
            .attr(players[i].state)
            .image(imageUrl);
          temp.team = players[i].team;
          temp.playerId = players[i].playerId;
          players[i].initialised = true;
          temp.imageUrl = imageUrl;
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
          clearInterval(interval);
          Crafty.enterScene('GameStart');
        }
      }, 1000);
    }
  };

  // update positions of players on field
  var updatePlayerState = function (data) {
    var socketKeys = Object.keys(data);
    me.image(me.imageUrl);
    for (var i = 0; i < socketKeys.length; i++) {
      if (socketKeys[i] != socket.id) {
        livePlayers[socketKeys[i]].x = data[socketKeys[i]].x;
        livePlayers[socketKeys[i]].y = data[socketKeys[i]].y;
        livePlayers[socketKeys[i]].image(livePlayers[socketKeys[i]].imageUrl);
      }
    }
  };

  var handlePlayerSocket = function (socket) {
    // once a player chooses a team, the server broadcasts this event.
    socket.on('game state update', function (data) {
      updateLocalPlayersCopy(data.players);
      updateChooseControls();
      initUpdatePlayers();
      checkGameStart();
    });

    socket.on('full game prompt', function () {
      alert('Game already full. Choose another or make one.');
      window.location.href = '/';
    });

    socket.on('update player state', function (data) {
      // data contains new positions of new player.
      updatePlayerState(data.players);
    });
  };
})();