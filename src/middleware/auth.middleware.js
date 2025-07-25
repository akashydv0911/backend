import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const rawToken = req.cookies?.accessToken || req.header("Authorization");

        console.log("Raw token received:", JSON.stringify(rawToken));

        if (!rawToken) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        let token = rawToken;

        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        if (!token || token.split(".").length !== 3) {
            throw new ApiError(400, "Malformed JWT: Invalid token format");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        throw new ApiError(401, "Invalid or malformed token");
    }
});






export { verifyJWT };