const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rotten_tomatoes_link: String,
    movieId: {
        type: String,
        required: true,
        index: true
    },

    // Informazioni sull'autore
    critic_name: String,
    author: String,
    top_critic: {
        type: Boolean,
        default: false
    },
    publisher_name: String,
    role: {
        type: String,
        enum: ['user', 'journalist', 'master'],
        default: 'user'
    },

    // Contenuto della recensione
    review_type: {
        type: String,
        enum: ['Fresh', 'Rotten', 'User'],
        default: 'User'
    },
    review_score: Number,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review_content: String,
    content: String,

    // Timestamp
    review_date: Date,
    date: {
        type: Date,
        default: Date.now
    },
    updated: Date,

    // Flag per indicare la fonte
    isImported: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indici per migliorare le performance delle query
reviewSchema.index({ movieId: 1, date: -1 });
reviewSchema.index({ author: 1 });
reviewSchema.index({ critic_name: 1 });

module.exports = mongoose.model('Review', reviewSchema);