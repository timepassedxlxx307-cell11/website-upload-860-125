function initMoviePlayer(streamUrl, videoId, overlaySelector) {
  var video = document.getElementById(videoId);
  var overlay = document.querySelector(overlaySelector);
  var hlsInstance = null;
  var attached = false;

  function attachStream() {
    if (!video || attached) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    attached = true;
  }

  function start() {
    attachStream();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (!video) {
    return;
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
