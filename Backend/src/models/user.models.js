import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String,
    },
    coverimage: {
        type: String,
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true });


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    return this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    await jwt.sign(
        {
            id: this._id,
            fullname: this.fullname,
            username: this.username
        }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function (){
    await jwt.sign(
        {
            id:this._id
        },process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model("User", userSchema);
export default User;