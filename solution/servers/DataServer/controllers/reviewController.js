const Review = require('../models/Review');
const axios = require('axios'); // Importa Axios

exports.getReviewsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!movieId) {
            return res.status(400).json({ message: "Movie ID not specified" });
        }

        console.log(`Finding reviews for movie ID: ${movieId}`);

        // Recupera il titolo del film dal JavaServer
        const cleanMovieId = movieId.replace(/^:/, ""); // Rimuove il prefisso ":"
        const movieResponse = await axios.get(`http://localhost:8080/api/movies/${cleanMovieId}`);
        const movieTitle = movieResponse.data.name;

        console.log(`Searching reviews for movie title: ${movieTitle} and movie ID: ${movieId}`);

        // Cerca recensioni nel database MongoDB sia per titolo che per ID
        const reviews = await Review.find({
            $or: [
                { movieId: movieId.replace(":", "") },
                { movie_title: movieTitle }
            ]
        })
            .select('movieId movie_title author role rating content createdAt updatedAt')
            .sort({ createdAt : -1 })
            .limit(50);

        if (!reviews || reviews.length === 0) {
            console.log(`No reviews found for movie title: ${movieTitle} or movie ID: ${movieId}`);
            return res.status(404).json({ message: "No reviews found for this movie" });
        }

        // Normalizza le recensioni
        const normalizedReviews = reviews.map(review => ({
            _id: review._id,
            movie_title: review.movie_title,
            movieId: review.movieId,
            author: review.author,
            role: review.role ||  "user",
            rating: review.rating,
            content: review.content,
            date: review.createdAt,
        }));

        console.log(`Found ${normalizedReviews.length} reviews for movie ${movieTitle} (${movieId})`);
        return res.status(200).json(normalizedReviews);

    } catch (error) {
        console.error("Error retrieving reviews:", error);
        return res.status(500).json({ message: "Error retrieving reviews", error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { movieId, author, role, rating, content } = req.body;

        console.log('New review data received:', req.body);

        if (!movieId) {
            return res.status(400).json({ message: "Movie ID is required" });
        }
        if (!author) {
            return res.status(400).json({ message: "Author name is required" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Review content is required" });
        }

        // Validazione ruolo
        const validRoles = ['user', 'journalist', 'master'];
        const userRole = validRoles.includes(role) ? role : 'user';

        // Crea una nuova recensione
        const newReview = new Review({
            movieId: movieId.replace(":", ""), // Remove any colon prefix if present
            author,
            role: userRole,
            rating: parseInt(rating, 10),
            content,
            isImported: false
        });

        // Salva recensione nel db
        const savedReview = await newReview.save();

        console.log('Review saved successfully:', savedReview._id);

        const io = req.app.get('io');
        if (io) {
            io.emit('new-review', {
                movieId: savedReview.movieId,
                reviewId: savedReview._id,
                author: savedReview.author,
                timestamp: new Date()
            });
        }

        return res.status(201).json(savedReview);
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Error adding review", error: error.message });
    }
};


// Aggiorna una recensione esistente
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, content, user } = req.body;

        console.log(`Attempting to update review ${reviewId}:`, req.body);

        if (!reviewId) {
            return res.status(400).json({ message: "Review ID not specified" });
        }

        // Find the review
        const review = await Review.findById(reviewId);

        if (!review) {
            console.log(`Review with ID ${reviewId} not found`);
            return res.status(404).json({ message: "Review not found" });
        }

        if (!user) {
            return res.status(401).json({ message: "User information missing" });
        }

        if (review.author !== user.username && user.role !== 'admin') {
            console.log(`Access denied: ${user.username} is not authorized to modify ${review.author}'s review`);
            return res.status(403).json({ message: "You are not authorized to modify this review" });
        }

        // Aggiorna i campi
        if (rating !== undefined) {
            const ratingNum = parseInt(rating, 10);
            if (ratingNum >= 1 && ratingNum <= 5) {
                review.rating = ratingNum;
            } else {
                return res.status(400).json({ message: "Invalid rating (must be between 1 and 5)" });
            }
        }

        if (content !== undefined && content.trim() !== '') {
            review.content = content;
        } else if (content !== undefined) {
            return res.status(400).json({ message: "Review content cannot be empty" });
        }

        review.updated = new Date();

        // Salva la recensione modificata
        const updatedReview = await review.save();

        console.log(`Review ${reviewId} updated successfully`);

        const io = req.app.get('io');
        if (io) {
            io.emit('update-review', {
                movieId: review.movieId,
                reviewId: updatedReview._id,
                author: review.author,
                timestamp: new Date()
            });
        }

        return res.status(200).json(updatedReview);
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ message: "Error updating review", error: error.message });
    }
};

//Elimina una recensione
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { user } = req.body;  // Get user info from request body

        console.log(`Attempting to delete review ${reviewId}`);

        if (!reviewId) {
            return res.status(400).json({ message: "Review ID not specified" });
        }

        // Trova la recensione
        const review = await Review.findById(reviewId);

        if (!review) {
            console.log(`Review with ID ${reviewId} not found`);
            return res.status(404).json({ message: "Review not found" });
        }

        if (!user) {
            return res.status(401).json({ message: "User information missing" });
        }

        if (review.author !== user.username && user.role !== 'admin') {
            console.log(`Access denied: ${user.username} is not authorized to delete ${review.author}'s review`);
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }

        const movieId = review.movieId;

        // Cancella la recensione
        await Review.findByIdAndDelete(reviewId);

        console.log(`Review ${reviewId} deleted successfully`);

        const io = req.app.get('io');
        if (io) {
            io.emit('delete-review', {
                movieId,
                reviewId,
                timestamp: new Date()
            });
        }

        return res.status(200).json({ message: "Review deleted successfully", reviewId });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Error deleting review", error: error.message });
    }
};