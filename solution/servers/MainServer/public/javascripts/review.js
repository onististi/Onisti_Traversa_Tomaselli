document.addEventListener('DOMContentLoaded', function() {
    initializeReviewSystem();
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

// Funzioni per le operazioni CRUD
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
        showNotification('Recensione aggiornata con successo', 'success');
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

        animateDeletion(reviewItem);
        showNotification('Recensione eliminata con successo', 'success');
        checkEmptyReviews();
    } catch (error) {
        reviewItem?.classList.remove('deleting');
        showNotification('Errore nell\'eliminazione: ' + error.message, 'error');
    }
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

function animateDeletion(reviewItem) {
    if (!reviewItem) return window.location.reload();

    reviewItem.style.height = `${reviewItem.offsetHeight}px`;
    setTimeout(() => {
        reviewItem.style.cssText = 'height:0; opacity:0; margin:0; padding:0;';
        setTimeout(() => reviewItem.remove(), 500);
    }, 10);
}

function checkEmptyReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container.querySelector('.review-item')) {
        container.innerHTML = `
            <div class="no-reviews">
                <p>Non ci sono ancora recensioni. Sii il primo a recensire questo film!</p>
            </div>
        `;
    }
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