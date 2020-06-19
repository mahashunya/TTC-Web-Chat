$(document).ready(function () {

  var socket = io();

  socket.on('connect', function () {
    var room = 'GlobalRoom';
    var name= $('#name-user').val();
    var img = $('#name-image').val()
    socket.emit('global room',{
      room: room,
      name: name,
      img: img
    })
  })
})