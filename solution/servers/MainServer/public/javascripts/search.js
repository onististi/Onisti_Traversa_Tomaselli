document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchType = document.getElementById('search-type');

    if (!searchInput || !searchForm) return;

    searchForm.addEventListener('submit', function(event) {
        if (searchInput.value.trim() === '') {
            event.preventDefault();
        }
    });
});