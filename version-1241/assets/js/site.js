(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });

    setupHeroCarousel();
    setupLocalFilters();
    setupSearchPage();
  });

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-local-filter]').forEach(function (panel) {
      var input = panel.querySelector('[data-local-search]');
      var count = panel.querySelector('[data-filter-count]');
      var list = panel.parentElement.querySelector('[data-filter-list]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];
      var chipValue = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [card.getAttribute('data-title') || '', card.getAttribute('data-meta') || ''].join(' ');
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchChip = !chipValue || haystack.indexOf(chipValue) !== -1;
          var match = matchQuery && matchChip;

          card.classList.toggle('hidden-by-filter', !match);
          if (match) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      panel.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          panel.querySelectorAll('[data-filter-chip]').forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          chipValue = (chip.getAttribute('data-filter-chip') || '').toLowerCase();
          apply();
        });
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }

    var form = page.querySelector('[data-search-form]');
    var input = page.querySelector('[data-search-input]');
    var status = page.querySelector('[data-search-status]');
    var results = page.querySelector('[data-search-results]');

    function createCard(movie) {
      var tags = Array.isArray(movie.tags) && movie.tags.length ? movie.tags[0] : movie.genre;
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
        '  <span class="poster-frame">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.classList.add(\'is-missing\');" />',
        '    <span class="poster-overlay"><span>立即观看</span></span>',
        '  </span>',
        '  <span class="movie-title">' + escapeHtml(movie.title) + '</span>',
        '  <span class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
        '  <span class="movie-tags"><b>' + escapeHtml(tags) + '</b><em>' + escapeHtml(movie.category) + '</em></span>',
        '</a>'
      ].join('');
    }

    function render() {
      var source = window.MovieSearchIndex || [];
      var query = input ? input.value.trim().toLowerCase() : '';
      var matches = !query ? source.slice(0, 16) : source.filter(function (movie) {
        return movie.meta.indexOf(query) !== -1;
      }).slice(0, 80);

      if (results) {
        results.innerHTML = matches.map(createCard).join('');
      }

      if (status) {
        status.textContent = query ? '找到 ' + matches.length + ' 条相关结果。' : '输入关键词即可搜索全部影片。';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        input.value = params.get('q');
      }
      input.addEventListener('input', render);
    }

    window.setTimeout(render, 50);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}());
