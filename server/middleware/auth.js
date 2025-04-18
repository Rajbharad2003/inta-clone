import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export const auth = (req, res, next) => {
  try {
    // console.log(req);
    // console.log(req.headers.authorization);
    const token = req.body.token || req.cookies.token|| req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token missing",
      });
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decode;
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying token",
    });
  }
};
