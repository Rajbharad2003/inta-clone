import fetch from "node-fetch";
import bcrypt from "bcrypt";
import User from "../model/user.model.js";
import Profile from "../model/profile.model.js";

async function fetchAndSignupUsers() {
  try {
    // Fetch 100 random users
    const response = await fetch("https://randomuser.me/api/?results=100");
    const data = await response.json();

    // Process users
    for (const user of data.results) {
      const firstName = user.name.first;
      const lastName = user.name.last;
      const email = user.email;
      const username = user.login.username;
      const profilePic = user.picture.medium;
      const password = "password123"; // Default password for testing

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        console.log(`Invalid email: ${email}`);
        continue;
      }

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log(`User already exists: ${email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create profile
      const profile = await Profile.create({ profilename: firstName });

      // Create user
      await User.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        profile,
        profilePic,
      });

      console.log(`User created: ${username}`);
    }

    console.log("All users processed successfully!");
  } catch (error) {
    console.error("Error while signing up users:", error);
  }
}

export default fetchAndSignupUsers;