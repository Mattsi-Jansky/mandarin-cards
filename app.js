(function () {
  'use strict';

  var categoryLabels = {};
  PHRASE_DATA.categories.forEach(function (c) { categoryLabels[c.id] = c.label; });

  var el = {
    start: document.getElementById('start'),
    round: document.getElementById('round'),
    done: document.getElementById('done'),
    nameInput: document.getElementById('name-input'),
    categoryList: document.getElementById('category-list'),
    startBtn: document.getElementById('start-btn'),
    progress: document.getElementById('progress'),
    tally: document.getElementById('tally'),
    category: document.getElementById('card-category'),
    english: document.getElementById('card-english'),
    answer: document.getElementById('answer'),
    hanzi: document.getElementById('card-hanzi'),
    pinyin: document.getElementById('card-pinyin'),
    phonetic: document.getElementById('card-phonetic'),
    note: document.getElementById('card-note'),
    screenHint: document.getElementById('card-screen-hint'),
    flipBtn: document.getElementById('flip-btn'),
    grade: document.getElementById('grade'),
    rightBtn: document.getElementById('right-btn'),
    wrongBtn: document.getElementById('wrong-btn'),
    quitBtn: document.getElementById('quit-btn'),
    summary: document.getElementById('summary'),
    missedList: document.getElementById('missed-list'),
    againBtn: document.getElementById('again-btn')
  };

  var state = {
    queue: [],        // cards still to see in the current pass
    retry: [],        // cards missed this pass, replayed once the pass empties
    current: null,
    pass: 0,          // 0 = first time through, 1+ = repeat passes
    passSize: 0,
    seenInPass: 0,
    correct: 0,
    wrong: 0,
    missed: {},       // id -> card, everything missed at least once this round
    revealed: false
  };

  var NAME_KEY = 'mandarin-cards.name';

  function readStoredName() {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; }
  }

  function storeName(value) {
    try { localStorage.setItem(NAME_KEY, value); } catch (e) { /* private mode */ }
  }

  function shuffle(items) {
    var out = items.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function fillName(text, name) {
    return text.replace(/\{name\}/g, name);
  }

  function buildCategoryChoices() {
    PHRASE_DATA.categories.forEach(function (category) {
      var label = document.createElement('label');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.value = category.id;
      box.checked = true;
      box.addEventListener('change', syncStartButton);
      label.appendChild(box);
      label.appendChild(document.createTextNode(category.label));
      el.categoryList.appendChild(label);
    });
  }

  function syncStartButton() {
    el.startBtn.disabled = selectedCategories().length === 0;
  }

  function selectedCategories() {
    var boxes = el.categoryList.querySelectorAll('input:checked');
    return Array.prototype.map.call(boxes, function (b) { return b.value; });
  }

  function buildDeck() {
    var chosen = selectedCategories();
    var name = el.nameInput.value.trim() || '[your name]';
    return PHRASE_DATA.phrases
      .filter(function (p) { return chosen.indexOf(p.category) !== -1; })
      .map(function (p) {
        return {
          id: p.id,
          category: p.category,
          english: fillName(p.english, name),
          hanzi: fillName(p.hanzi, name),
          pinyin: fillName(p.pinyin, name),
          phonetic: fillName(p.phonetic, name),
          note: p.note || '',
          showOnScreen: !!p.showOnScreen
        };
      });
  }

  function show(screen) {
    el.start.hidden = screen !== 'start';
    el.round.hidden = screen !== 'round';
    el.done.hidden = screen !== 'done';
  }

  function startRound() {
    var deck = buildDeck();
    if (!deck.length) return;

    storeName(el.nameInput.value.trim());

    state.queue = shuffle(deck);
    state.retry = [];
    state.pass = 0;
    state.passSize = state.queue.length;
    state.seenInPass = 0;
    state.correct = 0;
    state.wrong = 0;
    state.missed = {};

    show('round');
    nextCard();
  }

  function nextCard() {
    if (!state.queue.length) {
      if (!state.retry.length) return finishRound();
      state.pass += 1;
      state.queue = shuffle(state.retry);
      state.retry = [];
      state.passSize = state.queue.length;
      state.seenInPass = 0;
    }

    state.current = state.queue.shift();
    state.seenInPass += 1;
    state.revealed = false;
    renderCard();
  }

  function renderCard() {
    var card = state.current;

    el.category.textContent = categoryLabels[card.category] || '';
    el.english.textContent = card.english;
    el.hanzi.textContent = card.hanzi;
    el.pinyin.textContent = card.pinyin;
    el.phonetic.textContent = card.phonetic;

    el.note.textContent = card.note;
    el.note.hidden = !card.note;
    el.screenHint.hidden = !card.showOnScreen;

    el.answer.hidden = true;
    el.grade.hidden = true;
    el.flipBtn.hidden = false;
    el.flipBtn.focus();

    var label = state.pass === 0 ? 'Card' : 'Second look';
    el.progress.textContent = label + ' ' + state.seenInPass + ' of ' + state.passSize;
    el.tally.textContent = 'Right ' + state.correct + ' · Wrong ' + state.wrong;
  }

  function reveal() {
    if (state.revealed) return;
    state.revealed = true;
    el.answer.hidden = false;
    el.flipBtn.hidden = true;
    el.grade.hidden = false;
    el.rightBtn.focus();
  }

  function grade(gotItRight) {
    if (!state.revealed) return;

    if (gotItRight) {
      state.correct += 1;
    } else {
      state.wrong += 1;
      state.missed[state.current.id] = state.current;
      state.retry.push(state.current);
    }
    nextCard();
  }

  function finishRound() {
    var missed = Object.keys(state.missed).map(function (id) { return state.missed[id]; });
    var total = state.correct + state.wrong;
    var unfinished = state.queue.length + state.retry.length > 0;

    if (total === 0) {
      el.summary.textContent = 'Round ended before you answered anything.';
    } else if (unfinished) {
      el.summary.textContent = 'Ended early — ' + state.correct + ' right, ' + state.wrong +
        ' wrong out of ' + total + ' answers.' +
        (missed.length ? ' Still to nail down:' : '');
    } else if (missed.length) {
      el.summary.textContent = 'You got every card right in the end, after ' + state.wrong +
        (state.wrong === 1 ? ' slip' : ' slips') + ' across ' + total + ' answers. ' +
        'These are the ones that tripped you up:';
    } else {
      el.summary.textContent = 'Clean sweep — ' + total + ' cards, no mistakes.';
    }

    el.missedList.textContent = '';
    missed.forEach(function (card) {
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      strong.textContent = card.english;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(
        ' — ' + card.hanzi + ' (' + card.pinyin + ' / ' + card.phonetic + ')'
      ));
      el.missedList.appendChild(li);
    });

    show('done');
    el.againBtn.focus();
  }

  el.startBtn.addEventListener('click', startRound);
  el.againBtn.addEventListener('click', function () { show('start'); el.startBtn.focus(); });
  el.flipBtn.addEventListener('click', reveal);
  el.rightBtn.addEventListener('click', function () { grade(true); });
  el.wrongBtn.addEventListener('click', function () { grade(false); });
  el.quitBtn.addEventListener('click', function () { finishRound(); });

  document.addEventListener('keydown', function (event) {
    if (el.round.hidden) return;
    if (event.target.tagName === 'INPUT') return;

    if (!state.revealed && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      reveal();
      return;
    }
    if (state.revealed && event.key === '1') grade(false);
    if (state.revealed && event.key === '2') grade(true);
  });

  buildCategoryChoices();
  syncStartButton();
  el.nameInput.value = readStoredName();
})();
