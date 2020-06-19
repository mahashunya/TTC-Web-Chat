const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("http");

const {Global} = require('./helpers/Global')

const validator = require("express-validator");
const cookieParser = require("cookie-parser");
const {Users} = require('./helpers/UsersClass');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
//
const flash = require("express-flash");
const passport = require("passport");
const container = require("./container");
const {
  group
} = require("console");
const socketIO = require('socket.io')


//Seen from Stackoverflow(options part)
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
//ends

container.resolve(function (users, _, admin, home, group) {
  mongoose.Promise = global.Promise;
 // mongoose.connect("mongodb://localhost/project", options);
  mongoose.connect("mongodb+srv://admin:12345@cluster0-yd7og.mongodb.net/<dbname>?retryWrites=true&w=majority", options);
  const app = SetupExpress();

  function SetupExpress() {
    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);
    server.listen(3000, function () {
      console.log("Listening at 3000");
    });
    ConfigureExpress(app);
    //Setup Router

    require('./socket/groupchat')(io, Users)
    require('./socket/friend')(io)
    require('./socket/globalroom.js')(io,Global,_);


    const router = require("express-promise-router")();

    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);

    app.use(router);
  }

  function ConfigureExpress(app) {
    require("./passport/passport-local.js");

    app.use(express.static("public"));
    app.use(cookieParser());

    app.set("view engine", "ejs");
    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    app.use(validator());
    app.use(
      session({
        secret: "key",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
          mongooseConnection: mongoose.connection,
        }),
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.locals._ = _;
  }
});