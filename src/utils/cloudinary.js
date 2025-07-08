import {v2 as cloudinary} from "cloudinary" //cloudinary is a cloud-based service that provides a solution for managing images and videos in web and mobile applications.
import {fs} from "fs" //file system,it deals with reading and writing files





// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        // file has been uploaded successfully
        console.log("File uploaded successfully to Cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null; // return null if the upload operation failed
    }
}

export {uploadOnCloudinary}