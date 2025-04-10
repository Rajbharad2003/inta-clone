import Profile from "../model/profile.model.js";
import User from "../model/user.model.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import bcrypt from "bcrypt";
export const editprofile = async (req, res) => {
  try {
    const bio = req.body.bio;
    const userdetails = await User.find({ email: req.body.email });

    if (userdetails) {
      const profileid = userdetails[0].profile;
      const profileUpdate = await Profile.findById(profileid)

      if (bio !== undefined) {
        profileUpdate.bio = bio ? bio : "";
      }

      // if (url) {
      //   profileUpdate.profilephoto = url;
      // }

      // const updatesprofile = await Profile.findByIdAndUpdate(
      //   profileid,
      //   profileUpdate,
      //   { new: true }
      // );
      await profileUpdate.save();
      const updatedUser = await User.findOne({ profile: profileid }).populate({
        path: "profile",
        populate: [
          { path: "posts", model: "Post" },
          {
            path: "followers",
            model: "User",
            select: '-password',
            populate: {
              path: "profile",
              model: "Profile",
            },
          },
          {
            path: "following",
            model: "User",
            select: '-password',
            populate: {
              path: "profile",
              model: "Profile",
            },
          },
          {
            path: "saved",
            model: "Post",
          },
        ],
      });
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        // profile: updatesprofile,
        data: updatedUser
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong while editing profile. Error: ${error}`,
    });
  }
};

export const editProfilePicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userid = req.params.id;
    const user = await User.findById(userid)
    if (!user) {
      return res.status(404).json({
        suucess: false,
        message: "user does not exist"
      })
    }
    console.log("displaypicture", displayPicture)
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME
    );
    const profileId = user.profile
    // const profile = await Profile.findById(profileId);
    // console.log(" profile", profile);

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId, // Use objectId here
      { profilephoto: image.secure_url },
      { new: true }
    );
    const updatedUser = await User.findOne({ profile: profileId }).populate({
      path: "profile",
      populate: [
        { path: "posts", model: "Post" },
        {
          path: "followers",
          model: "User",
          select: '-password',
          populate: {
            path: "profile",
            model: "Profile",
          },
        },
        {
          path: "following",
          model: "User",
          select: '-password',
          populate: {
            path: "profile",
            model: "Profile",
          },
        },
        {
          path: "saved",
          model: "Post",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong while changing password. Error: ${error}`,
    });
  }
}