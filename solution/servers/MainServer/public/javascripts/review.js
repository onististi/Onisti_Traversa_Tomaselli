document.addEventListener('DOMContentLoaded', function() {
    initializeReviewSystem();
    calculateAndDisplayAverageRating();

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function() {
            setTimeout(() => {
                calculateAndDisplayAverageRating();
            }, 100);
        });
    }

    checkEmptyColumns();
});

// Inizializzazione del sistema di recensioni
function initializeReviewSystem() {
    const reviewsContainer = document.getElementById('reviewsContainer');

    // Configurazione dei listener per le recensioni
    if (reviewsContainer) {
        reviewsContainer.addEventListener('click', function(e) {
            const reviewItem = e.target.closest('.review-item');
            if (e.target.closest('.review-actions')) return;

            if (reviewItem) {
                const reviewId = reviewItem.dataset.reviewId;
                const author = reviewItem.querySelector('.review-author').textContent;
                const content = reviewItem.querySelector('.review-content p').textContent;
                const date = reviewItem.querySelector('.review-date').textContent;
                const isAuthor = reviewItem.dataset.isAuthor === 'true';
                const rating = parseInt(reviewItem.dataset.rating, 10);
                const role = reviewItem.querySelector('.review-role').textContent;

                openReviewPopup(reviewId, author, content, date, isAuthor, rating, role);
            }
        });
    }

    setupRatingSystem();
    setupPopupListeners();
}

// Sistema di rating visivo
function setupRatingSystem() {
    document.querySelectorAll('.rating-input input').forEach(input => {
        input.addEventListener('change', function() {
            highlightStars(this.value);
        });
    });
}

function highlightStars(rating) {
    document.querySelectorAll('.rating-input label').forEach((label, index) => {
        label.classList.toggle('active', (5 - index) <= rating);
    });
}

// Gestione popup
function setupPopupListeners() {
    window.addEventListener('click', function(e) {
        if (e.target.matches('#reviewPopup, #editReviewPopup')) {
            closeReviewPopup();
            closeEditPopup();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeReviewPopup();
            closeEditPopup();
        }
    });
}

// Funzioni per i popup delle recensioni
function openReviewPopup(reviewId, author, content, date, isAuthor, rating, role) {
    const popup = document.getElementById('reviewPopup');
    popup.querySelector('#popupAuthor').innerHTML = `
        <span>${author}</span>
        <span class="review-role ${role.toLowerCase()}">${role}</span>
        <div class="review-rating">${generateStarRating(rating)}</div>
    `;
    popup.querySelector('#popupContent').textContent = content;
    popup.querySelector('#popupDate').textContent = `Pubblicato il ${date}`;

    const popupActions = popup.querySelector('#popupActions');
    popupActions.style.display = isAuthor ? 'flex' : 'none';

    if (isAuthor) {
        popupActions.querySelector('#popupEditBtn').onclick = () => {
            closeReviewPopup();
            openEditReview(reviewId);
        };
        popupActions.querySelector('#popupDeleteBtn').onclick = () => {
            closeReviewPopup();
            deleteReview(reviewId);
        };
    }

    popup.style.display = 'block';
    setTimeout(() => popup.classList.add('active'), 10);
}

function openEditReview(reviewId) {
    const reviewItem = document.querySelector(`.review-item[data-review-id="${reviewId}"]`);
    const content = reviewItem.querySelector('.review-content p').textContent;
    const rating = reviewItem.dataset.rating;

    const popup = document.getElementById('editReviewPopup');
    popup.querySelector('#editReviewId').value = reviewId;
    popup.querySelector('#editReviewContent').value = content;
    popup.querySelector('#editReviewRating').value = rating;

    popup.style.display = 'block';
    setTimeout(() => {
        popup.classList.add('active');
        popup.querySelector('#editReviewContent').focus();
    }, 10);
}

function closeReviewPopup() {
    const popup = document.getElementById('reviewPopup');
    popup.classList.remove('active');
    setTimeout(() => popup.style.display = 'none', 300);
}

function closeEditPopup() {
    const popup = document.getElementById('editReviewPopup');
    popup.classList.remove('active');
    setTimeout(() => popup.style.display = 'none', 300);
}

async function submitEditReview() {
    const reviewId = document.getElementById('editReviewId').value;
    const rating = document.getElementById('editReviewRating').value;
    const content = document.getElementById('editReviewContent').value;

    try {
        const response = await fetch(`/movies/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, content })
        });

        if (!response.ok) throw new Error('Update failed');
        const updatedReview = await response.json();

        updateReviewInPage(
            reviewId,
            updatedReview.content,
            updatedReview.rating,
            updatedReview.date
        );
        closeEditPopup();
        calculateAndDisplayAverageRating();
        showNotification('Recensione aggiornata con successo', 'success');

        const ratingElement = document.getElementById('movieReviewRating');
        if (ratingElement) {
            ratingElement.classList.add('rating-updated');
            setTimeout(() => ratingElement.classList.remove('rating-updated'), 2000);
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification('Errore nell\'aggiornamento: ' + error.message, 'error');
    }
}

function updateReviewInPage(reviewId, newContent, newRating, newDate) {
    const reviewItem = document.querySelector(`.review-item[data-review-id="${reviewId}"]`);
    if (!reviewItem) return window.location.reload();

    reviewItem.querySelector('.review-content p').textContent = newContent;
    reviewItem.dataset.rating = newRating;
    reviewItem.querySelector('.review-rating').innerHTML = generateStarRating(newRating);
    reviewItem.querySelector('.review-date').textContent = formatDate(new Date(newDate));

    reviewItem.classList.add('highlight-update');
    setTimeout(() => reviewItem.classList.remove('highlight-update'), 2000);
}

async function deleteReview(reviewId) {
    if (!confirm('Sei sicuro di voler eliminare questa recensione?')) return;

    const reviewItem = document.querySelector(`.review-item[data-review-id="${reviewId}"]`);
    reviewItem?.classList.add('deleting');

    try {
        const response = await fetch(`/movies/reviews/${reviewId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');

        animateDeletion(reviewItem, () => {
            const remainingReviews = document.querySelectorAll('.review-item');
            if (remainingReviews.length === 0) {
                window.location.reload();
            } else {
                calculateAndDisplayAverageRating();
                const ratingElement = document.getElementById('movieReviewRating');
                if (ratingElement) {
                    ratingElement.classList.add('rating-updated');
                    setTimeout(() => ratingElement.classList.remove('rating-updated'), 2000);
                }
                checkEmptyColumns();
            }
        });

        showNotification('Recensione eliminata con successo', 'success');
    } catch (error) {
        reviewItem?.classList.remove('deleting');
        showNotification('Errore nell\'eliminazione: ' + error.message, 'error');
    }
}

function checkEmptyColumns() {
    const columnTypes = [
        { selector: '.journalist-column', message: 'No journalist reviews yet.' },
        { selector: '.user-column', message: 'No user reviews yet.' }
    ];

    columnTypes.forEach(({selector, message}) => {
        const column = document.querySelector(selector);
        if (!column) return;

        const hasReviews = column.querySelector('.review-item');
        const existingNoReviews = column.querySelector('.no-reviews');

        if (!hasReviews) {
            if (existingNoReviews) {
                existingNoReviews.remove();
            }

            const noReviewsDiv = document.createElement('div');
            noReviewsDiv.className = 'no-reviews';
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            noReviewsDiv.appendChild(messageElement);
            column.appendChild(noReviewsDiv);
        }
    });
}

// Funzioni di supporto
function generateStarRating(rating) {
    return Array.from({length: 5}, (_, i) =>
        `<span class="star">${i < rating ? '★' : '☆'}</span>`
    ).join('');
}

function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function animateDeletion(reviewItem, callback) {
    if (!reviewItem) return window.location.reload();

    reviewItem.style.height = `${reviewItem.offsetHeight}px`;
    setTimeout(() => {
        reviewItem.style.cssText = 'height:0; opacity:0; margin:0; padding:0;';
        setTimeout(() => {
            reviewItem.remove();
            if (callback) callback();
        }, 500);
    }, 10);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 10);
}

function calculateAndDisplayAverageRating() {
    const reviewItems = document.querySelectorAll('.review-item');

    if (reviewItems.length === 0) {
        const ratingElement = document.getElementById('movieReviewRating');
        if (ratingElement) {
            ratingElement.innerHTML = `
            <div class="average-rating-container">
                <p class="no-rating-reviews">Nessuna recensione</p>
            </div>
        `;
        }
        return;
    }

    let totalRating = 0;
    let userRatingsCount = 0;
    let journalistRatingsCount = 0;
    let userRatingsTotal = 0;
    let journalistRatingsTotal = 0;

    reviewItems.forEach(review => {
        const rating = parseInt(review.dataset.rating, 10);
        const role = review.dataset.role;

        totalRating += rating;

        if (role === 'journalist') {
            journalistRatingsTotal += rating;
            journalistRatingsCount++;
        } else {
            userRatingsTotal += rating;
            userRatingsCount++;
        }
    });

    const averageRating = totalRating / reviewItems.length;
    const userAverageRating = userRatingsCount > 0 ? userRatingsTotal / userRatingsCount : 0;
    const journalistAverageRating = journalistRatingsCount > 0 ? journalistRatingsTotal / journalistRatingsCount : 0;

    updateRatingDisplay(averageRating, userAverageRating, journalistAverageRating);
}

function updateRatingDisplay(averageRating, userAverageRating, journalistAverageRating) {
    const ratingElement = document.getElementById('movieReviewRating');
    if (!ratingElement) return;

    const formatRating = (rating) => rating.toFixed(1);

    const stars = generateStarRating(Math.round(averageRating));

    let ratingHTML = `
        <div class="average-rating-container">
            <div class="average-rating">
                <span class="rating-value">${formatRating(averageRating)}</span> /5
                <div class="stars-container">${stars}</div>
            </div>
            <div class="rating-details">
    `;

    if (userAverageRating > 0) {
        ratingHTML += `
            <div class="user-rating">
                <span class="role-label user">Users:</span> 
                <span class="rating-value">${formatRating(userAverageRating)}</span> /5
            </div>
        `;
    }

    if (journalistAverageRating > 0) {
        ratingHTML += `
            <div class="journalist-rating">
                <span class="role-label journalist">Journalists:</span> 
                <span class="rating-value">${formatRating(journalistAverageRating)}</span> /5
            </div>
        `;
    }

    ratingHTML += `
            </div>
        </div>
    `;

    ratingElement.innerHTML = ratingHTML;
}