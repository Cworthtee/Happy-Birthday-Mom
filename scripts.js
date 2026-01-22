/* CONFIGURACIÓN: reemplaza las rutas por tus imágenes en /images */
const images = [
  {src:'img1.jpg', alt:'Foto 1', caption:'05/10/2022'},
  {src:'img2.jpg', alt:'Foto 2', caption:'31/05/2015'},
  {src:'img3.jpg', alt:'Foto 3', caption:'30/04/2024'},
  {src:'img4.jpg', alt:'Foto 4', caption:'29/11/2015'},
  {src:'img5.jpg', alt:'Foto 5', caption:'30/04/2023'},
  {src:'img6.jpg', alt:'Foto 6', caption:'23/12/2015'}
];

const inner = document.getElementById('inner');
const carousel = document.getElementById('carousel');
const playPause = document.getElementById('playPause');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const speedInput = document.getElementById('speed');
const tiltInput = document.getElementById('tilt');
const radiusInput = document.getElementById('radius');

let angle = 0; // rotación Y global
let autoRotate = true;
let speed = parseFloat(speedInput.value); // rotación por frame
let tilt = parseFloat(tiltInput.value);
let radius = parseInt(radiusInput.value);
let focusedIndex = -1;
let drag = {active:false, startX:0, startAngle:0};
let rafId = null;

/* Crear items */
function buildCarousel(){
  inner.innerHTML = '';
  const n = images.length;
  for(let i=0;i<n;i++){
    const it = document.createElement('div');
    it.className = 'item';
    it.dataset.index = i;
    const img = document.createElement('img');
    img.src = images[i].src;
    img.alt = images[i].alt || `Imagen ${i+1}`;
    const cap = document.createElement('div');
    cap.className = 'caption';
    cap.textContent = images[i].caption || '';
    it.appendChild(img);
    it.appendChild(cap);
    inner.appendChild(it);

    it.addEventListener('click', ()=> focusOn(i));
  }
  positionItems();
}

/* Posicionar items alrededor del círculo */
function positionItems(){
  const items = inner.children;
  const n = items.length;
  for(let i=0;i<n;i++){
    const theta = 360 / n * i;
    const el = items[i];
    // rotar en Y y trasladar en Z para formar el anillo
    el.style.transform = `rotateY(${theta}deg) translateZ(${radius}px)`;
  }
  updateTransform();
}

/* Actualizar transform del contenedor para rotación e inclinación */
function updateTransform(){
  inner.style.transform = `rotateX(${tilt}deg) rotateY(${angle}deg)`;
  // actualizar variable CSS para radio si se quiere usar en estilos
  document.documentElement.style.setProperty('--radius', radius + 'px');
}

/* Animación automática */
function animate(){
  if(autoRotate){
    angle += speed;
    angle = angle % 360;
    updateTransform();
  }
  rafId = requestAnimationFrame(animate);
}

/* Play/Pause */
playPause.addEventListener('click', ()=>{
  autoRotate = !autoRotate;
  playPause.textContent = autoRotate ? 'Pausar' : 'Reproducir';
  playPause.setAttribute('aria-pressed', String(!autoRotate));
});

/* Next / Prev */
nextBtn.addEventListener('click', ()=> { angle -= 360 / images.length; updateTransform(); });
prevBtn.addEventListener('click', ()=> { angle += 360 / images.length; updateTransform(); });

/* Sliders */
speedInput.addEventListener('input', ()=> { speed = parseFloat(speedInput.value); });
tiltInput.addEventListener('input', ()=> { tilt = parseFloat(tiltInput.value); updateTransform(); });
radiusInput.addEventListener('input', ()=> { radius = parseInt(radiusInput.value); positionItems(); });

/* Pause on hover */
carousel.addEventListener('mouseenter', ()=> { autoRotate = false; playPause.textContent = 'Reproducir'; });
carousel.addEventListener('mouseleave', ()=> { autoRotate = true; playPause.textContent = 'Pausar'; });

/* Drag to rotate */
carousel.addEventListener('pointerdown', (e)=>{
  drag.active = true;
  drag.startX = e.clientX;
  drag.startAngle = angle;
  carousel.setPointerCapture(e.pointerId);
});
window.addEventListener('pointermove', (e)=>{
  if(!drag.active) return;
  const dx = e.clientX - drag.startX;
  angle = drag.startAngle + dx * 0.3;
  updateTransform();
});
window.addEventListener('pointerup', (e)=>{
  drag.active = false;
});

/* Focus on clicked item */
function focusOn(index){
  const n = images.length;
  // calcular ángulo para traer el índice a 0 grados (frente)
  const targetTheta = (360 / n) * index;
  // queremos que rotateY sea -targetTheta (o equivalente)
  angle = -targetTheta;
  updateTransform();
  setFocus(index);
}

/* Visual focus styling */
function setFocus(index){
  const items = inner.children;
  for(let i=0;i<items.length;i++){
    items[i].classList.toggle('focus', Number(items[i].dataset.index) === index);
  }
  focusedIndex = index;
}

/* Keyboard navigation */
carousel.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft'){ angle += 360 / images.length; updateTransform(); }
  if(e.key === 'ArrowRight'){ angle -= 360 / images.length; updateTransform(); }
  if(e.key === ' '){ autoRotate = !autoRotate; playPause.textContent = autoRotate ? 'Pausar' : 'Reproducir'; }
});

/* Accessibility: pause with focus out */
window.addEventListener('blur', ()=> { autoRotate = false; playPause.textContent = 'Reproducir'; });

//musica
/* ===== Música de fondo / playlist ===== */
const playlist = [
  {src: 'track1.mp3', title: 'Canción 1'},
  {src: 'track2.mp3', title: 'Canción 2'},
  {src: 'track3.mp3', title: 'Canción 3'}
];

let musicIndex = 0;
const audio = new Audio();
audio.preload = 'metadata';
audio.src = playlist[musicIndex].src;
audio.loop = false;
audio.volume = 0.7;

const musicToggle = document.getElementById('musicToggle');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');
const musicVol = document.getElementById('musicVol');
const musicMute = document.getElementById('musicMute');
const musicLoop = document.getElementById('musicLoop');
const musicProgress = document.getElementById('musicProgress');

let musicPlaying = false;
let musicMuted = false;
let musicLooping = false;
let progressUpdater = null;

function loadTrack(index){
  musicIndex = (index + playlist.length) % playlist.length;
  audio.src = playlist[musicIndex].src;
  audio.load();
  updateMusicUI();
}

function playMusic(){
  audio.play().then(()=>{
    musicPlaying = true;
    musicToggle.textContent = '⏸ Pausar música';
    musicToggle.setAttribute('aria-pressed','true');
    startProgressUpdater();
  }).catch(()=> {
    // Autoplay puede bloquearse; el usuario debe interactuar
    musicPlaying = false;
    musicToggle.textContent = '🎵 Reproducir música';
  });
}

function pauseMusic(){
  audio.pause();
  musicPlaying = false;
  musicToggle.textContent = '🎵 Reproducir música';
  musicToggle.setAttribute('aria-pressed','false');
  stopProgressUpdater();
}

musicToggle.addEventListener('click', ()=>{
  if(musicPlaying) pauseMusic(); else playMusic();
});

musicPrev.addEventListener('click', ()=>{
  loadTrack(musicIndex - 1);
  if(musicPlaying) playMusic();
});

musicNext.addEventListener('click', ()=>{
  loadTrack(musicIndex + 1);
  if(musicPlaying) playMusic();
});

musicVol.addEventListener('input', ()=> {
  audio.volume = parseFloat(musicVol.value);
  musicMuted = audio.volume === 0;
  musicMute.textContent = musicMuted ? '🔇' : '🔈';
});

musicMute.addEventListener('click', ()=>{
  musicMuted = !musicMuted;
  if(musicMuted){
    audio.dataset._prevVol = audio.volume;
    audio.volume = 0;
    musicVol.value = 0;
    musicMute.textContent = '🔇';
  } else {
    const prev = parseFloat(audio.dataset._prevVol || 0.7);
    audio.volume = prev;
    musicVol.value = prev;
    musicMute.textContent = '🔈';
  }
});

musicLoop.addEventListener('click', ()=>{
  musicLooping = !musicLooping;
  audio.loop = musicLooping;
  musicLoop.style.opacity = musicLooping ? '1' : '0.6';
});

audio.addEventListener('ended', ()=>{
  if(!audio.loop){
    loadTrack(musicIndex + 1);
    playMusic();
  }
});

audio.addEventListener('loadedmetadata', ()=>{
  musicProgress.max = Math.floor(audio.duration || 0);
});

musicProgress.addEventListener('input', ()=>{
  audio.currentTime = parseFloat(musicProgress.value);
  updateMusicUI();
});

audio.addEventListener('timeupdate', updateMusicUI);

function updateMusicUI(){
  musicProgress.value = Math.floor(audio.currentTime || 0);
}

/* Progress updater to keep UI smooth */
function startProgressUpdater(){
  if(progressUpdater) return;
  progressUpdater = setInterval(()=> {
    updateMusicUI();
  }, 500);
}
function stopProgressUpdater(){
  if(progressUpdater){ clearInterval(progressUpdater); progressUpdater = null; }
}

/* Opcional: pausar música cuando el carrusel está en hover */
carousel.addEventListener('mouseenter', ()=> {
  // si quieres que la música se pause al pasar el ratón, descomenta:
  // if(musicPlaying) { audio.pause(); audio._wasPlaying = true; }
});
carousel.addEventListener('mouseleave', ()=> {
  // si quieres que la música se reanude al salir, descomenta:
  // if(audio._wasPlaying) { audio.play(); audio._wasPlaying = false; }
});

/* Inicial UI */
updateMusicUI();


/* Inicialización */
buildCarousel();
updateTransform();
animate();

/* Mejora visual: ajustar z-index según proximidad al frente */
function updateZIndices(){
  const items = Array.from(inner.children);
  const n = items.length;
  items.forEach(it=>{
    // calcular ángulo relativo del item
    const idx = Number(it.dataset.index);
    const theta = (360 / n) * idx;
    // ángulo absoluto del item en el espacio (considerando rotation)
    const abs = ((theta + angle) % 360 + 360) % 360;
    // cercanía al frente (0 o 360)
    const dist = Math.min(Math.abs(abs), Math.abs(360 - abs));
    // menor dist => más al frente
    const z = Math.round(100 - dist);
    it.style.zIndex = String(z);
    // opacidad sutil
    const op = 0.35 + (1 - dist / 180) * 0.65;
    it.style.opacity = String(Math.max(0.25, Math.min(1, op)));
  });
}
setInterval(updateZIndices, 120);