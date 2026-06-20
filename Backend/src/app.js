import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import userRouter from "./routers/router.routes.js";


// http://localhost:5000/api/v1/user/register
app.use("/api/v1/user", userRouter);


export { app };