import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js" // Importing the User model to interact with the user data in the database
import {uploadOnCloudinary} from "../utils/cloudinary.js" // Importing a utility function to handle file uploads to Cloudinary
import { ApiResponse } from "../utils/ApiResponse.js"

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
    console.log("email",email);

    if(
        [fullname, email, username, password].some((field) => //some() method checks if at least one element in the array passes the test implemented by the provided function.
        field?.trim()==="") // checking if any of the fields are empty
    ) {
        throw new ApiError(400, "All fields are required") // if any field is empty, throw an error
    }
    if(!email.includes("@")){ // checking if email is valid
        throw new ApiError(400, "Email is not valid") // if email is not valid, throw an error
    }

    const existedUser = User.findOne({
        $or: [ // $or operator is used to find a document that matches at least one of the specified conditions
            {email}, // checking if email already exists
            {username} // checking if username already exists
        ]
    })

    if (existedUser) { // if user already exists
        throw new ApiError(409, "User already exists with this email or username") // throw an error
    }

    const avatarLocalPath= req.files?.avatar[0]?.path; // getting the path of the avatar image from the request files
    const coverLocalPath= req.files?.cover[0]?.path; // getting the path of the cover image from the request files

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
        username : username.toLowerCase(), // converting username to lowercase to avoid case sensitivity issues
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

export {registerUser}