import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";// multer middleware for file uploads

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1}, // avatar is a single file
        {name: "cover", maxCount: 1} // cover is a single file
    ]),
    registerUser) //register user pe jaega(controller me)

export default router