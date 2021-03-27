

module.exports = function (formidable,Team,aws) {
  return {
    SetRouting: function (router) {
      router.get('/dashboard', this.adminPage);

      router.post('/uploadFile', aws.Upload.any(), this.uploadFile);
      router.post('/dashboard', this.adminPostPage);
    },

    adminPage: function (req, res) {
        if (req.user === undefined) {
          res.redirect('/signin');


        } else {
      res.render('admin/dashboard');
    }},

    adminPostPage: function (req, res) {
      const newTeam = new Team();
      newTeam.groupname = req.body.groupname;
      newTeam.groupType = req.body.groupType;
      newTeam.image = req.body.upload;
      newTeam.save((err) => {
        res.render('admin/dashboard');
      })
    },

    uploadFile: function (req, res) {
      const form = new formidable.IncomingForm();
      form.on('file', (field, file) => {

      });

      form.on('error', (err) => {});

      form.on('end', () => {

      });

      form.parse(req);
    }
  }
}
