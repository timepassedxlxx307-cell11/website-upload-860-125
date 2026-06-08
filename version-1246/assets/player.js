(function () {
    function setupPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.js-play-button');

        if (!video || !button) {
            return;
        }

        var sourceElement = video.querySelector('source');
        var url = sourceElement ? sourceElement.getAttribute('src') : '';
        var hls = null;
        var attached = false;

        function attach() {
            if (attached || !url) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            box.classList.add('is-playing');

            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        button.addEventListener('click', function (event) {
            event.preventDefault();
            play();
        });

        box.addEventListener('click', function (event) {
            if (event.target === video && video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                box.classList.remove('is-playing');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setupPlayer);
})();
