import User from "../model/user.model.js";

export const getalluser = async (req, res) => {
  try {
    const user = req.user.userid;
    if (user) {
      const alluser = await User.find({}).populate({
        path: "profile",
        model: "Profile",
      }) .select('-password');
      return res.status(200).json({
        success: true,
        message: "all user fatched successfully",
        alluser: alluser,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "please login or signup first",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while fatching all user and error is ${error}`,
    });
  }
};

export const getBatchUser = async (req, res) => {
  try {
    const { userIds } = req.body;
    const user = req.user.userid;
    if (user) {
      const userDetails = await User.find({ _id: { $in: userIds } }).populate({
        path: "profile",
        model: "Profile",
      }) .select('-password');
      return res.status(200).json({
        success: true,
        message: "batch users fatched successfully",
        users: userDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "please login or signup first",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `something went wrong while fatching batch of users and error is ${error}`,
    });
  }
};

// Search users endpoint
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // Create a case-insensitive regex pattern
    const searchPattern = new RegExp(query, 'i');

    // Search in both username and profile name
    const users = await User.find({
      $or: [
        { username: searchPattern },
        { 'profile.profilename': searchPattern }
      ]
    }).select('-password') // Exclude password from results
      .populate({
        path: 'profile', // Populate the profile field
        select: 'profilephoto' // Only include profilephoto
      })
      .limit(10); // Limit results for better performance

    return res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({
      success: false,
      message: "Error searching users"
    });
  }
};