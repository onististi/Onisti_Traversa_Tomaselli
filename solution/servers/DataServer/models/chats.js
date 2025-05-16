const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    title: {
        type: String,
        required: function() {
            return this.type === 'movie';
        }
    },
    name: {
        type: String,
        required: function() {
            return this.type === 'actor';
        }
    },
    code: {
        type: Number,
        required: true,
    },
    last_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
});

chatSchema.pre('save', function(next) {
    this.last_updated = Date.now();
    next();
});

const Chat = mongoose.model('chats', chatSchema);

module.exports = Chat;