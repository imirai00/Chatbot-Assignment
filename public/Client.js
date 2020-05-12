var socket = io("/"); //create variable socket have link with Home.ejs

//listen box blank event from server with data is "Box cannot be blank"
socket.on("Box-blank", function(data){
  alert(data); //alert the data
});

//listen registration fail event from server
socket.on("Server-send-registration-fail", function(){
  alert("The Username has been registered"); //alert the sentence
});

//listen registration success event from server with data is username
socket.on("Server-send-registration-success", function(data){
  $("#currentUser1").html(data); //show data in div have id currentUser1
  $("#currentUser2").html(data); //show data in div have id currentUser2
  $("#loginForm").hide(0); //hide div have id loginForm
  $("#roomForm").show(0); //show div have id roomForm
  $("#chatForm").hide(0); //hide div have id chatForm
});

//listen send users list event from server is user list
socket.on("Server-send-users-list", function(data){
  $("#boxContentuser1").html(""); //made div have id boxContentuser1 is empty
  $("#boxContentuser2").html(""); //made div have id boxContentuser2 is empty
  data.forEach(function(i){ 
    //with each data, it will add to div boxContentuser1 and boxContentuser2
    //the format is "<div class='user'>" + i + "</div>" with i is username
    $("#boxContentuser1").append("<div class='user'>" + i + "</div>");
    $("#boxContentuser2").append("<div class='user'>" + i + "</div>");
  });
});

//listen room doesn't exist event from server with data is room name
socket.on("Room-doesn't-exist", function(data){
  //emit to server create new room with data is room name
  socket.emit("Create-new-room", data);
});

//listen room exist event from server with data is room name
socket.on("Room-exist", function(data){ 
  //emit to server join room with data is room name 
  socket.emit("Join-room", data);
});

//listen limited user event from server
socket.on("Limited-users", function(){
    alert("Room is full of users."); //alert the sentence
});

//listen room success event from server with data is room name
socket.on("Server-send-room-success", function(data){
  $("#currentRoom").html(data); //show data in div have id currentRoom
  $("#loginForm").hide(0); //hide div have id loginForm
  $("#roomForm").hide(0); //hide div have id roomForm
  $("#chatForm").show(0); //show div have id chatForm
});

//listen send rooms list event from server with data is room list
socket.on("Server-send-rooms-list", function(data){
  $("#boxContentroom").html(""); //made div have id boxContentroom is empty
  data.forEach(function(r){     
    //with each data, it will add to div boxContentroom
    //the format is "<div class='room'>" + r + "</div>" with r is room name
    $("#boxContentroom").append("<div class='room'>" + r + "</div>");
  });
});

//listen send mesage event from server with data is message
socket.on("Server-send-mesage", function(data){
  console.log(data); //show message
  outputMessage(data); //format output massage
});

function outputMessage(data) { //function format output message
    const div = document.createElement('div'); //create variable div
    div.classList.add('Server-send-mesage'); //add send mesage event
    div.innerHTML = `<div class="message"> 
    <p class="meta">${data.username} <span>${data.time}</span></p>
    <p class="text">${data.text}</p>`; //format output message
    document.querySelector('#listMessages').appendChild(div);
}

//listen someone is typing event from server with data is username with sentence "is typing"
socket.on("Someone-is-typing", function(data){
  //show gif and data in div have id notification
  $("#notification").html("<img width='20px' src='typing05.gif'> " + data);
});

//listen someone stop typing event from server
socket.on("Someone-stop-typing", function(){
  //made div have id notification is empty
  $("#notification").html("");
});

//listen leave room success event from server
socket.on("Leave-room-success", function(){  
  $("#loginForm").hide(0); //hide div have id loginForm
  $("#roomForm").show(0); //show div have id roomForm
  $("#chatForm").hide(0); //hide div have id chatForm
});

$(document).ready(function(){
  $("#loginForm").show(0); //show div have id loginForm
  $("#roomForm").hide(0); //hide div have id roomForm
  $("#chatForm").hide(0); //hide div have id chatForm

  //when click button Register
  $("#btnRegister").click(function(){
    //emit send username event for server with data is username in textbox have id txtUsername
    socket.emit("Client-send-Username", $("#txtUsername").val());
    $("#txtUsername").val(""); //make textbox have id txtUsername is empty
  });

  //when click enter for register
  $(".Register-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var register = $("#txtUsername").val(); //create variable is username in textbox have id txtUsername
      socket.emit("Client-send-Username", register); //emit send username event for server with variable
      this.reset;
      $("#txtUsername").val(""); //make textbox have id txtUsername is empty
      return false;
    }
  });

  //when click button Logout
  $("#btnLogout").click(function(){
    socket.emit("Logout");//emit logout event for server  
    $("#loginForm").show(0); //show div have id loginForm
    $("#roomForm").hide(0); //hide div have id roomForm
    $("#chatForm").hide(0); //hide div have id chatForm
  });

  //when click button Join
  $("#btnSendRoom").click(function(){
    //emit check room event for server with data is room name in textbox have id txtRoom
    socket.emit("Check-room", $("#txtRoom").val());
    $("#txtRoom").val(""); //make textbox have id txtRoom is empty
  });

  //when click enter for join room
  $(".Submit-room-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var room = $("#txtRoom").val(); //create variable is room name in textbox have id txtRoom
      socket.emit("Check-room", room); //emit check room event for server with variable
      this.reset;
      $("#txtRoom").val(""); //make textbox have id txtRoom is empty
      return false;
    }
  });

  //when click button Leave
  $("#btnLeave").click(function(){
    var roomName = prompt("Input room name you want to leave:"); //create variable to save room name was input through prompt
    if (roomName == null || roomName == "") { //if variable is null or empty
      alert("You must enter the room name"); //alert the sentence
    }else{ //if variable isn't null or empty
      socket.emit("Leave-room", roomName); //emit leave room event for server with data is room name
      this.reset;
    }
  });

  //when click button Send
  $("#btnSendMessage").click(function(){
    //emit send message event for server with data is message in textbox have id txtMessage
    socket.emit("User-send-message", $("#txtMessage").val());
    $("#txtMessage").val(""); //make textbox have id txtMessage is empty
  });

  $(".Submit-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var message = $("#txtMessage").val(); //create variable is message in textbox have id txtMessage
      socket.emit("User-send-message", message); //emit send message event for server with variable
      this.reset;
      $("#txtMessage").val(""); //make textbox have id txtMessage is empty
      return false;
    }
  });

  //when click in textbox have id txtMessage
  $("#txtMessage").focusin(function(){
    //emit user is typing event for server
    socket.emit("User-is-typing");
  });

  //when not click in textbox have id txtMessage
  $("#txtMessage").focusout(function(){
    //emit user stop typing event for server
    socket.emit("User-stop-typing");
  });
});
