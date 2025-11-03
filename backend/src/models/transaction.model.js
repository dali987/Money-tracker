import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["expense", "transfer", "income"],
        required: true
    },
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "USD",
        required: true
    },
    note: {
        type: String,
        default: ""
    },
    tags: {
        type: [{ type: String }],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction