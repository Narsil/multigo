/**
 * Module dependencies.
 */

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var sio = require('socket.io');
var go = require('./controllers/go.js');


/**
 * App.
 */

var app = express.createServer();

/**
 * App configuration.
 */

app.configure(function () {
  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  }
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');
  app.set('PORT', 3000);
});

/**
 * App routes.
 */

app.get('/', function (req, res) {
  res.render('views/index', { layout: false });
});

/**
 * App listen.
 */

app.listen(process.env.PORT || app.set('PORT'), function () {
  var addr = app.address();
  console.log('   app listening on port ' + app.set('PORT'));
});

/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(app);
var nicknames = {};
var back = {};
var data = {'state':[
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
    };
var polls = [];
var colors = [
    '#000',
    '#fff',
    '#f00',
    '#0f0',
    '#00f',
    '#ff0',
    '#f0f',
    '#0ff'
];

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

    back = data;
    var position = data.players.length;
    data.players.push({
        'name': nick,
        'color': colors[position % colors.length]
    });
    socket.emit('position', position);
    socket.emit('data',data);
  }
});

  socket.on('play', function(msg){
    back = data;
    if(msg !== null){
      var x = msg[0];
      var y = msg[1];
      data.state = go.update_state(data.state, x, y, data.turn + 1);

      io.sockets.emit('announcement', data.players[data.turn].name + ' played at ' + x +', ' + y);
    }else{
      io.sockets.emit('announcement', data.players[data.turn].name + ' passed');
    }

    // In case we only have 1 player do not authorize him to put infinite stones.
    var to_play = (data.turn+1)%data.players.length;
    if (to_play == data.turn){
        to_play = data.turn + 1;
        socket.emit('announcement', "Waiting for other players. You can connect from other tabs to simulate other players.");
    }

    data.turn = to_play;

    io.sockets.emit('data',data);
  });

  socket.on('poll',function(msg){
    if(msg.type === "request"){
      pollCount = 0;
      socket.broadcast.emit('poll',{
        'type': 'request',
        'name': msg.name
      });

    }else if (msg.type === "answer"){
      if(msg.value === 1){
        pollCount++;
        if(pollCount === data.players.length){
          if(msg.name === "restart"){
            data.state =[
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]];
            data.turn = 0;
            back = data;
          }else if(msg.name === "back"){
            data = back;
          }
          io.sockets.emit('poll',{
          'type':'answer',
          'name': msg.name,
          'value': 1,
          'data': data
        });
        }
      }else{
        //Request not allowed
        io.sockets.emit('poll',{
          'type':'answer',
          'name': msg.name,
          'value': 0
        });
      }

    }

  });

  socket.on('call_poll', function(msg){
      msg.id = polls.length;
      polls.push(msg);
      io.sockets.emit('announcement', data.players[msg.pollees[0].player].name + ' wants to ' + msg.type);
      io.sockets.emit('call_poll', msg);
      console.log(msg);
  });

  socket.on('poll', function(msg){
      var poll = polls[msg.id];
      poll.pollees.push(msg);
      io.sockets.emit('poll', poll);
  });

  socket.on('disconnect', function () {
    if (!socket.nickname){
        return;
    }

    delete nicknames[socket.nickname];
    var i = 0;
    while(true){
      if(i<data.players.length){
        if (data.players[i] && data.players[i].name === socket.nickname){
          delete data.players[i];
          delete back.players[i];
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
