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
// http://localhost:5000/api/v1/video/publish-video
app.use("/api/v1/video",videoRouter);

import subscriptionRouter from "./routers/subscription.routers.js"
// http://localhost:5000/api/v1/subscription/subscribe
app.use("/api/v1/subscription",subscriptionRouter);

import commentRouter from "./routers/comment.routers.js"
// http://localhost:5000/api/v1/comment/getcomments
app.use("/api/v1/comment",commentRouter)

import tweetRouter from "./routers/tweet.routers.js"
// http://localhost:5000/api/v1/tweets/createtweet
app.use("/api/v1/tweets",tweetRouter)

import healthcheckRouter from "./routers/healthcheck.routers.js"
// http://localhost:5000/api/v1/health/check-health
app.use("/api/v1/health",healthcheckRouter)

import likeRouter from "./routers/like.routers.js"
// http://localhost:5000/api/v1/like/video-like/:videoId
app.use("/api/v1/like",likeRouter)

import playlistRouter from "./routers/playlist.routers.js"
// http://localhost:5000/api/v1/playlist/create-playlist
app.use("/api/v1/playlist",playlistRouter)

import dashboardRouter from "./routers/dashboard.routers.js"
// http://localhost:5000/api/v1/dashboard/get-dashboard
app.use("/api/v1/dashboard",dashboardRouter)


export { app };