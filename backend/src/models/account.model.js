import mongoose from "mongoose"

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["Cash", "Bank", "Credit"],
        required: true
    },
    currency: {
        type: String,
        default: "USD"
    },
    balance: {
        type: Number,
        default: 0
    }
})

const Account = mongoose.model("Account", accountSchema)

export default Account