import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser) //register user pe jaega(controller me)

export default router