import Group from "../models/group.model.js";
import { errorHandler } from '../utils/errorHandler.js'
import { splitwise } from "../../testing_splitwise_algo/splitwise_algo.js"
export const getGroups = async (req, res, next) => {
    // console.log(req.user.id, req.params.id)
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can add groups only your account!'));
    }
    const user_id = req.user.id
    try{
        const groups = await Group.find({user_id})
        res.status(200).json(groups)
    }catch(err){
        next(err)
    }
}

export const createGroup = async (req, res, next) => {
    if(req.user.id !== req.params.id){
        return next(errorHandler(401, 'You can add groups only your account!'));
    }
    const { user_id, name, members } = req.body
    if (!user_id || !name || !Array.isArray(members) || members.length === 0) {
        return next(errorHandler(400, 'All fields are mandatory'))
    }
    try{
        const group = await Group.create({user_id, name, members})
        res.status(201).json(group)
    }catch(err){
        next(err)
    }
}

export const getGroupMembers = async (req, res, next) => {

    try{
        const group = await Group.findById(req.params.id)
        const {members,transactions, ...rest} = group._doc
        res.status(200).json([members, transactions])

    }catch(err){
        return next(errorHandler(401, "Something went wrong in fetching the group members"))
    }
}
export const editExpense = async (req, res, next) => {
    const {formData, desc, editExpenseForm} = req.body
    console.log("in edit expense - ", formData, desc, editExpenseForm)
    try{
        let trans = {}
        const group = await Group.findById(req.params.id)
            if (!group) {
                return next(errorHandler(404, "Group not found"));
        }
        if(editExpenseForm !== desc){
            if(group._doc.transactions && group._doc.transactions[desc]){
                delete group._doc.transactions[desc]
                await group.save()
                trans = {...group._doc.transactions, [editExpenseForm] : formData}
            }
            
        }else{
            group._doc.transactions[desc] = formData
            trans = {...group._doc.transactions}
        }
        console.log("trans update - ", trans)
        let updatedTransactions = []
        for(const key of Object.keys(trans)){
            console.log(trans[key], trans[key].length)
            for(const element of trans[key]){
                updatedTransactions.push(element)
            }
        }
        console.log(updatedTransactions)
        const transactionRecords = splitwise(updatedTransactions, group._doc.members)
        const transactionRecordsArray = [...transactionRecords];
        console.log(transactionRecordsArray)
        const updateGroup = await Group.findByIdAndUpdate(req.params.id, {
            $set: {
                transactions : trans,
                settlements : transactionRecordsArray
            },
        }, { new:true })
        console.log(updateGroup._doc, Object.keys(updateGroup._doc.transactions))
        res.status(200).json(transactionRecordsArray)
    }catch(err){
        return next(errorHandler(401, "Error while updating the expense"))
    }

}
export const addExpense = async (req, res, next) => {
    const {formData, desc} = req.body
    try{
        const group = await Group.findById(req.params.id)
        if (!group) {
            return next(errorHandler(404, "Group not found"));
        }
        const {members,transactions, ...rest} = group._doc
        let trans =   {...transactions, [desc] : formData}
        let updatedTransactions = []
        for(const key of Object.keys(trans)){
            for(const element of trans[key]){
                updatedTransactions.push(element)
            }
        }
        const transactionRecords = splitwise(updatedTransactions, members)
        const transactionRecordsArray = [...transactionRecords];
        const updateGroup = await Group.findByIdAndUpdate(req.params.id, {
            $set: {
                user_id : rest.user_id,
                name: rest.name,
                members : members,
                transactions : trans,
                settlements : transactionRecordsArray
            },
        }, { new:true })
        res.status(200).json(transactionRecordsArray)        
    }catch(err){
        return next(errorHandler(401, "Something went wrong"))
    }
}

export const getSettlements = async (req, res, next) => {
    try{
        const group = await Group.findById(req.params.id)
        const {settlements, ...rest} = group._doc
        res.status(200).json(settlements)

    }catch(err){
        return next(errorHandler(401, "Something went wrong in fetching the settlements"))
    }
}

export const deleteTransaction = async (req, res, next) => {
    const {key} = req.body
    try{
        const group = await Group.findById(req.params.id)
        if(group._doc.transactions && group._doc.transactions[key]){
            delete group._doc.transactions[key]
            await group.save()
            let updatedTransactions = []
            for(const k of Object.keys(group._doc.transactions)){
                //console.log(trans[key], trans[key].length)
                for(const element of group._doc.transactions[k]){
                    updatedTransactions.push(element)
                }
        }

        console.log(updatedTransactions)
        const transactionRecords = splitwise(updatedTransactions, group._doc.members)
        const transactionRecordsArray = [...transactionRecords]
        console.log("before update ", group._doc.transactions)
        const updateGroup = await Group.findByIdAndUpdate(req.params.id, {
            $set: {
                transactions: group._doc.transactions,
                settlements : transactionRecordsArray
            },
        }, { new:true })

        console.log("updated ", updateGroup._doc.transactions)
            res.status(200).json({ message: "Transaction deleted successfully" });
        }else {
            return next(errorHandler(404, "Transaction not found"));
        }
        //res.status(200).json("Received successfully")
    }catch(err){
        return next(errorHandler(403, "Error deleting transaction"))
    }
}

export const addNewMember = async (req, res, next) => {
    const {newMember} = req.body
    try{
        const group = await Group.findById(req.params.id)
        const {members, ...rest} = group._doc
        const newMembers = [...members, newMember]
        const updateGroup = await Group.findByIdAndUpdate(req.params.id,{
            $set: {
                members: newMembers
            },
        }, {new:true})
        console.log(updateGroup._doc.members)
        res.status(201).json({message: "Added new member"})
    }catch(err){
        return next(errorHandler(401, "Unable to add new member"))
    }
}

export const deleteGroup = async (req, res, next) => {
    try{
        await Group.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Group has been deleted"})
    }catch(err){
        return next(errorHandler(404, "Group not found"))
    }
}