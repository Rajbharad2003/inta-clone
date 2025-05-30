import Post from "../model/post.model.js";
import User from "../model/user.model.js";
// export const getallpost = async (req, res) => {
//   try {
//     const userdetail = req.user;
//     if (userdetail) {
//       const posts = await Post.find({})
//         .populate({
//           path: "like",
//           populate: {
//             path: "user",
//             model: "User",
//             select: '-password',
//             populate: {
//               path: "profile",
//               model: "Profile",
//             },
//             options: { strictPopulate: false },
//           },
//           options: { strictPopulate: false },
//         })
//         .populate({
//           path: "comment",
//           populate: {
//             path: "user",
//             model: "User",
//             select: '-password',
//             populate: {
//               path: "profile",
//               model: "Profile",
//             },
//             options: { strictPopulate: false },
//           },
//           options: { strictPopulate: false },
//         })
//         .populate({
//           path: "user",
//           select: '-password',
//           populate: {
//             path: "profile",
//             model: "Profile",
//           },
//           options: { strictPopulate: false },
//         });

//       // posts.user.password=undefined
//       return res.status(200).json({
//         success: true,
//         message: "all post fatched successfully",
//         posts: posts,
//       });
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "please login or signup first",
//       });
//     }
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: `something want wrong and error is ${error}`,
//     });
//   }
// };

export const getallpost = async (req, res) => {
  try {
    const userdetail = req.user;

    if (userdetail) {
      const posts = await Post.find({})
        .populate({
          path: "like",
          populate: {
            path: "user",
            model: "User",
            select: "-password",
            populate: {
              path: "profile",
              model: "Profile",
            },
            options: { strictPopulate: false },
          },
          options: { strictPopulate: false },
        })
        .populate({
          path: "comment",
          populate: {
            path: "user",
            model: "User",
            select: "-password",
            populate: {
              path: "profile",
              model: "Profile",
            },
            options: { strictPopulate: false },
          },
          options: { strictPopulate: false },
        })
        .populate({
          path: "user",
          select: "-password",
          populate: {
            path: "profile",
            model: "Profile",
          },
          options: { strictPopulate: false },
        })
        .sort({ createdAt: -1 }) // newest first
        .exec();

      return res.status(200).json({
        success: true,
        message: "All posts fetched successfully",
        posts: posts,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};
