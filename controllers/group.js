

module.exports = function (Users, async) {
  return {
    SetRouting: function (router) {
      router.get('/group/:name', this.groupPage)
      router.post('/group/:name', this.groupPostPage)

    },
    groupPage: function (req, res) {
      const name = req.params.name;
      async.parallel([
        function (callback) {
          Users.findOne({
              'email': req.user.email
            })
            .populate('request.userId')
            .exec((err, result) => {
              callback(err, result)
            })
        }
      ], (err, results) => {
        const result1= results[0];
        
        res.render('groupchat/group', {
          title: 'TextConnect-Group',
          user: req.user,
          groupName: name, data: result1
        })
      })


    },
    groupPostPage: function (req, res) {

      async.parallel([
        function (callback) {
          if (req.body.receiverName) {
            Users.update({
              'name': req.body.receiverName,
              'request.userId': {
                $ne: req.user._id
              },
              'friendsList.friendId': {
                $ne: req.user._id
              }
            }, {
              $push: {
                request: {
                  userId: req.user._id,
                  name: req.user.name
                }
              },
              $inc: {
                totalRequest: 1
              }
            }, (err, count) => {
              callback(err, count)
            })
          }
        },
        function (callback) {
          if (req.body.receiverName) {
            Users.update({
              'name': req.user.name,
              'sendRequest.name': {
                $ne: req.body.receiverName
              }

            }, {
              $push: {
                sentRequest: {
                  name: req.body.receiverName
                }
              }
            }, (err, count) => {
              callback(err, count);
            })
          }
        }
      ], (err, results) => {
        res.redirect('/group/' + req.params.name)
      });

      async.parallel([
        function(callback){
          if(req.body.senderId){

            Users.update({
              '_id': req.user._id,
              'friendsList.friendId' :{$ne: req.body.senderId}
            },{
                $push:{friendsList:{
                  friendId: req.body.senderId,
                  friendName:req.body.senderName
                  }},
                $pull: {request:{
                  userId: req.body.senderId,
                  name: req.body.senderName
                  }},
                $inc: {totalRequest:-1}
            },(err,count)=>{
              callback(err, count);
            });
          }
        },
        //Sender update
        function (callback) {
          if (req.body.senderId) {

            Users.update({
              '_id': req.body.senderId,
              'friendsList.friendId': {
                $ne: req.user._id
              }
            }, {
              $push: {
                friendsList: {
                  friendId: req.user._id,
                  friendName: req.user.name
                }
              },
              $pull: {
                sentRequest: {
                
                  name: req.user.name
                }
              },
            
            }, (err, count) => {
              callback(err, count);
            });
          }
        },

        function (callback) {
          if (req.body.user_Id) {

            Users.update({
              '_id': req.user._id,
              'request.userId': { $eq: req.body.user_Id}
            }, 
            {$pull: {
                request: {
                  userId: req.body.user_Id
                }
              },
              $inc: {totalRequest:-1}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },

        function (callback) {
          if (req.body.user_Id) {

            Users.update({
              '_id': req.body.user_Id,
              'sentRequest.name': {
                $eq: req.user.name
              }
            }, {

              $pull: {
                sentRequest: {

                name: req.user.name
                }
              }
              
            }, (err, count) => {
              callback(err, count);
            });
          }
        }
      ], (err,results)=>{
        res.redirect('/group/'+req.params.name)
      })
    }
  }
}