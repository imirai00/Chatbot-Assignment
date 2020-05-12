var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").createServer(app);
var io = require("socket.io")(server);

// set port auto
var port = process.env.PORT;
server.listen(port);

var listUsers=[]; //array contain username list
var listRoom=[]; //array contain room name list

var moment = require('moment'); //moment variable require moment in node_modules 
function formatMessage(username, text){ //function format the message
  return { //the message include username, text and time is real time
      username,
      text,
      time: moment().format('h:mm a')
  }
}

app.get("/", function(req, res){
  res.render("Home");
});

io.on("connection", function(socket){

  //listen send username from the Client with data is username
  socket.on("Client-send-Username", function(data){
    if (data != ""){ //if username isn't empty
      //if the username has existed on the user list
      //the index of data will greater than or equal to zero
      if(listUsers.indexOf(data)>=0){
        //if it is true, it will emit to Client know they register to fail
        socket.emit("Server-send-registration-fail");
      }else{
        //if it is fail, it will push the username to user list
        listUsers.push(data);
        socket.Username = data;
        //emit to Client know they register to success, user list and room list
        socket.emit("Server-send-registration-success", data);
        io.sockets.emit("Server-send-users-list", listUsers);
        io.sockets.emit("Server-send-rooms-list", listRoom);
      }
    } else { //if username is empty
      //emit to Client know the box cannot be blank
      socket.emit("Box-blank", "Box cannot be blank");
    }
  });

  //listen logout event from the Client 
  socket.on("Logout", function(){ 
    //delete username in user list at index of username
    listUsers.splice(
      listUsers.indexOf(socket.Username), 1
    );
    //update new user list for all another client
    socket.broadcast.emit("Server-send-users-list",listUsers);
    //delete room list
    listRoom.splice(0);
    //update new room list for all another client
    socket.broadcast.emit("Server-send-rooms-list", listRoom);
  });

  //listen check room event from the Client with data is room name
  socket.on("Check-room", function(data){
    var checkRoom = 0; //create the variable to check room
    for(r in socket.adapter.rooms){ //the loop check all room in socket
      if (r == data){ //if the room was exist in socket the variable will change to 1
        checkRoom = 1;
      }
    }
    if (checkRoom != 1){ //if variable don't equal 1 
      socket.emit("Room-doesn't-exist", data); //emit to client know this room doesn't exist
    } else { //if variable equal 1
      socket.emit("Room-exist", data); //emit to client know this room exist
    }
  });

  //listen create new room event from the Client with data is room name
  socket.on("Create-new-room", function(data){
    if (data != ""){ //if room name isn't empty
      socket.join(data); //socket join room
      socket.Room = data; //set room name is data

      listRoom.push(data); //push the room name to room list
      socket.adapter.rooms[data].limit = 2; //set limit contain in room is only 2

      socket.emit("Server-send-room-success", data); //emit for only client join to this room success
      io.sockets.emit("Server-send-rooms-list", listRoom); //emit the room list for all client
    } else { //if username is empty
      //emit to Client know the box cannot be blank
      socket.emit("Box-blank", "Box cannot be blank");
    }
  });

  //listen join room event from the Client with data is room name
  socket.on("Join-room", function(data){
    if (data != ""){ //if room name isn't empty
      for(room in socket.adapter.rooms){ //the loop check all room in socket
        if(data == room){ //if the room was exist in socket 
          if(socket.adapter.rooms[data].length < socket.adapter.rooms[data].limit){ //if limit contain in room is lower than 2
            socket.join(room); //socket join room
            socket.Room=data; //set room name is data
            socket.emit("Server-send-room-success", data); //emit for only client join to this room success
            io.sockets.emit("Server-send-rooms-list", listRoom); //emit the room list for all client
          } else { //if limit contain in room is greater than or equal to 2
            socket.emit("Limited-users"); //emit for only client know this room have limit user
            io.sockets.emit("Server-send-rooms-list", listRoom); //emit the room list for all client
          }
        }     
      }
    } else { //if username is empty
      //emit to Client know the box cannot be blank
      socket.emit("Box-blank", "Box cannot be blank");
    }
  });

  //listen leave room event from the Client with data is room name
  socket.on("Leave-room", function(data){
    socket.leave(data); //socket leave room
    socket.Room=data; //set room name is data

    var check = false; //create the variable to check room
    for(room in socket.adapter.rooms){ //the loop check all room in socket
      if(room == data){ //if the room was exist in socket the variable will change to true
        check = true;
      }
    }

    if(check == true) { //if variable equal true
      socket.emit("Leave-room-success"); //emit for only client know leave room success
      io.sockets.emit("Server-send-rooms-list", listRoom); //emit the room list for all client
    } else { //if variable equal false
      var index = 0; //create the variable index
      for(var i = 0; i < listRoom.length; i++){ //the loop run to variable equal length of list room
        if(data == listRoom[i]){ //if the data equal room name in room list in position i
          index = listRoom.indexOf(data); //the variable index get the value index in room list in position of data
        }
      }
      listRoom.splice(index, 1); //delete room name in room list at position index
      socket.emit("Leave-room-success"); //emit for only client know leave room success
      io.sockets.emit("Server-send-rooms-list", listRoom); //emit the room list for all client
    }
  });

  //listen send message event from the Client with data is message
  socket.on("User-send-message", function(data){
    //emit the message have formated for client in the room they in
    io.sockets.in(socket.Room).emit("Server-send-mesage", formatMessage(socket.Username, data) );
  });

  //listen user is typing event from the Client 
  socket.on("User-is-typing", function(){
    //create the variable have the username with sentence "is typing"
    var s = socket.Username + " is typing";
    //emit for all client know someone is typing with variable s
    io.sockets.emit("Someone-is-typing", s);
  });

  //listen user stop typing event from the Client 
  socket.on("User-stop-typing", function(){
    //emit for all client know someone stop typing
    io.sockets.emit("Someone-stop-typing");
  });
});
