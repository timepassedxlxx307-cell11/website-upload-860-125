(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (!query) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
            var empty = scope.querySelector('[data-empty-result]');
            function apply(value) {
                var query = (value || '').trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
                    var matched = !query || haystack.indexOf(query) >= 0;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', function () {
                    apply(input.value);
                });
            }
            scope.querySelectorAll('[data-filter-tag]').forEach(function (button) {
                button.addEventListener('click', function () {
                    var value = button.getAttribute('data-filter-tag') || '';
                    if (input) {
                        input.value = value;
                    }
                    apply(value);
                });
            });
        });
    }

    function createResultCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-link" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="poster-play">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-tags"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[match];
        });
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var input = page.querySelector('[data-search-input]');
        var button = page.querySelector('[data-search-button]');
        var result = page.querySelector('[data-search-results]');
        var empty = page.querySelector('[data-empty-result]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        function render() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category, movie.oneLine].join(' ').toLowerCase();
                return !query || text.indexOf(query) >= 0;
            }).slice(0, 120);
            result.innerHTML = '';
            matched.forEach(function (movie) {
                result.appendChild(createResultCard(movie));
            });
            if (empty) {
                empty.classList.toggle('is-visible', matched.length === 0);
            }
        }
        if (input) {
            input.addEventListener('input', render);
        }
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    window.setupHlsPlayer = function (videoId, sourceUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !sourceUrl) {
            return;
        }
        var loaded = false;
        var message = null;
        function showMessage(text) {
            if (!message) {
                message = document.createElement('div');
                message.className = 'player-message';
                video.parentElement.appendChild(message);
            }
            message.textContent = text;
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showMessage('播放加载失败，请稍后重试');
                    hls.destroy();
                });
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else {
                showMessage('当前浏览器暂不支持播放');
            }
        }
        function start() {
            load();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };

    ready(function () {
        setupMobileNavigation();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
