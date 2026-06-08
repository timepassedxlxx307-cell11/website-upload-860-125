(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");

        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function setupCardFilter() {
        var input = document.querySelector("[data-card-filter]");

        if (!input) {
            return;
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function buildSearchCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(item.url) + "\" class=\"poster-link\">",
            "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-type\">" + escapeHtml(item.type) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<a href=\"" + escapeHtml(item.url) + "\" class=\"movie-title\">" + escapeHtml(item.title) + "</a>",
            "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.year) + " · " + escapeHtml(item.genre) + "</p>",
            "<p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function setupGlobalSearch() {
        var input = document.getElementById("global-search");
        var results = document.getElementById("search-results");
        var counter = document.getElementById("search-count");
        var regionFilter = document.getElementById("region-filter");
        var typeFilter = document.getElementById("type-filter");

        if (!input || !results || !window.SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;

        function matchItem(item, query, region, type) {
            var text = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                (item.tags || []).join(" "),
                item.oneLine
            ].join(" ").toLowerCase();

            if (region && item.region !== region) {
                return false;
            }

            if (type && item.type !== type) {
                return false;
            }

            return !query || text.indexOf(query) !== -1;
        }

        function render() {
            var query = input.value.trim().toLowerCase();
            var region = regionFilter ? regionFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var matches = window.SEARCH_INDEX.filter(function (item) {
                return matchItem(item, query, region, type);
            });

            results.innerHTML = matches.slice(0, 120).map(buildSearchCard).join("");

            if (counter) {
                counter.textContent = "搜索结果（" + matches.length + "）";
            }
        }

        input.addEventListener("input", render);

        if (regionFilter) {
            regionFilter.addEventListener("change", render);
        }

        if (typeFilter) {
            typeFilter.addEventListener("change", render);
        }

        render();
    }

    window.initMoviePlayer = function (source) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var overlay = document.getElementById("play-overlay");
            var attached = false;
            var hlsInstance = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = source;
            }

            function startPlayback() {
                attachSource();

                if (overlay) {
                    overlay.classList.add("is-hidden");
                }

                var playPromise = video.play();

                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            attachSource();

            if (overlay) {
                overlay.addEventListener("click", startPlayback);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupBackTop();
        setupHero();
        setupCardFilter();
        setupGlobalSearch();
    });
}());
