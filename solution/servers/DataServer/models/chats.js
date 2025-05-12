const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['movie', 'actor'],
        required: true
    },
    title: {
        type: String,
        required: function () {
            return this.type === 'movie';
        }
    },
    name: {
        type: String,
        required: function () {
            return this.type === 'person';
        }
    },
    code: {
        type: Number,
        required: true
    },
    last_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
});

chatSchema.pre('save', function (next) {
    this.last_updated = Date.now(); // Corretto anche il campo
    next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
