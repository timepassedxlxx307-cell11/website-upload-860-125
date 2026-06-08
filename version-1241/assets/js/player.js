(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var playerBox = document.querySelector('[data-hls-player]');
    if (!playerBox) {
      return;
    }

    var video = playerBox.querySelector('video');
    var startButton = playerBox.querySelector('[data-player-start]');
    var message = playerBox.querySelector('[data-player-message]');
    var source = playerBox.getAttribute('data-src');
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      if (!video || !source) {
        setMessage('当前影片没有可用播放源。');
        return;
      }

      playerBox.classList.add('is-ready');
      setMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
          video.play().catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面或稍后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setMessage('');
          video.play().catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
          });
        }, { once: true });
      } else {
        setMessage('当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器访问。');
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo, { once: true });
    }
  });
}());
