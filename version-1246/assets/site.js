(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' '));
    }

    function applyCards() {
        var query = searchInput ? normalize(searchInput.value) : '';

        cards.forEach(function (card) {
            var text = cardText(card);
            var type = normalize(card.getAttribute('data-type'));
            var year = normalize(card.getAttribute('data-year'));
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = activeFilter === 'all' || type === activeFilter || year === activeFilter || text.indexOf(activeFilter) !== -1;
            card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
        });
    }

    if (searchInput && cards.length) {
        searchInput.addEventListener('input', applyCards);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = normalize(button.getAttribute('data-filter-button')) || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applyCards();
        });
    });

    applyCards();
})();
