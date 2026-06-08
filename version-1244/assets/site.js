(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var forms = selectAll('[data-filter-form]');
        forms.forEach(function (form) {
            var input = form.querySelector('[data-filter-input]');
            var typeSelect = form.querySelector('[data-filter-type]');
            var yearSelect = form.querySelector('[data-filter-year]');
            var scopeSelector = form.getAttribute('data-filter-form');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var cards = selectAll('[data-card]', scope || document);
            var empty = document.querySelector(form.getAttribute('data-empty-target') || '');
            var run = function () {
                var query = input ? input.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var matchQuery = !query || textOf(card).indexOf(query) !== -1;
                    var matchType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
                    var matchYear = !year || (card.getAttribute('data-year') || '') === year;
                    var keep = matchQuery && matchType && matchYear;
                    card.style.display = keep ? '' : 'none';
                    if (keep) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            };
            if (input) {
                input.addEventListener('input', run);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', run);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', run);
            }
            run();
        });
    }

    function attachHls(video, stream, playAfterReady) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            if (playAfterReady) {
                video.play().catch(function () {});
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsPlayer) {
                video._hlsPlayer.destroy();
            }
            var hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            video._hlsPlayer = hls;
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (playAfterReady) {
                    video.play().catch(function () {});
                }
            });
            return;
        }
        video.src = stream;
        if (playAfterReady) {
            video.play().catch(function () {});
        }
    }

    function initPlayers() {
        var boxes = selectAll('[data-player]');
        boxes.forEach(function (box) {
            var video = box.querySelector('video');
            var trigger = box.querySelector('[data-play-trigger]');
            var stream = box.getAttribute('data-stream');
            if (!video || !stream) {
                return;
            }
            var start = function () {
                if (!video.dataset.ready) {
                    video.dataset.ready = '1';
                    attachHls(video, stream, true);
                } else {
                    video.play().catch(function () {});
                }
                box.classList.add('is-playing');
            };
            if (trigger) {
                trigger.addEventListener('click', function (event) {
                    event.preventDefault();
                    start();
                });
            }
            video.addEventListener('click', function () {
                if (!video.dataset.ready) {
                    start();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
