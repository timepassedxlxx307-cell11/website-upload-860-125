(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  let activeFilter = '';

  const applyFilter = function () {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-region') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      const matchedQuery = !query || haystack.indexOf(query) !== -1;
      const matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('hidden-card', !(matchedQuery && matchedFilter));
    });
  };

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q');

    if (initial) {
      searchInput.value = initial;
    }

    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });

  if (cards.length) {
    applyFilter();
  }
})();

function setupMoviePlayer(videoUrl) {
  const video = document.getElementById('moviePlayer');
  const cover = document.querySelector('.player-cover');

  if (!video || !cover || !videoUrl) {
    return;
  }

  let ready = false;
  let hlsInstance = null;

  const attachVideo = function () {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = videoUrl;
    return Promise.resolve();
  };

  const start = function () {
    cover.classList.add('hidden');
    attachVideo().then(function () {
      const playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          cover.classList.remove('hidden');
        });
      }
    });
  };

  cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}
