import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";// multer middleware for file uploads
import { loginUser, logoutUser,refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
// JWT verification middleware
// Importing necessary modules and middleware for user routes

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1}, // avatar is a single file
        {name: "cover", maxCount: 1} // cover is a single file
    ]),
    registerUser) //register user pe jaega(controller me)

router.route("/login").post(loginUser)

// secure routes
router.route("/logout").post(verifyJWT, logoutUser) // logout user with JWT verification

router.route("/refresh-token").post(refreshAccessToken)
export default router 