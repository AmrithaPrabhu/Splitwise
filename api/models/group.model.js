import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    desc: { type: String, required: true },
    amount: { type: [],required: true }, 
});

const groupSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: {
        type: [String],  
        required: true
    },
    transactions: {
        type: {}, 
    },
    settlements: {
        type: [],
    }
}, {
    timeStamps : true
})

const Group = mongoose.model("Group", groupSchema)

export default Group
