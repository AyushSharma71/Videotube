import { Apierror } from "../utils/Apierror.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname } = req.body;

        if ([username, fullname, email, password].some((field) => 
            field?.trim() === ""
        )) {
            throw new Apierror(400, "All fields are required");
        }

        const existeduser = await User.findOne({
            $or: [{ username, email }]
        })

        if (existeduser) {
            throw new Apierror(403, "user already exists");
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullname,
            email,
            password: hashedpassword,
            username: username.trim().toLowerCase(),
        })

        if (!user) {
            throw new Apierror(400, "user is not created");
        }

        return res.status(200).json({ message: "user created successfully" });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}



export { registerUser };