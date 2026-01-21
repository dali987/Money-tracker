import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tag: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
    period: {
        type: String,
        enum: ['monthly'], // We can expand this later
        default: 'monthly',
    },
    alertThreshold: {
        type: Number,
        default: 80, // Percentage
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure unique budget per tag per user
budgetSchema.index({ userId: 1, tag: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
