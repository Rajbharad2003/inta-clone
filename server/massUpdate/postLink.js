import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import Profile from "../model/profile.model.js";

async function updateProfilesWithPostIds() {
  try {
    const posts = await Post.find();

    for (const post of posts) {
      const user = await User.findById(post.user);
      if (!user) continue;

      const profile = await Profile.findById(user.profile);
      if (!profile) continue;

      // Only push if not already in the posts array
      if (!profile.posts.includes(post._id)) {
        profile.posts.push(post._id);
        await profile.save();
        console.log(`Post ${post._id} added to profile ${profile._id}`);
      }
    }

    console.log('Update complete');
  } catch (error) {
    console.error('Error updating profiles:', error);
  }
}

export default updateProfilesWithPostIds;