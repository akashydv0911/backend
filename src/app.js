import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Allow all origins req by default, or specify a specific origin
    credentials: true
}))

app.use(express.json({limit:"16kb"}))// json data jo frontend se aaega usko backend(server) ke liye readable banata hai
app.use(exprees.urlencoded({extended:true,limit : "16kb"}))// form data(HTML) ko read krne ke liye
app.use(express.static("public"))//server se static files(images...) jo public file hai yha wo user ko directly serve krta hai
app.use(cookieParser()) //server se user ka browser uske andar ki cookies ko access kr pau aur uski cookies setkr pau
export default app;