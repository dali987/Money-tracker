import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 30,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    group: {
        type: String,
        required: true,
        maxlength: 20,
    },

    balance: {
        type: Number,
        default: 0,
    },
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
