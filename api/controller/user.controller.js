import bcrypt from 'bcrypt'
import User from '../models/user.model.js'
import { errorHandler } from '../utils/errorHandler.js'
export const getContacts =  (req,res)=>{
    res.json({message:"API is working"})
}


export const updateUser = async (req, res, next) => {
    console.log(req.user, req.params.id)
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can update only your account!'));
    }
    try{
        if(req.body.password){
            req.body.password = await bcrypt.hash(req.body.password, 10)
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                profilePicture: req.body.profilePicture,
            }
        },{new:true})
        const {password:hashedPassword, ...rest} = updatedUser._doc
        res.status(200).json(rest)

    }catch(err){
        next(err)
    }
}

export const deleteUser = async (req, res, next) => {
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can update only your account!'));
    }
    try{
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json('User has been deleted.')
    }catch(err){
        next(err)
    }
}

export const signout = async (req, res) => {
    res.clearCookie('access_token').status(200).json('Signout success')
}