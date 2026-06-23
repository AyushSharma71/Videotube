import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());


import userRouter from "./routers/user.routers.js";
// http://localhost:5000/api/v1/user/register
app.use("/api/v1/user", userRouter);
import videoRouter from "./routers/video.routers.js";
// http://localhost:5000/api/v1/user/publish-video
app.use("/api/v1/video",videoRouter);

export { app };