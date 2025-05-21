const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rotten_tomatoes_link: String,
    movieId: {
        type: String,
        required: true,
        index: true
    },
    movie_title: {
        type: String,
        required: false,
        index: true
    },

    // Informazioni sull'autore
    author: String,

    role: {
        type: String,
        enum: ['user', 'journalist', 'master'],
        default: 'user'
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    content: String,

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