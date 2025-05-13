document.addEventListener('DOMContentLoaded', function() {
    setupSearchInput();
    handleMissingImages();
});

function setupSearchInput() {
    const searchButton = document.querySelector('.search-container button');
    const searchInput = document.querySelector('.search-container input');

    if (searchButton && searchInput) {

        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q');
        if (searchTerm) {
            searchInput.value = searchTerm;
        }


        searchButton.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
        });


        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}


function performSearch(searchTerm) {
    if (searchTerm.trim() !== '') {
        window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
}

function handleMissingImages() {

    const posterImages = document.querySelectorAll('.poster img');

    posterImages.forEach(img => {
        img.addEventListener('error', function() {

            this.parentElement.classList.add('missing-image');
            this.style.display = 'none';


            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.textContent = 'No Image';
            this.parentElement.appendChild(fallback);
        });


        if (!img.complete || img.naturalHeight === 0 || !img.src || img.src === 'null' || img.src === 'undefined') {
            img.dispatchEvent(new Event('error'));
        }
    });
}