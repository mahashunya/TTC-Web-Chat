const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("http");
const path = require("path");
const multer = require("multer");
const { Global } = require("./helpers/Global");

const validator = require("express-validator");
const cookieParser = require("cookie-parser");
const { Users } = require("./helpers/UsersClass");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
//
const flash = require("express-flash");
const passport = require("passport");
const container = require("./container");
const { group } = require("console");
const socketIO = require("socket.io");
const { $where } = require("./models/taks");

//Seen from Stackoverflow(options part)
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};
//ends

container.resolve(function (
  users,
  _,
  admin,
  home,
  group,
  results,
  privatechat,
  taskmanager
) {
  mongoose.Promise = global.Promise;
  // mongoose.connect("mongodb://localhost/project", options);
  mongoose.connect(
    "mongodb+srv://admin:12345@cluster0-yd7og.mongodb.net/<dbname>?retryWrites=true&w=majority",
    options
  );
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
    //latest changes by Rishabh

    // Set The Storage Engine
    const storage = multer.diskStorage({
      destination: "./public/uploads/",
      filename: function (req, file, cb) {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    // Init Upload
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 1 * 1024 * 1024 * 70,
      },
      // fileFilter: function (req, file, cb) {
      //   checkFileType(file, cb);
      // },
    }).single("file");

    // Check File Type
    // function checkFileType(file, cb) {
    //   // Allowed ext
    //   const filetypes = /jpeg|jpg|png|gif/;
    //   // Check ext
    //   const extname = filetypes.test(
    //     path.extname(file.originalname).toLowerCase()
    //   );
    //   // Check mime
    //   const mimetype = filetypes.test(file.mimetype);

    //   if (mimetype && extname) {
    //     return cb(null, true);
    //   } else {
    //     cb("Error: Images Only!");
    //   }
    // }

    // Init app

    // EJS

    app.get("/api/getfile/:filename", (req, res) => {
      const { filename } = req.params;
      res.sendFile(path.resolve("./public/uploads/" + filename));
    });
    //app.get('/views/groupchat/', (req, res) => res.render('group'));

    app.post("/api/public/uploads", (req, res) => {
      upload(req, res, (err) => {
        console.log(req.file);
        if (err) {
          console.log(err);
          //  res.render('group', {
          //   msg: err
          //  });
        } else {
          if (req.file == undefined) {
            console.log(err);
            // res.render('group', {
            //   msg: 'Error: No File Selected!'
            // });
          } else {
            console.log(req.file.filename);
            //Check once
            res.json({
              file: req.file.filename,
            });
            //check once
            // res.render('group', {
            //   msg: 'File Uploaded!',
            //   file: `uploads/${req.file.filename}`
            // });
          }
        }
      });
    });

    //Task Manager Communication
    var db;
    mongoose.connect("mongodb://127.0.0.1:27017/dbserver/", function (
      err,
      database
    ) {
      db = database;
    });

    app.get("/", (req, res) => {
      var cursor = db
        .collection("user_details")
        .find()
        .toArray(function (err, results) {
          console.log(results);
        });
      const { taskname } = req.params;
      res.sendFile(
        path.resolve(
          "mongodb+srv://admin:12345@cluster0-yd7og.mongodb.net/<dbname>?retryWrites=true&w=majority/tasks" +
            taskname
        )
      );
    });

    // Task.findOne({name:name},(err,res)=>{
    //   if(err)
    //   return res.status(500).json({msg:"Internal Server error"});
    //   console.log(res);
    // })

    // $("#textArea").keypress(function (event) {
    //   $.get(
    //     "localhost:8000/api/something",
    //     { e: "test@t.com", status: "U" },
    //     function (data, status) {}
    //   );
    // });
    //Task Manager Communication

    //latest changes by Rishabh

    require("./socket/groupchat")(io, Users);
    require("./socket/friend")(io);
    require("./socket/globalroom.js")(io, Global, _);
    require("./socket/privatemessage")(io);

    const router = require("express-promise-router")();

    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);
    results.SetRouting(router);
    privatechat.SetRouting(router);
    taskmanager.SetRouting(router);

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
