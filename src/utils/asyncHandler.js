// promise wla


// const asyncHandler = (requestHandler) => {
//     (req,res,next) => {
//         Promise.resolve(requestHandler(req,res,next)).
//         catch((error) => next(error))
//     }
// }

// export {asyncHandler}


// try catch wla

// steps 
// const asyncHandler=() =>{}
//  const asyncHandler=(func) =>{()=> {} }
// const asyncHandler=(func) =>()=> {} 
// const asyncHandler=(func) => async ()=> {} 


const asyncHandler = (requestHandler) => async (req,res,next) => {
    try {
        await requestHandler(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success : false,//flag
            message : error.message
        })
    }
} //using higher order function