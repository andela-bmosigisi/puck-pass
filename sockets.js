module.exports = function(io) {

  var sockets = {};

  sockets.init = function() {
    io.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
  };

  return sockets;
};
