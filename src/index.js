// require('dotenv').config({path: './env'})  ye require aur import do alag alag ye code ke consistency ko khrb kr rha.

import app from "./app.js";
import connectDB from "./database/index.js";

import dotenv from "dotenv"
dotenv.config({
    path : './env'
})




connectDB()
// after the promise is resolved, the server will start listening on the specified port
// this is a good practice to ensure that the server only starts after the database connection is established
.then( ()=> {
    app.listen(process.env.PORT  || 8000, () => {
        console.log(`Server is running on port :${process.env.PORT || 8000}`);
    })
})
.catch((error) => {
    console.error("Database connection failed:", error);
});




















/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express"
const app = express()


// IIFE is Immediately Invoked Function Expression
// This is used to run the code immediately after it is defined.

// an async IIFE with try...catch in a database connection (e.g., MongoDB with Mongoose or PostgreSQL with pg) 
// is a modern, safe, and clean way to establish and handle your database connection logic.
// It lets you connect to the database as soon as the app starts, without needing to define a separate function and call it later.
// You can catch any connection errors gracefully and avoid crashing the app unexpectedly.
// Most DB libraries return Promises, so you need to use await. Since await can only be used inside an async function, the IIFE allows that at the top level.

;( async ()=>{ 
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // app.on is used to handle custom events...great for logging, monitoring or triggering follow up
        // actions after DB connection event
        // it is in express but not used for handling HTTP request
        app.on("ERROR",(error) => {
            console.log("ERROR",error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch(error){
        console.error("ERROR :",error)
        throw error
    }
})()
*/























