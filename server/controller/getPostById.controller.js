import Post from "../model/post.model.js";

export const getPostById = async (req, res) => {
  try {
    const postid = req.params.postid;

    const post = await Post.findById(postid)
    .populate({
      path: "like", 
      populate: {
        path: "user",
        model: "User",
        select: '-password',
        populate: {
          path: "profile",
          model: "Profile",
        },
        options: { strictPopulate: false },
      },
      options: { strictPopulate: false },
    })
    .populate({
      path: "comment",
      populate: {
        path: "user",
        model: "User",
        select: '-password',
        populate: {
          path: "profile",
          model: "Profile",
        },
        options: { strictPopulate: false },
      },
      options: { strictPopulate: false },
    })
    .populate({
      path: "user",
      select: '-password',
      populate: {
        path: "profile",
        model: "Profile",
      },
      options: { strictPopulate: false },
    });
  
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    // post.user.password=undefined
    return res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `something went wrong while fetching post ${error}`,
    });
  }
};

export const getBatchPost = async (req, res) => {
  try {
    const { postIds } = req.body;
    // const posts = await Post.find({ _id: { $in: postIds } });
    const posts = await Post.find({ _id: { $in: postIds } }).sort({ createdAt: -1 }); // Sort by createdAt in descending order

    
    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "batch posts fetched successfully",
      posts: posts,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while fetching batch of posts and error is ${error}`,
    });
  }
};