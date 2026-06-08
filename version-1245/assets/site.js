(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dots] button'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');

    if (filterPanel && list) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var categorySelect = filterPanel.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && searchInput) {
            searchInput.value = q;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var selectedType = typeSelect ? typeSelect.value : 'all';
            var selectedYear = yearSelect ? yearSelect.value : 'all';
            var selectedCategory = categorySelect ? categorySelect.value : 'all';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var type = card.getAttribute('data-type') || '';
                var year = card.getAttribute('data-year') || '';
                var category = card.getAttribute('data-category') || '';
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (selectedType !== 'all' && type.indexOf(selectedType) === -1) {
                    matched = false;
                }

                if (selectedYear !== 'all' && year !== selectedYear) {
                    matched = false;
                }

                if (selectedCategory !== 'all' && category !== selectedCategory) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();

function initPlayer(streamUrl) {
    var video = document.getElementById('player-video');
    var cover = document.getElementById('player-cover');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !streamUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 32,
                capLevelToPlayerSize: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        prepare();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
