class ApiError extends Error {
    constructor( // craeting constructor...it takes four parameters

        statusCode,  //HTTP status code (jaise 404, 500, etc.)
        message = "Something went wrong", // Error ka message (agar na do to "Something went wrong" default hai)
        errors =[], //Ek array jisme multiple error details ho sakti hain
        stack ="" //Error trace yaani error kis jagah pe aaya uski details...debugging ke liye

        
    ){
        super(message) //super() se parent class (Error) ka constructor call hota hai, jisse message set hota hai
        this.statusCode = statusCode
        this.data = null
        this.message= message
        this.success = false;
        this.errors = this.errors

        if(stack){
            this.stack = stack 
        }
        else{
            Error.captureStackTrace(this,this.constructor) //JavaScript ka built-in method captureStackTrace use karke automatic trace generate karte hain — jisse pata chale error kahan hua.
        }
    }
}

export {ApiError}