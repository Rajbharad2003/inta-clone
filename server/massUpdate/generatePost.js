import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import Comment from "../model/comment.model.js";

async function generatePosts() {
  try {

    // Fetch all users
    const users = await User.find();
    const userIds = users.map(user => user._id);

    for (const user of users) {
      for (let i = 0; i < 2; i++) {
        // Generate random image URL
        const postImage = faker.image.url();

        // Select random users for likes (3 to 10 likes)
        const randomLikes = faker.helpers.arrayElements(userIds, {
          min: 3,
          max: 10,
        });

        // Select random users to comment (1 to 5 comments)
        const randomCommenters = faker.helpers.arrayElements(userIds, {
          min: 1,
          max: 5,
        });

        // Create post
        const post = await Post.create({
          posturl: postImage,
          like: randomLikes,
          comment: [],
          user: user._id,
        });

        // Create comments
        const commentDocs = await Promise.all(
          randomCommenters.map(async commenterId => {
            const comment = await Comment.create({
              post: post._id,
              user: commenterId,
              comment: faker.lorem.sentence(),
            });
            return comment._id;
          })
        );

        // Update post with comment IDs
        post.comment = commentDocs;
        await post.save();

        console.log(`Created post for user: ${user.username}`);
      }
    }

    console.log("✅ All posts with likes & comments created successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close(); // Close DB connection
  }
}


export default generatePosts;