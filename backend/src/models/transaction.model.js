import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
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
        required: true,
    },
    note: {
        type: String,
        default: '',
        maxlength: 200,
    },
    tags: {
        type: [{ type: String, maxlength: 20 }],
        default: [],
    },

    date: {
        type: Date,
        default: Date.now,
    },
});

transactionSchema.pre('validate', function (next) {
    if (!this.fromAccount && !this.toAccount) {
        return next(new Error('Transaction must have either from account  or to account.'));
    }
    next();
});

transactionSchema.index({ fromAccount: 1, date: -1 });
transactionSchema.index({ toAccount: 1, date: -1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
