const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User")
const cloudinary = require("cloudinary").v2

//Configure Cloudinary

cloudinary.config({
  cloud_name: "dttjxt1z8",
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
})





//Create a Post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      savedPost.imageUrl = result.secure_url;
      savedPost.imgPublicId = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    const updatedPost = await savedPost.save();
    res.status(200).json({
      message: "Post created successfully",
      post: updatedPost,
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while creating the post",
      error: err,
    });
  }
});




//Update a Post 
router.put("/:id", async(req,res)=> {
 
    try{

    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId){
      await post.updateOne({$set: req.body});
      res.status(200).json('The Post has been updated')
    }else{
        res.status(403).json("You can Only update Your Post")
    }
}catch(err){
    res.status(500).json(err)
}
})


//Delete a post
router.delete("/:id", async(req,res)=> {
 
    try{

    const post = await Post.findById(req.params.id);
    if(post.userId === req.body.userId){
      await post.deleteOne({$set: req.body});
      res.status(200).json('The Post has been deleted')
    }else{
        res.status(403).json("You can Only delete Your Post")
    }
}catch(err){
    res.status(500).json(err)
}
})

// router.delete("/:id", async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.userId !== req.user.id) {
//       return res.status(403).json({ message: "You can only delete your own posts" });
//     }

//     if (post.imgPublicId) {
//       // Delete image from Cloudinary
//       await cloudinary.uploader.destroy(post.imgPublicId);
//     }

//     await post.remove();
//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "An error occurred while deleting the post", error: err });
//   }
// });



//Like /dislike a Post 
router.put("/:id/like", async (req, res) => {
  try{
    const post  = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId)) {
      await post.updateOne({$push: { likes:req.body.userId } });
      res.status(200).json("The post has been like");
    } else{
      await post.updateOne({ $pull: { likes:req.body.userId } });
      res.status(200).json("The Post has Been dislike ")
    }
  }catch(err){
    res.status(500).json(err)
  }
})
//get a post
router.get("/:id", async(req,res) => {
  try{
    const post = await Post.findById(req.params.id);
    res.status(200).json(post)
  }catch(err){
   res.status(500).json(err)
  }
})
//get all post of the user following
router.get("/timeline/:userId", async (req,res)=>{
  try{
     const currentUser = await User.findById(req.params.userId);
     const userPosts = await Post.find({ userId: currentUser._id });
     const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
     );
     res.status(200).json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err);
  }
});

//get  user all post following
router.get("/profile/:username", async (req,res)=>{
  try{
    const user = await User.findOne({username:req.params.username})
     const posts = await Post.find({userId:user._id });
     res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});





module.exports = router;