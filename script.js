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

// Three.js Rubik-like cube with drag + shuffle fallback
const initCube = () => {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  if (typeof THREE === 'undefined') {
    container.innerHTML = '<p style="padding:16px;text-align:center;color:#9fb0d7;">Ative o JavaScript/Three.js para brincar com o cubo.</p>';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    container.innerHTML = '<p style="padding:16px;text-align:center;color:#9fb0d7;">Seu navegador não suporta WebGL. Tente outro para ver o cubo.</p>';
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050915);

  const camera = new THREE.PerspectiveCamera(
    60,
    Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
    0.1,
    100
  );
  camera.position.set(4, 3.2, 5.6);
  camera.lookAt(0, 0, 0);

  renderer.setSize(container.clientWidth || 400, container.clientHeight || 300);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const createFaceTexture = (baseColor) => {
    const size = 256;
    const face = document.createElement('canvas');
    face.width = face.height = size;
    const ctx = face.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 4;
    const step = size / 3;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(step * i, 0);
      ctx.lineTo(step * i, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, step * i);
      ctx.lineTo(size, step * i);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, size - 8, size - 8);

    return new THREE.CanvasTexture(face);
  };

  const faces = [
    createFaceTexture('#ff5800'), // right
    createFaceTexture('#0046ad'), // left
    createFaceTexture('#009b48'), // top
    createFaceTexture('#ffd500'), // bottom
    createFaceTexture('#b71234'), // front
    createFaceTexture('#ffffff')  // back
  ];

  const neutralTex = createFaceTexture('#111827');
  const cubies = [];
  const group = new THREE.Group();
  const positions = [-1, 0, 1];
  const size = 0.62;

  positions.forEach(x => {
    positions.forEach(y => {
      positions.forEach(z => {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const materials = [];
        for (let i = 0; i < 6; i++) {
          let tex = neutralTex;
          // Face coloring logic based on cubie position (show color only on outer faces)
          if (i === 0 && x === 1) tex = faces[0]; // right
          if (i === 1 && x === -1) tex = faces[1]; // left
          if (i === 2 && y === 1) tex = faces[2]; // top
          if (i === 3 && y === -1) tex = faces[3]; // bottom
          if (i === 4 && z === 1) tex = faces[4]; // front
          if (i === 5 && z === -1) tex = faces[5]; // back
          materials.push(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0.08 }));
        }
        const cubelet = new THREE.Mesh(geometry, materials);
        cubelet.position.set(x * size, y * size, z * size);
        group.add(cubelet);
        cubies.push(cubelet);
      });
    });
  });

  group.position.set(0, 0, 0);
  scene.add(group);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const point = new THREE.PointLight(0x7af08f, 1.4);
  point.position.set(5, 5, 5);
  scene.add(point);

  const blueLight = new THREE.PointLight(0x5be0ff, 0.7);
  blueLight.position.set(-4, -3, -4);
  scene.add(blueLight);

  let targetX = 0;
  let targetY = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onPointerDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onPointerUp = () => { dragging = false; };

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    targetX = x * 0.0012;
    targetY = y * 0.0012;

    if (dragging) {
      const dx = (e.clientX - lastX) * 0.01;
      const dy = (e.clientY - lastY) * 0.01;
      group.rotation.y += dx;
      group.rotation.x += dy;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  };

  window.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);

  container.addEventListener('click', () => {
    targetX += (Math.random() - 0.5) * 1.2;
    targetY += (Math.random() - 0.5) * 1.2;
  });

  const animate = () => {
    requestAnimationFrame(animate);
    group.rotation.y += (targetX - group.rotation.y) * 0.08;
    group.rotation.x += (targetY - group.rotation.x) * 0.08;

    if (!dragging) {
      group.rotation.y += 0.003;
      group.rotation.x += 0.002;
    }

    renderer.render(scene, camera);
  };

  animate();

  const handleResize = () => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener('resize', handleResize);
  handleResize();
};

// Try to load a fully playable Rubik's cube (cubing.js); if it fails, use Three.js fallback
const initGameCube = async () => {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  try {
    const { TwistyPlayer } = await import('https://js.cubing.net/cubing/twisty/');
    container.innerHTML = '';
    const player = new TwistyPlayer({
      puzzle: '3x3x3',
      background: 'none',
      controlPanel: 'simple',
      hintFacelets: 'none',
      tempo: 'medium',
      stickerColors: {
        U: '#ffffff',
        R: '#ff5800',
        F: '#009b48',
        D: '#ffd500',
        L: '#0046ad',
        B: '#b71234'
      },
      visualization: '3D'
    });
    player.style.width = '100%';
    player.style.height = '100%';
    container.appendChild(player);
  } catch (e) {
    console.warn('TwistyPlayer não carregou; usando fallback Three.js.', e);
    initCube();
  }
};

const bootCube = () => {
  initGameCube();
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootCube();
} else {
  window.addEventListener('DOMContentLoaded', bootCube);
}
