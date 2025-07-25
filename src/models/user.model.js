import mongoose , {Schema} from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username :{
        type: String,
        required : true,
        unique: true,
        lowercase : true,
        trim : true,
        index : true
    },
    email:{
        type: String,
        required : true,
        unique: true,
        lowercase : true,
        trim : true,
    },
    fullname :{
        type: String,
        required : true,
        trim : true,
        index : true
    },
    avatar:{
        type: String, //cloudinary url
        required : true,
    },
    coverImage:{
        type: String, //cloudinary url
    },
    watchHistory :[
        {
            type: Schema.Types.ObjectId,
            ref : "Video",
        }
    ],
    password : {
        type: String,
        required :[true,'password is required']
    },
    refreshToken : {
        type: String
    }
},{timestamps: true})
//When you define a schema, you can pass { timestamps: true } as an option. This automatically adds two fields to every document:

// createdAt – the date and time when the document was first created

// updatedAt – the date and time when the document was last updated


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()//next middleware
}) //jab v data save hone jae just use phle password encrypt ho

// custom method in the middleware

userSchema.methods.isPasswordMatched = async function(password) {

    return await bcrypt.compare(password,this.password) //encrypted password compare hoga user jab dubara login krega tab
    
}

// Access Token ek digital key ya pass hota hai jo prove 
// karta hai ki user authenticated (yaani verify ho chuka hai) hai.

// Yeh JWT (JSON Web Token) format mein hota hai aur 
// jab user login karta hai tab banaya jata hai.

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullname: this.fullname


    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

// Refresh Token ek special type ka token hota hai jo aapko naya 
// access token generate karne ke liye diya jata hai jab purana access token expire ho jata hai.

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id


    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const User = mongoose.model("User",userSchema)
// mogoDB me jaake user plural ho jaega aur lowecase me ho jaega-users