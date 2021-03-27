const chatForm = document.getElementById("fileT");
$("#tm").hide();
$(document).ready(function () {
  var socket = io();

  var room = $("#groupName").val();
  var sender = $("#sender").val();
  socket.on("connect", function () {
    console.log("User is now connected");
    var params = {
      room: room,
      name: sender,
    };
    socket.emit("join", params, function () {
      console.log("User has joined this channel");
    });
  });
  socket.on("usersList", function (users) {
    var ol = $("<ol></ol>");

    for (var i = 0; i < users.length; i++) {
      ol.append(
        '<p> <a style="color: #9993B9;" id="val" data-toggle="modal" data-target="#myModal" >' +
          users[i] +
          "</a></p>"
      );
    }

    $(document).on("click", "#val", function () {
      $("#name").text("@" + $(this).text());
      $("#receiverName").val($(this).text());
      $("#nameLink").attr("href", "/profile/" + $(this).text());
    });

    $("#numValue").text("(" + users.length + ")");
    $("#users").html(ol);
  });

  socket.on("newMessage", function (data) {
    var template = $("#message-template").html();
    var message = Mustache.render(template, {
      //Rishabh's latest changes
      text: data.file ? "" : data.text,
      sender: data.from,
      link: data.file ? data.text : "",
      //Rishabh's latest changes
    });
    $("#messages").append(message);
  });

  $("#msg").bind("keydown", function (e) {
    console.log(e.which);
    if (e.which === 192) {
      $("#tm").show();
      // which is normalized by jQuery
    }
  });

  $("#message-form").on("submit", function (e) {
    e.preventDefault();
    var msg = $("#msg").val();
    socket.emit(
      "createMessage",
      {
        text: msg,
        room: room,
        sender: sender,
      },
      function () {
        $("#msg").val("");
      }
    );
    // new part by manish
    $.ajax({
      url: "/group/" + room,
      type: "POST",
      data: {
        message: msg,
        groupName: room,
      },
      success: function () {
        $("#msg").val("");
      },
    });

    // new part by manish ends here
  });

  //latest changes by Rishabh
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = e.target.elements["myImg"].value;

    if (file) {
      var data;
      data = new FormData();
      data.append("file", $("#myImg")[0].files[0]);

      $.ajax({
        url: "/api/public/uploads",
        type: "POST",
        processData: false,
        contentType: false,
        data,

        success: ({ file }) => {
          console.log(file);
          socket.emit("chatFile", {
            file: file,
            room: room,
            sender: sender,
          });
          $("#myImg").val("");
        },
      });
    }
  });

  $(document).on("click", "#submitT", function () {
    $("#tm").hide();
  });
  // $("#hidden-link").click(function () {
  //   var win = window.open("/taskmanager");
  //   //win.focus();
  //   //The above is optional, if the window opens but doesn't focus then uncomment the above line
  // });
  //latest changes by Rishabh
});
