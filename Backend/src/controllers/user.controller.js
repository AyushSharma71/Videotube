import { Apierror } from "../utils/Apierror.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import cookieparser from "cookie-parser";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true,
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
        if (decodedpassword) {
            const accesstoken = jwt.sign(
                {
                    id: userexists._id,
                    fullname: userexists.fullname,
                    username: userexists.username
                }, process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                }
            )
            const refreshtoken = jwt.sign(
                {
                    id: userexists._id
                }, process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                }
            )
            userexists.refreshToken = refreshtoken;
            await userexists.save({ validateBeforeSave: false });


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

const logoutUser = async (req, res) => {
    try {
        const userid = req.user.id;

        if (!userid) {
            throw new Apierror(403, "unauthorized user");
        }
        
        const user = await User.findByIdAndUpdate(userid,
            {
                $unset:{refreshToken:1}
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
export {
    registerUser,
    loginUser,
    logoutUser
};
