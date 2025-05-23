import User from "../model/user.model.js";
import Profile from "../model/profile.model.js";
import OTP from "../model/Otp.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
dotenv.config();

export const signup = async (req, res) => {
  try {
    console.log(req);
    const { firstName, lastName, email, password, username, otp } = req.body;
    if (!firstName || !lastName || !email || !password || !username) {
      res.status(400).json({
        success: false,
        message: `please fill all the details`,
      });
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "please provide a valid email ",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "your password is to short please provide at least 6 charcter password ",
      });
    }
    const userexist = await User.findOne({ email });

    if (userexist) {
      return res.status(400).json({
        success: false,
        message: `user already exist please login `,
      });
    }
    const otpverify = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("otp of db", otpverify);
    if (otpverify[0].otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "otp is invalide please try again",
      });
    }
    let hashedpassword;
    try {
      hashedpassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `error occurred while hashing password and error is ${error}`,
      });
    }
    let profile;
    try {
      profile = await Profile.create({
        profilename: firstName,
      });
    } catch (error) {
      console.error("Error occurred while creating profile:", error);
      return res.status(400).json({
        success: false,
        message: `Error occurred while creating profile.`,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedpassword,
      profile,
    });
    user.password = undefined;
    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({
        success: false,
        message: `Email is already in use. Please use a different email.`,
      });
    } else if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.username
    ) {
      return res.status(400).json({
        success: false,
        message: `Username is already taken. Please choose another username.`,
      });
    } else {
      console.error("Unexpected error occurred:", error);
      return res.status(400).json({
        success: false,
        message: `Something went wrong while signing up. and error is ${err}`,
      });
    }
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

export const sendotp = async (req, res) => {
  try {
    console.log("inside send otp controller");
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      console.log("User already exists, returning");
      return res.status(200).json({
        success: false,
        message: `User is already registered`,
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP: ", otp);

    // Store in DB
    await OTP.create({ email, otp });

    // Send OTP via email
    const mailOptions = {
      from: `"Instagram" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fafafa; border-radius: 10px; max-width: 500px; margin: auto; border: 1px solid #e6e6e6;">
    <h2 style="color: #262626;">Instagram Verification Code</h2>
    <p style="color: #555;">Hi there,</p>
    <p style="color: #555;">Use the following OTP to verify your email address and complete your sign-up process on <strong>Instagram</strong>:</p>
      
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 2px;">${otp}</span>
    </div>

    <p style="color: #555;">This code is valid for the next 10 minutes. Please do not share it with anyone.</p>

    <p style="margin-top: 30px; font-size: 14px; color: #999;">If you didn't request this, you can safely ignore this email.</p>

    <p style="color: #999;">– The Instagram Team</p>
  </div>
`

    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Error sending OTP: ", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong while sending OTP. ${error.message}`,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both username or email and password",
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist. Please check Username or Email",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    const payload = {
      userid: user._id,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.token = token;
    user.password = undefined;

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "none"
    };

    // Set token in a cookie
    res.cookie("token", token, options);

    // Set the token in the "Authorization" header (optional)
    res.set("Authorization", `Bearer ${token}`);

    return res.status(200).json({
      success: true,
      token,
      user,
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Something went wrong while logging in: ${error.message}`,
    });
  }
};
