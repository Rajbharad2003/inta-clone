import { model } from "mongoose";
import Story from "../model/story.model.js";
import User from "../model/user.model.js";
export const createStory = async (req, res) => {
  try {
    const userid = req.user.userid;
    const { mediaUrl, mediaType } = req.body;

    console.log("mediaUrl", mediaUrl);
    console.log("mediaType", mediaType);
    // const storyurl = req.body.storyurl;
    if (userid && mediaUrl && mediaType) {
      const story = await Story.create({ user: userid,
        mediaUrl,
        mediaType
      });
      // const story = await Story.create({ user: userid, storyurl });
      return res.status(200).json({
        success: true,
        message: "story created successfully",
        story:story
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "user or storyurl is missing",
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getAllStory = async (req, res) => {
  try {
    const userid = req.user.userid;
    if (userid) {
      /*
      const stories = await Story.find({ user: { $ne: userid } }).populate({
        path: "user",
        model: "User",
        populate: {
          path: "profile",
          model: "Profile",
        },
        options: { strictPopulate: false },
      });*/

      const user = await User.findById(userid).populate( {
        path: "profile",
        select: "following", // Fetch profile photo from Profile model
        options: { strictPopulate: false }
      });
      const followedUsers = Array.isArray(user.profile.following) ? [...user.profile.following, req.user.userid] : [req.user.userid];
      // const followedUsers = user.following.concat(userid); // Include self stories
      const stories = await Story.find({
        user: { $in: followedUsers },  // Fetch stories from followed users + self
        expiresAt: { $gt: new Date() }   // Only include non-expired stories
      })
      .sort({ createdAt: -1 })            // Sort by newest stories first
      .populate({
          path: "user", 
          select: "username",
          populate: {
              path: "profile",
              model: "Profile",
              select: "profilephoto", // Fetch profile photo from Profile model
          },
          options: { strictPopulate: false }
      });
    
      return res.status(200).json({
        success: true,
        message: "story fetched succcessfully",
        stories: stories,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "user or storyurl is missing",
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    if (storyId) {
      const story = await Story.findById(storyId).populate({
        path: "user",
        model: "User",
        populate: {
          path: "profile",
          model: "Profile",
        },
        options: { strictPopulate: false },
      });
      return res.status(200).json({
        success: true,
        message: "story is fetched successfully",
        story: story,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "user is not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while getstory and error is ${error}`,
    });
  }
};

export const getUserStory = async (req, res) => {
  try {
    const userid = req.user.userid;
    if (userid) {
      const story = await Story.findOne({user:userid}).populate({
        path: "user",
        model: "User",
        select: '-password',
        populate: {
          path: "profile",
          model: "Profile",
        },
        options: { strictPopulate: false },
      });
      if(story){

        return res.status(200).json({
          success: true,
          message: "story is fatched successfully",
          story: story,
        });
      }
      return res.status(200).json({
        success:false,
        message:"story is not found "
      })
    } else {
      return res.status(200).json({
        success: false,
        message: "user is not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while getstory and error is ${error}`,
    });
  }
};

export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userid;

    if (!userId) {
      return res.status(200).json({
        success: false,
        message: "user is not found",
      });
    }

    const story = await Story.findById(storyId);

    if (!story) return res.status(200).json({
      success:false,
      message:"story is not found "
    })

    // Check if user has already viewed the story
    const alreadyViewed = story.viewers.some(viewer => viewer.viewerId.toString() === userId);

    if (!alreadyViewed) {
        story.viewers.push({ viewerId: userId, viewedAt: new Date() });
        story.views += 1;
        await story.save();
    }
    return res.status(200).json({
      success: true,
      message: "Story viewed successfully",
      story: story,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while view story and error is ${error}`,
    });
  }
};

// Get Story Viewers
export const GetStoryViews = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userid;

    if (!userId) {
      return res.status(200).json({
        success: false,
        message: "user is not found",
      });
    }

    // const story = await Story.findById(storyId).populate("viewers.viewerId", "username profilePic"); //changes
    const story = await Story.findById(storyId).populate([
      {
        path:"viewers.viewerId",
        model: "User",
        select: '-password',
      },
      {
      path: "user",
      model: "User",
      select: 'username',
      populate: {
        path: "profile",
        model: "Profile",
      },
      options: { strictPopulate: false },
    }]);

    if (!story) return res.status(200).json({
      success:false,
      message:"story is not found "
    })

    // Check if user has already viewed the story
    const count = story.viewers.length;
    // const alreadyViewed = story.viewers.some(viewer => viewer.viewerId.toString() === userId);

    if (!count) {
      return res.status(200).json({
        success:false,
        message:"Error in finding count viewers"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Story viewed successfully",
      story: story,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while view story and error is ${error}`,
    });
  }
};
