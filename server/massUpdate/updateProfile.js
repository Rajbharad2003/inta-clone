import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Profile from "../model/profile.model.js";

// Function to update profile pictures
async function updateProfilePictures() {
  try {
    const profiles = await Profile.find();

    for (const profile of profiles) {
      const newProfilePic = faker.image.avatar(); // Generate a random avatar

      // Update profile profile picture
      await Profile.updateOne({ _id: profile._id }, { profilephoto: newProfilePic });

      console.log(`Updated profile picture for: ${profile.profilename}`);
    }

    console.log("All profile pictures updated successfully!");
  } catch (error) {
    console.error("Error updating profile pictures:", error);
  } finally {
    mongoose.connection.close(); // Close connection after update
  }
}

export default updateProfilePictures