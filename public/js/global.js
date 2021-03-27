$(document).ready(function () {

      var socket = io();

      socket.on('connect', function () {
        var room = 'GlobalRoom';
        var name = $('#name-user').val();
        var img = $('#name-image').val()
        socket.emit('global room', {
          room: room,
          name: name,
          img: img
        })
         socket.on('message display', function () {
         $('#reload').load(location.href + ' #reload');
         });
         });
      
      socket.on('loggedInUser', function (users) {
        var friends = $('.friend').text();
        var friend = friends.split('@');

        var name = $('#name-user').val().toLowerCase();
        var ol = $('<div></div>');
        var arr = [];

        for (var i = 0; i < users.length; i++) {
          if (friend.indexOf(users[i].name) > -1) {
            arr.push(users[i]);
            var userName = users[i].name.toLowerCase();

            var list = '<img src= "https://placehold.it/300x300" class="pull-left img-circle" style="width:50px; margin-right:10px;"/><p>' + '<a style="color: #9993b3!important; font-weight: 800!important;" href="/chat/'+userName.replace(/ /g,"-")+'.'+name+'"> <h3 style="padding-top:15px; color: #9993b3!important; font-weight: 800;  font-size:14px;" >' + '@' + users[i].name + '<span class ="fa fa-circle online_friend"> </span> </h3><br> </a> </p>'

            ol.append(list)
          }
        }
        $('#numOfFriends').text('(' + arr.length + ')');
        $('.onlineFriends').html(ol);
      })
      })