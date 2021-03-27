

// module.exports = function (Users, async, Message, Group) {
//   return {
//     SetRouting: function (router) {
//       router.get('/group/:name', this.groupPage)
//       router.post('/group/:name', this.groupPostPage);
//       router.get('/logout', this.logout)

//     },
//     groupPage: function (req, res) {
//       const name = req.params.name;
//       async.parallel([
//         function (callback) {
//           Users.findOne({
//               'email': req.user.email
//             })
//             .populate('request.userId')
//             .exec((err, result) => {
//               callback(err, result)
//             })
//         },
//         function (callback) {
//           const nameRegex = new RegExp("^" + req.user.name.toLowerCase(), "i")
//           Message.aggregate([{
//             $match: {
//               $or: [{
//                 "senderName": nameRegex
//               }, {
//                 "receiverName": nameRegex
//               }]
//             }
//           }, {
//             $sort: {
//               "createdAt": -1
//             }
//           }, {
//             $group: {
//               "_id": {
//                 "last_message_between": {
//                   $cond: [{
//                       $gt: [{
//                           $substr: ["$senderName", 0, 1]
//                         },
//                         {
//                           $substr: ["$receiverName", 0, 1]
//                         }
//                       ]
//                     },
//                     {
//                       $concat: ["$senderName", " and ", "$receiverName"]
//                     },
//                     {
//                       $concat: ["$receiverName", " and ", "$senderName"]
//                     }
//                   ]
//                 }
//               },
//               "body": {
//                 $first: "$$ROOT"
//               }
//             }
//           }], function (err, newResult) {

//             const arr = [{
//                 path: 'body.sender',
//                 model: 'usersses'
//               },
//               {
//                 path: 'body.receiver',
//                 model: 'usersses'
//               }
//             ];

//             Message.populate(newResult, arr, (err, newResult1) => {
//               callback(err, newResult1);
//             });
//           })
//         },
//         function (callback) {
//           Team.find({})
//             .populate('sender')
//             .exec((err, result) => {
//               callback(err, result)
//             });
//         }
//       ], (err, results) => {
//         const result1 = results[0];
//         const result2 = results[1];
//         const result3 = results[2];
//         const result4 = results[3];
       
//         res.render('groupchat/group', {
//           title: 'TextConnect-Group',
//           user: req.user,
//           groupName: name,
//           data: result1,
//           chat: result2,
//           groupMsg: result2
//         })
//       })


//     },
//     groupPostPage: function (req, res) {

//       async.parallel([
//         function (callback) {
//           if (req.body.receiverName) {
//             Users.updateMany({
//               'name': req.body.receiverName,
//               'request.userId': {
//                 $ne: req.user._id
//               },
//               'friendsList.friendId': {
//                 $ne: req.user._id
//               }
//             }, {
//               $push: {
//                 request: {
//                   userId: req.user._id,
//                   name: req.user.name
//                 }
//               },
//               $inc: {
//                 totalRequest: 1
//               }
//             }, (err, count) => {
//               callback(err, count)
//             })
//           }
//         },
//         function (callback) {
//           if (req.body.receiverName) {
//             Users.updateMany({
//               'name': req.user.name,
//               'sendRequest.name': {
//                 $ne: req.body.receiverName
//               }

//             }, {
//               $push: {
//                 sentRequest: {
//                   name: req.body.receiverName
//                 }
//               }
//             }, (err, count) => {
//               callback(err, count);
//             })
//           }
//         }
//       ], (err, results) => {
//         res.redirect('/group/' + req.params.name)
//       });

//       async.parallel([
//         function (callback) {
//           if (req.body.senderId) {

//             Users.updateMany({
//               '_id': req.user._id,
//               'friendsList.friendId': {
//                 $ne: req.body.senderId
//               }
//             }, {
//               $push: {
//                 friendsList: {
//                   friendId: req.body.senderId,
//                   friendName: req.body.senderName
//                 }
//               },
//               $pull: {
//                 request: {
//                   userId: req.body.senderId,
//                   name: req.body.senderName
//                 }
//               },
//               $inc: {
//                 totalRequest: -1
//               }
//             }, (err, count) => {
//               callback(err, count);
//             });
//           }
//         },
//         //Sender update
//         function (callback) {
//           if (req.body.senderId) {

//             Users.updateMany({
//               '_id': req.body.senderId,
//               'friendsList.friendId': {
//                 $ne: req.user._id
//               }
//             }, {
//               $push: {
//                 friendsList: {
//                   friendId: req.user._id,
//                   friendName: req.user.name
//                 }
//               },
//               $pull: {
//                 sentRequest: {

//                   name: req.user.name
//                 }
//               },

//             }, (err, count) => {
//               callback(err, count);
//             });
//           }
//         },

//         function (callback) {
//           if (req.body.user_Id) {

//             Users.updateMany({
//               '_id': req.user._id,
//               'request.userId': {
//                 $eq: req.body.user_Id
//               }
//             }, {
//               $pull: {
//                 request: {
//                   userId: req.body.user_Id
//                 }
//               },
//               $inc: {
//                 totalRequest: -1
//               }
//             }, (err, count) => {
//               callback(err, count);
//             });
//           }
//         },

//         function (callback) {
//           if (req.body.user_Id) {

//             Users.updateMany({
//               '_id': req.body.user_Id,
//               'sentRequest.name': {
//                 $eq: req.user.name
//               }
//             }, {

//               $pull: {
//                 sentRequest: {

//                   name: req.user.name
//                 }
//               }

//             }, (err, count) => {
//               callback(err, count);
//             });
//           }
//         },

//       ], (err, results) => {
//         res.redirect('/group/' + req.params.name);

//       });
//       async.parallel([


//         function (callback) {
//           if (req.body.message) {
//             const group = new Group();
//             group.sender = req.user._id;
//             group.body = req.body.message;
//             group.name = req.body.groupName;
//             group.createdAt = new Date();
           

//             group.save((err, msg) => {
//               callback(err, msg);
//             });
//           }
//         }
//       ])
//     },
//     logout: function (req, res) {
//       req.logout();

//       res.redirect('/');

//     }
//   }
//}


module.exports = function (Users, async, Message,  Group, FriendResult) {
  return {
    SetRouting: function (router) {
      router.get('/group/:name', this.groupPage);
      router.post('/group/:name', this.groupPostPage);

      router.get('/logout', this.logout);
    },

    groupPage: function (req, res) {
        if (req.user === undefined) {
          res.redirect('/signin');


        } else {
      const name = req.params.name;
      
      async.parallel([
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
            }}],
            function (err, newResult){
              callback(err,newResult)
            }
            )
          },
              function (callback) {
                Group.find({})
                  .populate('sender')
                  .exec((err, result) => {
                    callback(err, result)
                  });
              }
          ],  (err, results) => {
        const result1 = results[0];
        const result2 = results[1];
        const result3 = results[2];

        res.render('groupchat/group', {
          title: 'TextConnect - Group',
          user: req.user,
          groupName: name,
          data: result1,
          chat: result2,
          groupMsg: result3
        });
      });
    }},

    groupPostPage: function (req, res) {
      FriendResult.PostRequest(req, res, '/group/' + req.params.name);

      async.parallel([
        function (callback) {
          if (req.body.message) {
            const group = new Group();
            group.sender = req.user._id;
            group.body = req.body.message;
            group.name = req.body.groupName;
            group.createdAt = new Date();

            group.save((err, msg) => {
              callback(err, msg);
            });
          }
        }
      ], (err, results) => {
        res.redirect('/group/' + req.params.name);
      });
    },

    logout: function (req, res) {
      req.logout();

      res.redirect('/');

    }
  }
}


