import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import groupRouter from "./routes/group.route.js"
import cors from 'cors'
import cookieParser from "cookie-parser"
dotenv.config()

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}


mongoose.connect(process.env.MONGO).then(()=>{
    console.log("Connected to database")
})
.catch((err)=>{
    console.log(err)
})
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions)) 

app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/groups", groupRouter)
app.use((err, req, res, next)=>{
    const statusCode = res.statusCode || 500
    const message = err.message || "Internal server error"

    return res.status(statusCode).json({
        success:false,
        error:message,
        statusCode:statusCode
    })
})
app.listen(3000, ()=>{
    console.log("Server listening on port 3000!")
})