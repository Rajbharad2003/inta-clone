import User from "../model/user.model.js";
import Profile from "../model/profile.model.js";

export const follow = async (req, res) => {
  try {
    const followerid = req.params.followid;
    const userid = req.user.userid;
    if (followerid === userid) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }
    const followuser = await User.findById(followerid);
    if (!followuser) {
      return res.status(404).json({
        success: false,
        message: "Follower not found",
      });
    }
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userprofileid = user.profile;
    const followprofileid = followuser.profile;
    const userprofile = await Profile.findById(userprofileid);
    if (!userprofile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }
    const followingarray = userprofile.following;
    if (!followingarray.includes(followerid)) {
      await Profile.findByIdAndUpdate(
        userprofileid,
        { $push: { following: followerid } },
        { new: true }
      );
      await Profile.findByIdAndUpdate(
        followprofileid,
        { $push: { followers: userid } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "followed successfully",
      });
    } else {
      await Profile.findByIdAndUpdate(
        userprofileid,
        { $pull: { following: followerid } },
        { new: true }
      );
      await Profile.findByIdAndUpdate(
        followprofileid,
        { $pull: { followers: userid } },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
      });
    }
  } catch (error) {
    console.error("Error during follow:", error);
    res.status(500).json({
      success: false,
      message: `Something went wrong while following the user. Error: ${error}`,
    });
  }
};


export const removefollow = async (req, res) => {
  try {
    const followerid = req.params.followid;
    const userid = req.user.userid;
    // console.log("userid : " , userid);
    // console.log("followerid : " , followerid);
    if (followerid === userid) {
      return res.status(406).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }
    
    const followuser = await User.findById(followerid);
    if (!followuser) {
      return res.status(404).json({
        success: false,
        message: "Follower not found",
      });
    }
    
    const user = await User.findById(userid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    const userprofileid = user.profile.toString();
    const followprofileid = followuser.profile.toString();
    // console.log("userprofileid : " , userprofileid);
    // console.log("followprofileid : " , followprofileid);
    const userprofile = await Profile.findById(userprofileid);
    
    const followprofile = await Profile.findById(followprofileid);
    // console.log("userprofile : " , userprofile);
    if (!userprofile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    if (!followprofile) {
      return res.status(404).json({
        success: false,
        message: "follwer user profile not found",
      });
    }
    const followerarray = userprofile.followers;

    // console.log(followerarray);

    if (followerarray.includes(followerid)) {
      const u = await Profile.findByIdAndUpdate(
        userprofileid,
        { $pull: { followers: followerid } },
        { new: true }
      );
      // console.log("u",u);
      const p =await Profile.findByIdAndUpdate(
        followprofileid,
        { $pull: { following: userid } },
        { new: true }
      );
      // console.log("p",p);
      return res.status(200).json({
        success: true,
        message: "removed followed successfully",
      });
    } 
    else {
      console.log("in else");
      /*
      const followingarray = userprofile.following;
      if (!followingarray.includes(followerid)) {
        const u =await Profile.findByIdAndUpdate(
          userprofileid,
          { $push: { following: followerid } },
          { new: true }
        );
        // console.log("u",u);
        const p =await Profile.findByIdAndUpdate(
          followprofileid,
          { $push: { followers: userid } },
          { new: true }
        );
        // console.log("p",p);
      }**/
      res.status(500).json({
        success: false,
        message: `Something went wrong while following the user. Error: ${error}`,
      });
    }
  } catch (error) {
    console.error("Error during follow:", error);
    res.status(500).json({
      success: false,
      message: `Something went wrong while following the user. Error: ${error}`,
    });
  }
};

// const FollowUser = async (currentUserId, followerUserId, currentUserProfileId, followerUserProfileId ) => {

//   try {
//     const cUserProfile = await Profile.findByIdAndUpdate(
//       currentUserProfileId,
//       {$push : {followers : followerUserId}},
//       {new : true}
//     );
//     console.log(cUserProfile);

//     const followUserProfile = await Profile.findByIdAndUpdate(
//       followerUserProfileId,
//       {$push : {following : currentUserId}},
//       {new : true}
//     );
//     console.log(followUserProfile);

//     return true;

//   } catch (error) {
//     console.error(error);
//     return false;
//   }

// }

// const UnFollowUser = async (currentUserId, followerUserId, currentUserProfileId, followerUserProfileId ) => {

//   try {
//     const cUserProfile = await Profile.findByIdAndUpdate(
//       currentUserProfileId,
//       {$pull : {following : followerUserId}},
//       {new : true}
//     );
//     console.log(cUserProfile);

//     const followUserProfile = await Profile.findByIdAndUpdate(
//       followerUserProfileId,
//       {$pull : {followers : currentUserId}},
//       {new : true}
//     );
//     console.log(followUserProfile);

//     return true;

//   } catch (error) {
//     console.error(error);
//     return false;
//   }

// }

// export const handleFollow = async (req, res) => {
//   try {

//     const followerid = req.params.followid;
//     const currentUserid = req.user.userid;
//     // console.log("userid : " , currentUserid);
//     // console.log("followerid : " , followerid);
//     if (followerid === currentUserid) {
//       return res.status(406).json({
//         success: false,
//         message: "You cannot follow yourself",
//       });
//     }
    
//     const followuser = await User.findById(followerid);
//     if (!followuser) {
//       return res.status(404).json({
//         success: false,
//         message: "Follower not found",
//       });
//     }
    
//     const user = await User.findById(currentUserid);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const userProfileId = user.profile.toString();
//     const followerProfileId = followuser.profile.toString();
//     console.log("userProfileId : " , userProfileId);
//     console.log("followerProfileId : " , followerProfileId);
//     const userProfile = await Profile.findById(userProfileId);
    
//     if (!userProfile) {
//       return res.status(404).json({
//         success: false,
//         message: "User profile not found",
//       });
//     }
    
//     const followUserProfile = await Profile.findById(followerProfileId);
//     // console.log("userprofile : " , userprofile);

//     if (!followUserProfile) {
//       return res.status(404).json({
//         success: false,
//         message: "follwer user profile not found",
//       });
//     }

//     const userFollowing = userProfile.following;

//     const followUserFollowers = followUserProfile.followers;

//     if(userFollowing.includes(followerid) && followUserFollowers.includes(currentUserid))
//     {
//       //remove user '
//       console.log("removing user");
//       const flag = UnFollowUser(currentUserid, followerid, userProfileId, followerProfileId )
  
//       if(flag)
//       {
//         return res.status(200).json({
//           success: true,
//           message: "unfollowed successfully",
//         });
//       }
//       else{
//         res.status(500).json({
//           success: false,
//           message: `Something went wrong while following the user. Error: ${error}`,
//         });
//       }
//     }
//     else if(!userFollowing.includes(followerid) && !followUserFollowers.includes(currentUserid))
//     {
//       //follow user
//       const flag = FollowUser(currentUserid, followerid, userProfileId, followerProfileId )

//       if(flag)
//       {
//         return res.status(200).json({
//           success: true,
//           message: "followed successfully",
//         });
//       }
//       else{
//         res.status(500).json({
//           success: false,
//           message: `Something went wrong while following the user. Error: ${error}`,
//         });
//       }
      
//     }

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: `Something went wrong while following the user. Error: ${error}`,
//     });
//   }
// }