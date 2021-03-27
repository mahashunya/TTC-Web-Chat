var Task = require('../models/taks')
module.exports = function (User) {
  return {
    SetRouting: function (router) {
      router.get('/taskmanager', this.taskmanager)
      router.post('/taskmanager', this.postmanager)
    },
    taskmanager(req, res) {
      if (req.user === undefined) {
        res.redirect('/signin')
      } else {
        res.render('taskmanager', {
          user: req.user
        })
      }
    },
    postmanager(req, res) {
      var myData = new Task();
      myData.name = req.user.name;
      myData.email = req.user.email;
      myData.Task = req.body.Task;
      myData.Status = req.body.Status;
      myData
        .save();

      res.redirect('/taskmanager')

    }
  }
}