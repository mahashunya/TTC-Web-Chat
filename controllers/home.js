module.exports = function (async, Team, _,Users) {
  return {
    SetRouting: function (router, req) {
      router.get('/home', this.homePage);
      router.post('/home',this.postHomePage)
    },
    homePage: function (req, res) {
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
          }],  (err, newResult) => {
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
      ], (err, results) => {
        const res1 = results[0];
        const res2 = results[1];
        const res3= results[2]

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
        });
      })


    },
    postHomePage:function(req,res){
      async.parallel([
        function(callback){
          Team.updateMany({
            '_id': req.body.id,
            'groupMembers.email': {$ne:req.user.email,
            }
          },{
            $push:{groupMembers:{
              email: req.user.email,
              name: req.user.name
            }}
          },(err,count)=>{
            
            console.log(count)
            callback(err,count);
          })
        }
      ], (err,results) =>{
        res.redirect('/home')
      });
    }
  }
}