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
        if (id && name && players) {
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
      dom += '<tr><td>' + String(gms.vm.list[i].id) + '</td>';
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

})();