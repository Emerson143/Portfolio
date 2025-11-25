// Mobile menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// Background particles inspired by Gravidade-style hero
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const config = {
    count: 90,
    maxDistance: 140,
    speed: 0.35
  };

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < config.count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      r: Math.random() * 2 + 1,
      hue: Math.random() > 0.5 ? 190 : 280
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, 0.9)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = idx + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDistance) {
          const alpha = 1 - dist / config.maxDistance;
          ctx.strokeStyle = `rgba(91, 224, 255, ${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  };

  draw();
})();

// Snake game (canvas)
const bootSnake = () => {
  const container = document.getElementById('canvas-container');
  const scoreEl = document.getElementById('score');
  const toggleBtn = document.getElementById('toggle-game');
  if (!container || !scoreEl || !toggleBtn) return;

  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const message = document.createElement('div');
  message.className = 'game-message';
  container.appendChild(canvas);
  container.appendChild(message);

  const config = {
    cells: 20,
    speed: 120
  };

  let cellSize = 18;
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 12, y: 10 };
  let score = 0;
  let playing = false;
  let gameOver = false;
  let lastFrame = 0;

  const setMessage = (text) => {
    if (text) {
      message.textContent = text;
      message.classList.add('show');
    } else {
      message.textContent = '';
      message.classList.remove('show');
    }
  };

  const updateScore = () => {
    scoreEl.textContent = score;
  };

  const resize = () => {
    const size = Math.max(Math.min(container.clientWidth, 460), 260);
    cellSize = Math.floor(size / config.cells);
    const dim = cellSize * config.cells;
    canvas.width = dim;
    canvas.height = dim;
    draw();
  };

  const placeFood = () => {
    let spot;
    do {
      spot = {
        x: Math.floor(Math.random() * config.cells),
        y: Math.floor(Math.random() * config.cells)
      };
    } while (snake.some(part => part.x === spot.x && part.y === spot.y));
    food = spot;
  };

  const resetGame = () => {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    updateScore();
    placeFood();
    gameOver = false;
    playing = false;
    setMessage('Pressione Iniciar ou Espaço');
    draw();
  };

  const drawCell = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
  };

  const draw = () => {
    ctx.fillStyle = '#050915';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < config.cells; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    const gradient = ctx.createRadialGradient(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      2,
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize
    );
    gradient.addColorStop(0, '#7af08f');
    gradient.addColorStop(1, '#2fb3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);

    snake.forEach((part, idx) => {
      const alpha = 0.8 - idx * 0.03;
      drawCell(part.x, part.y, `rgba(91, 224, 255, ${Math.max(alpha, 0.35)})`);
    });
  };

  const handleDirection = (x, y) => {
    if (dir.x === -x && dir.y === -y) return;
    nextDir = { x, y };
  };

  const step = (timestamp = 0) => {
    if (playing && !gameOver && timestamp - lastFrame >= config.speed) {
      lastFrame = timestamp;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      const hitWall = head.x < 0 || head.y < 0 || head.x >= config.cells || head.y >= config.cells;
      const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);

      if (hitWall || hitSelf) {
        playing = false;
        gameOver = true;
        setMessage('Game over! Espaço para reiniciar.');
        draw();
        requestAnimationFrame(step);
        return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        placeFood();
      } else {
        snake.pop();
      }

      draw();
    }

    requestAnimationFrame(step);
  };

  const toggleGame = () => {
    if (gameOver) {
      resetGame();
      playing = true;
      setMessage('');
      lastFrame = performance.now();
      return;
    }
    playing = !playing;
    setMessage(playing ? '' : 'Pausado');
    if (playing) lastFrame = performance.now();
  };

  toggleBtn.addEventListener('click', toggleGame);

  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        handleDirection(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        handleDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        handleDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        handleDirection(1, 0);
        break;
      case ' ':
        toggleGame();
        break;
      default:
        break;
    }
  });

  window.addEventListener('resize', resize);
  resetGame();
  resize();
  requestAnimationFrame(step);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootSnake();
} else {
  window.addEventListener('DOMContentLoaded', bootSnake);
}
