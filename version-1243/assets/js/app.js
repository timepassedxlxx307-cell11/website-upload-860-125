(function () {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.mobile-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const carousel = document.querySelector('[data-carousel]');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let current = 0;
        let timer = null;

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

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-slide')) || 0;
                showSlide(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    const cards = Array.from(document.querySelectorAll('.filter-card'));
    const search = document.querySelector('[data-search]');
    const filters = Array.from(document.querySelectorAll('[data-filter]'));
    const empty = document.querySelector('.filter-empty');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(search ? search.value : '');
        const activeFilters = filters.map(function (control) {
            return {
                key: control.getAttribute('data-filter'),
                value: normalize(control.value)
            };
        });
        let visibleCount = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.type,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.tags
            ].join(' '));
            const keywordMatch = !keyword || haystack.includes(keyword);
            const filterMatch = activeFilters.every(function (filter) {
                if (!filter.value) {
                    return true;
                }

                return normalize(card.dataset[filter.key]).includes(filter.value);
            });
            const show = keywordMatch && filterMatch;
            card.classList.toggle('is-filter-hidden', !show);

            if (show) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.hidden = visibleCount !== 0;
        }
    }

    if (search) {
        search.addEventListener('input', applyFilters);
    }

    filters.forEach(function (control) {
        control.addEventListener('change', applyFilters);
    });

    applyFilters();
}());

function initializeMoviePlayer(source) {
    const video = document.getElementById('movie-player');
    const cover = document.getElementById('player-cover');

    if (!video || !source) {
        return;
    }

    let ready = false;
    let hls = null;

    function prepare() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        prepare();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        const action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
