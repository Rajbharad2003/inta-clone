import express from "express";
const router = express.Router();

import { login, sendotp, signup } from "../controller/auth.controller.js";
import { commentpost } from "../controller/comment.controller.js";
import { createpost } from "../controller/createpost.controller.js";
import {
  editprofile,
  editProfilePicture,
  changePassword,
} from "../controller/editprofile.controller.js";
import { follow, removefollow } from "../controller/folllower.controller.js";
import { getallpost } from "../controller/getallpost.controller.js";
import { getalluser, getBatchUser, searchUsers } from "../controller/getalluser.controller.js";
import { getlikepost } from "../controller/getlikepost.controller.js";
import { getBatchPost, getPostById } from "../controller/getPostByid.controller.js";
import { getprofile } from "../controller/getprofile.controller.js";
import { getprofilebyid, getUserProfileById } from "../controller/getprofilebyid.controller.js";
import { getuser } from "../controller/getuser.controller.js";
import { getuserbyid } from "../controller/getuserbyid.controller.js";
import { isSaved } from "../controller/isSaved.controller.js";
import { likePost } from "../controller/like.controller.js";
import { savedpost } from "../controller/savepost.controller.js";
import {
  createStory,
  getAllStory,
  getStoryById,
  getUserStory,
  viewStory,
  GetStoryViews
} from "../controller/story.controller.js";
import { auth } from "../middleware/auth.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/sendotp", sendotp);
router.get("/getuser", auth, getuser);
router.get("/getuserbyid/:userid", auth, getuserbyid);
router.post("/createpost", auth, createpost);
router.get("/getallpost", auth, getallpost);
router.get("/getPostByid/:postid", auth, getPostById);
router.post("/likepost/:postid", auth, likePost);
router.get("/getlikepost/:postid", auth, getlikepost);
router.get('/search', searchUsers);
router.post("/commentpost/:postid", auth, commentpost);
router.post("/follow/:followid", auth, follow);
router.post("/removefollow/:followid", auth, removefollow);
router.post("/savedpost/:postid", auth, savedpost);
router.post("/batchUsers",auth, getBatchUser);
router.post("/batchPosts",auth, getBatchPost);
router.put("/editprofile", auth, editprofile);
router.put("/editProfilePicture/:id", auth, editProfilePicture);
router.put("/changePassword", auth, changePassword);
router.get("/getprofile", auth, getprofile);
router.get("/getprofilebyid/:profileid", auth, getprofilebyid);
router.get("/getUserProfileById/:userId", auth, getUserProfileById);
router.get("/getalluser", auth, getalluser);
router.get("/:postid/isSaved", auth, isSaved);
router.post("/createStory", auth, createStory);
router.get("/getAllStory", auth, getAllStory);
router.get("/getStoryById/:storyId", getStoryById);
router.get("/getUserStory", auth, getUserStory);
router.get("/:storyId/view", auth, viewStory);
router.get("/:storyId/viewers", auth, GetStoryViews);

export default router;
