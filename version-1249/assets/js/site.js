(function() {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  var queryReader = document.querySelector('[data-query-reader]');
  if (queryReader) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      queryReader.value = q;
    }
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
  filterInputs.forEach(function(input) {
    var section = input.closest('section') || document;
    var select = section.querySelector('.filter-select');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var year = select ? select.value : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedText = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle('is-filtered-out', !(matchedText && matchedYear));
      });
    }

    input.addEventListener('input', applyFilter);
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    applyFilter();
  });
})();
