import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,

    },
    profilePicture:{
        type:String,
        default: "https://imgs.search.brave.com/NhhUANTb1-Z7f1mpL3WaIFmPCbxcaor1TuRdzIgRsNE/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2RkL2Yw/LzExL2RkZjAxMTBh/YTE5ZjQ0NTY4N2I3/Mzc2NzllZWM5Y2Iy/LmpwZw"
    }

},{
    timestamps: true
})

const User = mongoose.model("User", userSchema)

export default User