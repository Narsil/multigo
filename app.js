/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , sio = require('socket.io');

/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');

  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  };
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
  res.render('index', { layout: false });
});

/**
 * App listen.
 */

app.listen(3000, function () {
  var addr = app.address();
  console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app)
  , nicknames = {}
  , data = {'state':[
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]],
        'players':[],
        'turn': 0
    };;

io.sockets.on('connection', function (socket) { 
// Player 1 color : '#000'
// Player 1 color : '#fff'
// Player 1 color : '#f00'
  socket.on('user message', function (msg) {
    socket.broadcast.emit('user message', socket.nickname, msg);
  });

  socket.on('nickname', function (nick, fn) {
    if (nicknames[nick]) {
      fn(true);
    } else {
      fn(false);
      nicknames[nick] = socket.nickname = nick;
      socket.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('nicknames', nicknames);

      switch(data.players.length){
      case 0:
          data.players.push({
            'name': nick,
            'color': '#000'
          });
          socket.emit('position', 0);
        break;
      case 1:
        data.players.push({
            'name': nick,
            'color': '#fff'
          });
        socket.emit('position', 1);
        break;
      case 2:
        data.players.push({
            'name': nick,
            'color': '#f00'
          });
        socket.emit('position', 2);
        break;
      default:
        socket.emit('position', -1);
        break;
    }
    }
  });

  socket.on('play', function(msg){
    var x = msg[0];
    var y = msg[1];

    data.state[x][y] = data.turn +1;
    data.turn = (data.turn+1)%data.players.length;

    if (x === undefined || y === undefined){
        return;
    }

    console.log(data.players[data.turn] + 'a joué en ' + x +', ' + y);
    socket.broadcast.emit('data',data);
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete nicknames[socket.nickname];
    var i = 0;
    while(true){
      if(i<data.players.length){
        if (data.players[i].name === socket.nickname){
          delete data.players[i];
          break;
        }
      }else{
        break;
      }
    }
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
  });
});
