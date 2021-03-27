module.exports = function (FriendResult, async, Team, _, Users, Message) {
  return {
    SetRouting: function (router, req) {
      router.get('/home', this.homePage, );
      router.post('/home', this.postHomePage)

      router.get('/logout', this.logout)
    },
    homePage: function (req, res,) {
      if(req.user===undefined){
        res.redirect('/signin');
        
        
      } else{
      async.parallel([
        function (callback) {
          Team.find({}, (err, result) => {
            callback(err, result);

          })

        },
        function (callback) {
          Team.aggregate([{
            $group: {
              _id: "$groupType"

            },
          }], (err, newResult) => {
            callback(err, newResult);
          });

        },
        function (callback) {

          Users.findOne({
              'email': req.user.email
            })
            .populate('request.userId')
            .exec((err, result) => {
              callback(err, result);
            })
        },
        function (callback) {
          const nameRegex = new RegExp("^" + req.user.name.toLowerCase(), "i")
          Message.aggregate([{
            $match: {
              $or: [{
                "senderName": nameRegex
              }, {
                "receiverName": nameRegex
              }]
            }
          }, {
            $sort: {
              "createdAt": -1
            }
          }, {
            $group: {
              "_id": {
                "last_message_between": {
                  $cond: [{
                      $gt: [{
                          $substr: ["$senderName", 0, 1]
                        },
                        {
                          $substr: ["$receiverName", 0, 1]
                        }
                      ]
                    },
                    {
                      $concat: ["$senderName", " and ", "$receiverName"]
                    },
                    {
                      $concat: ["$receiverName", " and ", "$senderName"]
                    }
                  ]
                }
              },
              "body": {
                $first: "$$ROOT"
              }
            }
          }], function (err, newResult) {

            const arr = [{
                path: 'body.sender',
                model: 'usersses'
              },
              {
                path: 'body.receiver',
                model: 'usersses'
              }
            ];

            Message.populate(newResult, arr, (err, newResult1) => {
              callback(err, newResult1);
            });
          })
        },

      ], (err, results) => {
        const res1 = results[0];
        const res2 = results[1];
        const res3 = results[2]
        const res4 = results[3]
        const dataChunk = []
        const chunkSize = 2;
        for (let i = 0; i < res1.length; i += chunkSize) {
          dataChunk.push(res1.slice(i, i + chunkSize))

        }

        const groupTypeSort = _.sortBy(res2, '_id');

        res.render("home", {
          title: "TextConnect - Home",
          chunks: dataChunk,
          groupType: groupTypeSort,
          data: res3,
          user: req.user,
          chat: res4,
        });
      })


    }},
    postHomePage: function (req, res) {
      async.parallel([
        function (callback) {
          Team.updateMany({
            '_id': req.body.id,
            'groupMembers.email': {
              $ne: req.user.email,
            }
          }, {
            $push: {
              groupMembers: {
                email: req.user.email,
                name: req.user.name
              }
            }
          }, (err, count) => {

            // console.log(count)
            callback(err, count);
          })
        },

      ], (err, results) => {
        res.redirect('/home')
      });
      FriendResult.PostRequest(req, res, '/home')
    },
    logout: function (req, res) {
      req.logout();

      res.redirect('/');

    }
  }
}