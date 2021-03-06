(function() {
  var gms = {};

  gms.Game = function(data) {
    this.name = data.name;
    this.id = data.id;
    this.players = data.players;
  };

  gms.GamesList = Array;

  // the available games view-model
  gms.vm = {
    init: function() {
      gms.vm.list = new gms.GamesList();
      gms.vm.ids = new Array();

      gms.vm.add = function(id, name, players) {
        var gameObj = {
          id: id,
          name: name,
          players: players
        };
        if (id) {
          gms.vm.list.push(new gms.Game(gameObj));
          gms.vm.ids.push(id);
        } else {
          console.log('No game added.');
          console.log('Game Object: ', gameObj);
        }
      };

      gms.vm.remove = function(id) {
        var location = gms.vm.ids.indexOf(id);
        if (location != -1) {
          gms.vm.list.splice(location, 1);
          gms.vm.ids.splice(location, 1);
        } else {
          console.log('No such game. Id: ', id);
        }
      };

      gms.vm.clear = function() {
        gms.vm.list = new gms.GamesList();
        gms.vm.ids = Array();
      };
    }
  };

  gms.vm.init();

  // view component for the available games.
  gms.view = function() {
    if (gms.vm.list.length == 0) {
      return '<p id="join-area">' + 'No games available.' + '</p>';
    }
    var dom = '<table class="u-full-width" id="join-area">';
    dom += '<thead><tr><th>ID</th><th>Name</th><th>Players</th></tr></thead>';
    dom += '</tbody>';
    for (var i = 0; i < gms.vm.list.length; i++) {
      dom += '<tr><td onclick="joinGame(this)">' + String(gms.vm.list[i].id) + '</td>';
      dom += '<td>' + String(gms.vm.list[i].name) + '</td>';
      dom += '<td>' + String(gms.vm.list[i].players) + '</td>';
      dom += '</tr>';
    }
    return dom + '</tbody></table>';
  };

  // render to dom.
  gms.render = function() {
    var joinParent = document.getElementById('join-parent');
    joinParent.removeChild(document.getElementById('join-area'));
    joinParent.innerHTML += gms.view();
  };

  var socket = io.connect('/');
  socket.on('game update', function(data) {
    gms.vm.clear();
    if (data.games.length > 0) {
      for (var i = 0; i < data.games.length; i++) {
        gms.vm.add(data.games[i]._id, data.games[i].name,
          data.games[i].players);
      }
    }
    gms.render();
  });

  window.createGame = function() {
    var game_name = document.getElementById('game_name');
    if (game_name.value.length == 0) {
      alert('A name is required!');
      return;
    } else {
      socket.emit('new game', {name: game_name.value});
    }
  };

  window.joinGame = function(td) {
    var id = td.innerHTML.trim();
    loadScreen(id);
  };

  socket.on('game added', function(data) {
    loadScreen(data.id);
  });

  function loadScreen(id) {
    var container = document.getElementById('container');
    document.body.removeChild(container);
    // delete global variables.
    delete window.joinGame;
    delete window.createGame;
    // close the socket connection.
    socket.close();
    // dispatch event to game area.
    var gamearea = document.getElementById('gamearea');
    gamearea.removeAttribute('hidden');
    document.getElementById('controlsarea').removeAttribute('hidden');
    var idAttr = document.createAttribute('gameId');
    idAttr.value = id;
    gamearea.setAttributeNode(idAttr);
    gamearea.dispatchEvent(loadevent);
  };

})();
