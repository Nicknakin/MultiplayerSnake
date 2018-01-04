var socket  = io.connect('http://70.119.237.165:8080/');
var playerList = [];
var berry;
var myColor;
var player;

function setup(){
  createCanvas(1100,820);
  background(0);
}

socket.on('update', function(data){
    background(255);
    fill(151);
    for(i = 0; i < data.board.length; i++){
      for(k = 0; k < data.board.length; k++){
        rect(data.board[i][k].x,data.board[i][k].y,20,20)
      }
    }

    playerList = data.players;
    for(i = 0; i < playerList.length; i++){
      if(playerList[i] == undefined || playerList[i].active == false){
        playerList.slice(i,1);
      }
    }

    for(i = 0; i < playerList.length; i++){
      var activeColor = playerList[i].color;

      fill(color(activeColor.r, activeColor.g, activeColor.b));
      text(`Color r:${activeColor.r} g:${activeColor.g} b:${activeColor.b} --- score = ${playerList[i].blocks.length-1}`, 840, 10+i*10);

      if(playerList[i].id == socket.id){
        berry = playerList[i].berry;
        myColor = color(activeColor.r, activeColor.g, activeColor.b);
        player = playerList[i];
      }

      for(k = 0; k < playerList[i].blocks.length; k++){
        rect(playerList[i].blocks[k].x, playerList[i].blocks[k].y, 20, 20);
      }
      ellipse(playerList[i].berry.x+10, playerList[i].berry.y+10, 10, 10);
    }
    fill(myColor)
    for(k = 0; k < player.blocks.length; k++){
      rect(player.blocks[k].x, player.blocks[k].y, 20, 20);
    }
    ellipse(berry.x+10, berry.y+10, 10, 10);
  }
);

document.onkeydown = function(event){
  if(event.keyCode === 68 || event.keyCode === 39)	//d
    socket.emit('keyPress',{inputId:'right', id:socket.id});
  if(event.keyCode === 83 || event.keyCode === 40)	//s
    socket.emit('keyPress',{inputId:'down', id:socket.id});
  if(event.keyCode === 65 || event.keyCode === 37)	//a
    socket.emit('keyPress',{inputId:'left', id:socket.id});
  if(event.keyCode === 87 || event.keyCode === 38)	//w
    socket.emit('keyPress',{inputId:'up', id:socket.id});
}
