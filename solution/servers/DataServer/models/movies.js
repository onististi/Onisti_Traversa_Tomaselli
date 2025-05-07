const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    last_message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

movieSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;