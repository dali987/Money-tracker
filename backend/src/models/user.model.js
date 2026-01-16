import mongoose from 'mongoose';

/**
 * User schema for the money tracker application.
 *
 * Note: Better Auth manages authentication fields (email, password, sessions).
 * This model extends the user with application-specific fields.
 *
 * Better Auth will create its own 'user' collection with auth fields,
 * and we use additionalFields in the auth config to store these custom fields.
 */
const userSchema = new mongoose.Schema(
    {
        // Core fields managed by Better Auth
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

        // Application-specific fields (configured in Better Auth additionalFields)
        username: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allow null/undefined values to not conflict
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
        // Use 'user' collection to match Better Auth's default
        collection: 'user',
    }
);

// Index for efficient lookups (email already has unique: true in schema)
userSchema.index({ username: 1 });

const User = mongoose.model('User', userSchema);

export default User;
