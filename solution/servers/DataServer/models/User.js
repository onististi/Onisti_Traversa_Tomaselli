const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'journalist', 'master'],
        default: 'user'
    },
    requestStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    motivation: String, // Nuovo campo per salvare la motivazione
    rejectionReason: String,
    rejectedAt: Date,
    requestHistory: [{
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected']
        },
        motivation: String,
        date: Date,
        decision: {
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            at: Date,
            reason: String
        }
    }],
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date }
}, {
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);