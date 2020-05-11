var socket = io("/");

socket.on("Box-blank", function(data){
  alert(data);
});

socket.on("Server-send-registration-fail", function(){
  alert("The Username has been registered");
});

socket.on("Server-send-registration-success", function(data){
  $("#currentUser1").html(data);
  $("#currentUser2").html(data);
  $("#loginForm").hide(0);
  $("#roomForm").show(0);
  $("#chatForm").hide(0);
});

socket.on("Server-send-users-list", function(data){
  $("#boxContentuser1").html("");
  $("#boxContentuser2").html("");
  data.forEach(function(i){
    $("#boxContentuser1").append("<div class='user'>" + i + "</div>");
    $("#boxContentuser2").append("<div class='user'>" + i + "</div>");
  });
});

socket.on("Room-doesn't-exist", function(data){  
    socket.emit("Create-new-room", data);
});

socket.on("Room-exist", function(data){  
    socket.emit("Join-room", data);
});

socket.on("Limited-users", function(){
    alert("Room is full of users.");
});

socket.on("Server-send-room-success", function(data){
  $("#currentRoom").html(data);
  $("#loginForm").hide(0);
  $("#roomForm").hide(0);
  $("#chatForm").show(0);
});

socket.on("Server-send-rooms-list", function(data){
  $("#boxContentroom").html("");
  data.forEach(function(r){
    $("#boxContentroom").append("<div class='room'>" + r + "</div>");
  });
});

socket.on("Server-send-mesage", function(data){
  console.log(data);
  outputMessage(data);
});

function outputMessage(data) {
    const div = document.createElement('div');
    div.classList.add('Server-send-mesage');
    div.innerHTML = `<div class="message">
    <p class="meta">${data.username} <span>${data.time}</span></p>
    <p class="text">${data.text}</p>`;
    document.querySelector('#listMessages').appendChild(div);
}

socket.on("Someone-is-typing", function(data){
  $("#notification").html("<img width='20px' src='typing05.gif'> " + data);
});

socket.on("Someone-stop-typing", function(){
  $("#notification").html("");
});

socket.on("Room-name-succes", function(){
  $("#chatForm").hide(0);
  $("#roomForm").show(0);
  $("#loginForm").hide(0);
});

$(document).ready(function(){
  $("#loginForm").show(0);
  $("#roomForm").hide(0);
  $("#chatForm").hide(0);

  $("#btnRegister").click(function(){
    socket.emit("Client-send-Username", $("#txtUsername").val());
    $("#txtUsername").val("");
  });

  $(".Register-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var register = $("#txtUsername").val();
      socket.emit("Client-send-Username", register);
      this.reset;
      $("#txtUsername").val("");
      return false;
    }
  });

  $("#btnLogout1").click(function(){
    socket.emit("Logout");
    $("#chatForm").hide(0);
    $("#roomForm").hide(0);
    $("#loginForm").show(0);
  });

  $("#btnSendRoom").click(function(){
    socket.emit("Check-room", $("#txtRoom").val());
    $("#txtRoom").val("");
  });

  $(".Submit-room-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var room = $("#txtRoom").val();
      socket.emit("Check-room", room);
      this.reset;
      $("#txtRoom").val("");
      return false;
    }
  });

  $("#btnLogout2").click(function(){
    socket.emit("Logout");
    $("#chatForm").hide(0);
    $("#roomForm").hide(0);
    $("#loginForm").show(0);
  });

  $("#btnLeave").click(function(){
    var roomName = prompt("Input room name you want to leave:");
    if (roomName == null || roomName == "") {
      alert("You must enter the room name");
    }else{
      socket.emit("leave-room", roomName);
      this.reset;
    }

  });

  $("#btnSendMessage").click(function(){
    socket.emit("User-send-message", $("#txtMessage").val());
    $("#txtMessage").val("");
  });

  $(".Submit-on-enter").keydown(function(event){
    // Enter key has keyCode = 13
    if (event.keyCode == 13) {
      var message = $("#txtMessage").val();
      socket.emit("User-send-message", message);
      this.reset;
      $("#txtMessage").val("");
      return false;
    }
  });

  $("#txtMessage").focusin(function(){
    socket.emit("User-is-typing");
  });

  $("#txtMessage").focusout(function(){
    socket.emit("User-stop-typing");
  });
});
