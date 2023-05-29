const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//Update user 
router.put("/:id", async (req, res) => {
 //Checking if the user is the Admin
if(req.body.userId === req.params.id || req.body.isAdmin){
    //To generate a new password
  if(req.body.password){
    try{
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
        return res.status(500).json(err);
        
    }
  }
  try{

  //find the user Id and Update The Password 
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,

    });
    res.status(200).json("Account has Been Updated")
  } catch (err) {
   console.log(err)
  }
} else{
    return res.status(403).json("You Can update your account");
 }
});
//delete User 
router.delete("/:id", async (req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin){
   try{
 
   //find the user Id and Update The Password 
     const user = await User.findByIdAndDelete(req.params.id);
     res.status(200).json("Account has Been deleted")
   } catch (err) {
    return res.status(500).json(err)
   }
 } else{
     return res.status(403).json("You Can delete only your account");
  }
 });
//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try{
      const user = userId 
      ? await User.findById(userId) 
       : await User.findOne({username: username });
      const {password,updatedAt, ...other} = user._doc
      res.status(200).json(other)
  }catch (err) {
     res.status(500).json(err)
  }
});

//Get Friends 
// router.get("/friends/:userId", async (req, res) => {
//   try{
//       const users = await User.findById(req.params.userId);
//       const friends = await Promise.all(
//         users.followings.map((friendId) => {
//           return User.findById(friendId)
//         })
//       )
//       let friendList = [];
//       friends.map((friend) => {
//         const { _id, username, profilePicture } = friend;
//         friendList.push({ _id, username, profilePicture });
     
//       });
//       res.status(200).json(friendList)
//   }catch(err){
//     res.status(500).json(err)
//     console.log(err)
//   }
// })

router.get("/friends/:userId", async (req, res) => {
  try {
    const users = await User.findById(req.params.userId);
    const friends = await Promise.all(
      users.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );

    const friendList = friends
      .filter((friend) => friend !== null) // Filter out any null values
      .map((friend) => {
        const { _id, username, profilePicture } = friend;
        return { _id, username, profilePicture };
      });

    res.status(200).json(friendList);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if(req.body.userId !== req.params.id){
     try{
        const users = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(!users.followers.includes(req.body.userId)) {
         await users.updateOne({ $push: { followers: req.body.userId } });
         await currentUser.updateOne({ $push: { followings: req.params.id } });
         res.status(200).json("User has been Followed");
        } else {
          res.status(403).json("you already follow this user ")
        }
     }catch(err){
      res.status(500).json(err)
     }
  }else{
    res.status(403).json("You cannot follow Yourself")
  }
})
//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if(req.body.userId !== req.params.id){
     try{
        const users = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(users.followers.includes(req.body.userId)) {
         await users.updateOne({ $pull: { followers: req.body.userId } });
         await currentUser.updateOne({ $pull: { followings: req.params.id } });
         res.status(200).json("User has been unfollowed");
        } else {
          res.status(403).json("you already unfollow this user ")
        }
     }catch(err){
      res.status(500).json(err)
     }
  }else{
    res.status(403).json("You cannot unfollow Yourself")
  }
})






module.exports = router;