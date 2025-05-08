const express = require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router();

router.get('/movie/:movieId', reviewController.getReviewsByMovie);
router.post('/', reviewController.addReview);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
