import { Apierror } from "../utils/Apierror.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import cookieparser from "cookie-parser";
import jwt from "jsonwebtoken";
import { uploadImage } from "../utils/cloudinary.js";

const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessTokenAndRefreshToken = async function (userid){
    try {
        const user =await User.findById(userid)
        const refreshtoken = await user.generateRefreshToken();
        const accesstoken = await user.generateAccessToken();
        user.refreshToken = refreshtoken;
        await user.save({validateBeforeSave:false});
    
        return {accesstoken,refreshtoken};
    } catch (error) {
        throw new Apierror(error.statuscode,error.message);
    }
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname } = req.body;

        if ([username, fullname, email, password].some((field) =>
            field?.trim() === ""
        )) {
            throw new Apierror(400, "All fields are required");
        }

        const existeduser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existeduser) {
            throw new Apierror(403, "user already exists");
        }

        const createduser = await User.create({
            fullname,
            email,
            password,
            username: username.trim().toLowerCase(),
        })

        if (!createduser) {
            throw new Apierror(400, "user is not created");
        }

        return res.status(200).json({ message: "user created successfully" });
    }
    catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const loginUser = async (req, res) => {

    try {
        const { username, password } = req.body;

        const userexists = await User.findOne({ username: username.trim().toLowerCase() });


        if (!userexists) {
            throw new Apierror(400, "user does not exist");
        }

        const decodedpassword = await userexists.isPasswordCorrect(password);

        if (!decodedpassword) {
            throw new Apierror(403, "Invalid credentials");
        }
        // if (decodedpassword) {
        //     const accesstoken = jwt.sign(
        //         {
        //             id: userexists._id,
        //             fullname: userexists.fullname,
        //             username: userexists.username
        //         }, process.env.ACCESS_TOKEN_SECRET,
        //         {
        //             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        //         }
        //     )
        //     const refreshtoken = jwt.sign(
        //         {
        //             id: userexists._id
        //         }, process.env.REFRESH_TOKEN_SECRET,
        //         {
        //             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        //         }
        //     )
        //     userexists.refreshToken = refreshtoken;
        //     await userexists.save({ validateBeforeSave: false });
            if(decodedpassword){
                const {accesstoken,refreshtoken} = await generateAccessTokenAndRefreshToken(userexists?._id);

            res
                .cookie("refreshtoken", refreshtoken, options)
                .cookie("accesstoken", accesstoken, options);

            return res.status(200).json({
                message: "Login successful",
                accesstoken
            })
        }
    } catch (error) {
        res.status(error.statuscode || 500)
            .json({ message: error.message || "Internal server error" })
    }
}

const matchrefreshtoken = async (req,res) =>{
    /**
     * first collect the token from cookies.
     * decode the token ->if not same ->logout user
     * database ke refreshtoken se compare kro
     * same ->new accesstoken create kro 
     */

    try {
        const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken;
    
        const decodedToken = await jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
        
        if(!incomingrefreshtoken){
            throw new Apierror(401,"unauthorized");
        }
        const user = await User.findById(decodedToken?.id)
    
        if(incomingrefreshtoken !== user.refreshToken){
            throw new Apierror(401,"Invalid refresh token");
        }
    
        const {refreshtoken: newrefreshtoken,accesstoken}=await generateAccessTokenAndRefreshToken(user?._id);
        
        user.refreshToken = newrefreshtoken;
        await user.save({validateBeforeSave:false})
    
        res.cookie("accesstoken",accesstoken,options)
           .cookie("refreshtoken",newrefreshtoken,options);
    
        return res.status(200).json({
            accesstoken,
        })
    } catch (error) {
       res.status(error.statuscode || 500).json({
        message:error.message || "internal server error"
       })
    }
}

const logoutUser = async (req, res) => {
    try {
        const userid = req.user.id;

        if (!userid) {
            throw new Apierror(403, "unauthorized user");
        }
        
        const user = await User.findByIdAndUpdate(userid,
            {
                $unset:{refreshToken:true}
            },
            {new:true},
        )
        await user.save({validateBeforeSave:false});

        res.clearCookie("accesstoken",options)
            .clearCookie("refreshtoken",options);
    
            
        return res.status(200).json({message: "logout successfully"});
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message:error.message || "internal server error"
        })
    }
}

const uploadfile = async (req, res) =>{
    try {
        const userid = req.user?.id;
    
        const avatarLocalpath = req.file?.path || req.files?.avatar?.[0]?.path;
    
        if(!avatarLocalpath){
            throw new Apierror(400,"avatar is required");
        }
    
        const avatar = await uploadImage(avatarLocalpath);
    
        const avatarurl = avatar?.secure_url ||avatar?.url ||avatar;
    
        const coverimagepath= req.file?.path || req.files?.coverimage?.[0]?.path;
    
        if(!coverimagepath){
            throw new Apierror(400,"coverimage path is required");
        }
    
        const coverimage = await uploadImage(coverimagepath);
    
        const coverimageurl = coverimage?.secure_url || coverimage?.url ||coverimage;
    
        const updateduser = await User.findByIdAndUpdate(userid,
            {
                avatar:avatarurl,
                coverimage:coverimageurl
            },
            {new:true,runValidators:true}
        )
    
        const user = await User.findById(userid).select("-password -refreshToken")
    
        return res.status(200).json({
            message:"files are uploaded successfully",
            user,
        })
    } catch (error) {
        throw new Apierror(500,"internal server in file uploading");
    }
}


export {
    registerUser,
    loginUser,
    logoutUser,
    uploadfile,
    matchrefreshtoken
};
