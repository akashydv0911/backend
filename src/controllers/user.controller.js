import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js" // Importing the User model to interact with the user data in the database
import {uploadOnCloudinary} from "../utils/cloudinary.js" // Importing a utility function to handle file uploads to Cloudinary
import { ApiResponse } from "../utils/ApiResponse.js"
import  jwt from "jsonwebtoken"

const registerUser = asyncHandler( async(req, res) =>{
    // steps
    // get user details from forntend (we get data from postman)
    // user model se pta chlega kya kya details chaiye
    // validation( kahi user kch khali na chor de ya email glt likh de)
    // check if user is already exists : username, email
    // check for images , check for avatar (upload them to cloudinary)
    // crete user object - create entry in db
    // remove password and refresh token field from response
    //  check for user creation 
    // return response 

    const {fullname,email,username, password} = req.body // destructuring the body of the request .This line assumes that the incoming HTTP request has a body with keys fullname, email, username, and password.
    // console.log("email",email);

    if(
        [fullname, email, username, password].some((field) => //some() method checks if at least one element in the array passes the test implemented by the provided function.
        field?.trim()==="") // checking if any of the fields are empty
    ) {
        throw new ApiError(400, "All fields are required") // if any field is empty, throw an error
    }
    if(!email.includes("@")){ // checking if email is valid
        throw new ApiError(400, "Email is not valid") // if email is not valid, throw an error
    }

    const existedUser = await User.findOne({
        $or: [ // $or operator is used to find a document that matches at least one of the specified conditions
            {email}, // checking if email already exists
            {username} // checking if username already exists
        ]
    })

    if (existedUser) { // if user already exists
        throw new ApiError(409, "User already exists with this email or username") // throw an error
    }

    if (!req.files || !req.files.avatar || !Array.isArray(req.files.avatar) || !req.files.avatar[0]) {
        throw new ApiError(400, "Avatar image is required.");
    } 
    if (!req.files.cover || !Array.isArray(req.files.cover) || !req.files.cover[0]) {
        throw new ApiError(400, "Cover image is required.");
    }

    const avatarLocalPath = req.files.avatar[0].path;
    const coverLocalPath = req.files.cover[0].path;


    if(!avatarLocalPath) { // checking if avatar or cover image is not uploaded
        throw new ApiError(400, "Avatar images are required") // throw an error
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath) // uploading the avatar image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverLocalPath)  // if cover image is not uploaded, set it to null

    if(!avatar) { // checking if avatar or cover image is not uploaded to cloudinary
        throw new ApiError(400, "Avatar file is required") // throw an error
    }

   const user = await User.create({ // creating a new user in the database
        fullname,
        email,
        username,// converting username to lowercase to avoid case sensitivity issues
        password, // password will be hashed in the User model
        avatar: avatar.url, // setting the avatar url from cloudinary
        coverImage: coverImage?.url || "", // if cover image is not uploaded, set it to an empty string
    })

    const createdUser = await User.findById(user._id).select( // finding the created user by id and selecting the fields to return in the response
        "-password -refreshToken" // selecting all fields except password and refreshToken to return in the response
    )

    if(!createdUser) { // checking if user is created successfully
        throw new ApiError(500, "User not created, please try again") // if not, throw an error
    }

    return res.status(201).json( // returning the response with status code 201 (created)
        new ApiResponse(200, createdUser, "User created successfully") // creating a new ApiResponse object with status code, data and message
    )

} )

const loginUser = asyncHandler( async(req, res) => {
    // req body -> data
    //username or email
    //find the user by username or email
    //if user not found, throw error
    //compare password
    //if password does not match, throw error
    //if password matches, generate access token and refresh token 
    // send cookies


    const {username,email, password} = req.body // destructuring the body of the request

    if(!(username || email)) { // checking if username or email is provided
        throw new ApiError(400, "Username or email is required") // if not, throw an error
    }

    const user = await User.findOne({
        $or: [ // $or operator is used to find a document that matches at least one of the specified conditions
            {username}, // checking if username exists
            {email} // checking if email exists
        ]
    })
    if (!user) { // if user is not found
        throw new ApiError(404, "User not found") // throw an error
    }   

    const isPasswordMatched = await user.isPasswordMatched(password) // comparing the password with the hashed password in the database
    if (!isPasswordMatched) { // if password does not match
        throw new ApiError(401, "Invalid credentials") // throw an error
    }

    const generateAccessAndRefreshToken = async(userId)=>{ 
        try {
            const user = await User.findById(userId) //finding user id
            const accessToken = user.generateAccessToken() //generate tokens
            const refreshToken = user.generateRefreshToken()

            user.refreshToken = refreshToken //refreshtoken ko database me save kr diya
            await user.save({validateBeforeSave : false})

            return {accessToken, refreshToken}

        } catch (error) {
            throw new ApiError(500, "Error generating tokens") // if there is an error in generating tokens, throw an error
            
        }
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);


    const  loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const option = { //ye cookie sirf server se modify ho skti hai naki frontend se
        httpOnly: true,
        secure : true
    }


    return res.status(200).cookie("accessToken", accessToken, option ).cookie("refreshToken", refreshToken, option).json(
        new ApiResponse(200, {user: loggedInUser , accessToken , refreshToken}, "User logged in successfully") // returning the response with status code 200 (ok) and user data
    ) // setting the cookies in the response
})

const logoutUser = asyncHandler( async(req, res) => {
    // clear cookies
    // update user refresh token to null
    // return response

    await User.findByIdAndUpdate(
        req.user._id, // getting the user id from the request object 
        {
            $set:{ //set the refresh token to null
                refreshToken:undefined // setting the refresh token to undefined to clear it from the database
            }
        },
        {
            new: true 
        }
    )    

    const option = { //ye cookie sirf server se modify ho skti hai naki frontend se
        httpOnly: true,
        secure : true
    }

    return res.status(200).clearCookie("accessToken", option).clearCookie("refreshToken", option).json( // clearing the cookies by setting them to empty strings
        new ApiResponse(200, {}, "User logged out successfully") // returning the response with status code 200 (ok) and message
    )

})
const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshAccessToken // getting the refresh token from the cookies
    if(!incomingRefreshToken) { // checking if refresh token is not provided
        throw new ApiError(400, "Refresh token is required") // if not, throw an error
    }

    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401 ,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const option ={
            httpOnly:true,
            secure : true
        }
    
       const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
       return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshtoken",newRefreshToken,option)
       .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken : newRefreshToken},
            "Access token refreshed"
        )
       )
    } catch (error) {
        throw new ApiError(401, error?.message||"invalid refresh")
        
    }
})
export {registerUser,loginUser,logoutUser,refreshAccessToken}