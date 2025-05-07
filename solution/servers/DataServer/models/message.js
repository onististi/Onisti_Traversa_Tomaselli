const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    film_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

messageSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;