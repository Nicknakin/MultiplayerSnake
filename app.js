var express = require('express');

var app = express();
var server = app.listen(8080);

app.use(express.static('client'));

var socket = require('socket.io');

var io = socket(server);

var blocks = new Array(800/20+1);

for(ind = 0; ind < blocks.length; ind++){
  blocks[ind] = new Array(800/20+1);
  for(knd = 0; knd <= 800/20; knd++){
    blocks[ind][knd] = {
      x: knd*20,
      y: ind*20,
      i: ind,
      k: knd
    }
  }
}

var blocks1d = to1d(blocks);

var players = [];
var playerArray = [];
var sockets = [];


setInterval(movement, 100);

io.sockets.on('connect', onConnect);

function onConnect(socket){
  console.log('New connection! id:' + socket.id);
  players[socket.id] = {
    index: playerArray.length-1,
    player: stockPlayer({id:socket.id})
  };

  sockets[socket.id] = socket;
  playerArray.push(players[socket.id].player);

  socket.on('keyPress',
    function(data){
      if(players[data.id] != undefined && data.inputId == 'up' && players[data.id].player.dLast != 'down'){
        players[data.id].player.d = 'up';
      }
      if(players[data.id] != undefined && data.inputId == 'down' && players[data.id].player.dLast != 'up'){
        players[data.id].player.d = 'down';
      }
      if(data.inputId == 'right' && players[data.id].player.dLast != 'left'){
        players[data.id].player.d = 'right';
      }
      if(data.inputId == 'left' && players[data.id].player.dLast != 'right'){
        players[data.id].player.d = 'left';
      }
    }
  );

  socket.on('disconnect',
    function() {
      console.log("Disconnect! id:" + socket.id);
      playerArray[playerArray.indexOf(players[socket.id].player)].active = false;
      //playerArray.slice((players[socket.id].index),1);
      //delete players[socket.id];
    }
  );
}

function movement(){

  for(index = 0; index < playerArray.length; index++){
    if(playerArray[index]){
      var player = playerArray[index]
      player.dLast = player.d;
      var i = (player.blocks[0] != undefined)? player.blocks[0].i: 0;
      var k = (player.blocks[0] != undefined)? player.blocks[0].k: 0;
      i += (player.d == 'up')? -1: (player.d == 'down')? 1: 0;
      k += (player.d == 'right')? 1: (player.d == 'left')? -1: 0;
      i = (i >= blocks.length)? 0: (i < 0)? blocks.length-1: i;
      k = (k >= blocks.length)? 0: (k < 0)? blocks.length-1: k;
      player.blocks.unshift(blocks[i][k]);
      if(!onBerry(player)){
        player.blocks.pop();
      }
      if(onSelf(player)){
        var id = player.id;
        //sockets[id].disconnect();
        //sockets.slice(id, 1);
      }
    }
  }
  io.sockets.emit('update', {players:playerArray, board:blocks});
}

function onSelf(player){
  for(i = 0; i < player.blocks.length; i++){
    for(k = 0; k < player.blocks.length; k++){
      if(i != k && player.blocks[i] == player.blocks[k]){
        return true;
      }
    }
  }
  return false;
}

function onBerry(player){
  if(!playerOn(player, player.berry))
    return false;

  var freeBlocks = blocks1d;

  for(a = 0; a < freeBlocks.length; a++){
    for(b = 0; b < player.blocks; b++){
      if(freeBlocks[a] == player.blocks[b]){
        freeBlocks.slice(a,1);
      }
    }
  }

  var index = Math.floor(Math.random()*freeBlocks.length)


  while(playerOn(player, player.berry)){
    index = Math.floor(Math.random()*freeBlocks.length);

    player.berry = freeBlocks[index];
  }

  return true;
}

function playerOn(player, block){
  for(i = 0; i < player.blocks.length; i++){
    if(player.blocks[i] == block){
      return true;
    }
  }
  return false;
}

function stockPlayer(socket){
  return {
      active: true,
      id:socket.id,
      blocks:[blocks[Math.floor(blocks.length/2)][Math.floor(blocks.length/2)]],
      berry:blocks[Math.floor(Math.random()*blocks.length)][Math.floor(Math.random()*blocks.length)],
      d:'up',
      dLast: 'up',
      color: {r: Math.floor(Math.random()*256), g: Math.floor(Math.random()*256), b: Math.floor(Math.random()*256)}
    };
}

function to1d(array){
  var temp = [];
  for(i = 0; i < array.length; i++){
    for(k = 0; k < array[i].length; k++){
      temp.push(array[i][k]);
    }
  }
  return temp;
}