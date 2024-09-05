// Game configuration
const rows = 4;
const cols = 4;
const positions = Array.from(new Array(rows * cols), (_, i) => i);
const delay = 2000;
const symbols = [
  '🍇', '🍉', '🚗', '🍌', '🏠', '🥭', '🍎', '🐯',
  '🍒', '🍓', '🐵', '🥝', '🍿', '🏀', '🎱', '🐻',
  '🍜', '🍢', '🎓', '🍤', '🦀', '🍦', '🍩', '🎂',
  '🍫', '🍭', '🍼', '🪔', '🍺', '🐱', '🐶'
];

// Game state variables
let activeTiles = [];
let attempts = 0;
let randomizedSymbols = [];
let isResetInProgress = false;
let timeoutIdx;

// DOM elements
const gameFrontEl = document.querySelector('.game-front');
const gameBackEl = document.querySelector('.game-back');
const outputEl = document.querySelector('output');
const restartBtn = document.querySelector('.restart');

// Function to shuffle and randomize symbols
const getRandomSymbols = (rows, cols, items) => {
  const selectedSymbols = Array.from(
    new Array((rows * cols) / 2),
    () => items[Math.floor(Math.random() * items.length)]
  );
  const totalSymbols = selectedSymbols.concat(selectedSymbols);

  const randomizedSymbols = [];
  const length = totalSymbols.length;
  for (let i = 0; i < length; i++) {
    randomizedSymbols.push(...totalSymbols.splice(Math.floor(Math.random() * totalSymbols.length), 1));
  }

  return randomizedSymbols;
};

// Utility function to add classes
const addClassToGameElements = (elements, className) => {
  elements.forEach(pos => {
    gameFrontEl.children[pos].classList.add(className);
  });
};

// Utility function to remove classes
const removeClassFromGameElement = (elements, className) => {
  elements.forEach(pos => {
    gameFrontEl.children[pos].classList.remove(className);
  });
};

// Start or restart the game
const startGame = async (init = false) => {
  if (isResetInProgress) {
    return;
  }

  randomizedSymbols = [];
  activeTiles = [];
  attempts = 0;
  isResetInProgress = true;
  outputEl.textContent = attempts;

  if (!init) {
    gameFrontEl.classList.add('reset');
    removeClassFromGameElement(positions, 'active');
    removeClassFromGameElement(positions, 'match');
    await new Promise(r => setTimeout(r, delay / 2));
  }

  randomizedSymbols = getRandomSymbols(rows, cols, symbols);
  gameFrontEl.childNodes.forEach((el, idx) => {
    el.querySelector('.back').textContent = randomizedSymbols[idx];
  });

  gameFrontEl.classList.remove('reset');
  isResetInProgress = false;
};

// Create grid for the game
const createGridFragment = (rows, cols) => {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < rows * cols; i++) {
    const tile = document.createElement('div');
    tile.dataset.idx = i;
    tile.className = 'tile';

    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = ''; // Front stays empty or can have a placeholder

    const back = document.createElement('div');
    back.className = 'back';

    tile.appendChild(front);
    tile.appendChild(back);

    fragment.appendChild(tile);
  }
  return fragment;
};

gameFrontEl.appendChild(createGridFragment(rows, cols));

// Handle tile clicks
gameFrontEl.addEventListener('click', e => {
  const tile = e.target.closest('.tile');
  const idx = tile.dataset.idx;

  if (idx == null || isResetInProgress || tile.classList.contains('match')) {
    return;
  }

  attempts++;

  if (activeTiles.length === 2) {
    if (timeoutIdx) {
      clearTimeout(timeoutIdx);
    }
    removeClassFromGameElement(activeTiles, 'active');
    activeTiles = [];
  }

  activeTiles.push(idx);

  if (activeTiles.length === 2) {
    if (randomizedSymbols[activeTiles[0]] === randomizedSymbols[activeTiles[1]]) {
      // Mark the tiles as matched and prevent further clicks
      addClassToGameElements(activeTiles, 'match');
    } else {
      timeoutIdx = setTimeout(() => {
        removeClassFromGameElement(activeTiles, 'active');
        activeTiles = [];
      }, delay);
    }
  }

  tile.classList.add('active');
  outputEl.textContent = attempts;
});

// Restart button functionality
restartBtn.addEventListener('click', () => startGame());
startGame(true);
