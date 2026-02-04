import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            default: '',
        },

        username: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
        },
        currencies: {
            type: [String],
            default: ['EUR'],
        },
        baseCurrency: {
            type: String,
            default: 'USD',
        },
        groups: {
            type: [{ type: String, maxlength: 20 }],
            default: ['Cash', 'Bank', 'Credit'],
        },
        tags: {
            type: [{ type: String, maxlength: 20 }],
            default: [
                'Groceries',
                'Restaurant',
                'Rent',
                'Tax',
                'Health',
                'Clothes',
                'Transport',
                'Entertainment',
                'Salary',
                'Random',
                'Stationery',
                'Utilities',
                'Others',
            ],
        },
        profilePic: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
        collection: 'user',
    }
);
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

export default User;
