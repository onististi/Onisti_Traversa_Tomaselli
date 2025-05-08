const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    last_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    code: {
        type: Number,
        required: true
    },
    last_updated: {
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