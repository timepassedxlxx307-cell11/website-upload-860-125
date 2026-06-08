(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initListings() {
        Array.prototype.slice.call(document.querySelectorAll("[data-listing]")).forEach(function (listing) {
            var input = listing.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(listing.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(listing.querySelectorAll(".movie-card"));
            var empty = listing.querySelector("[data-empty-state]");
            var activeFilter = "all";
            function apply() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
                    var isVisible = matchText && matchFilter;
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
        var prepared = false;
        var hls = null;
        if (!video || !cover || !sourceUrl) {
            return;
        }
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function begin() {
            prepare();
            cover.classList.add("is-hidden");
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                begin();
            });
        });
        cover.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initListings();
    });
}());
