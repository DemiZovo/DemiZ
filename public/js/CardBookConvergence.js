import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const DEFAULTS = {
  cardCount: 157,
  cardWidth: 0.72,
  cardHeight: 1.08,
  flyDistance: 8,
  duration: 2400,
  delayMin: 0,
  delayMax: 1800,
  perspective: 42,
  antialias: true,
  pixelRatioCap: 1.75,
  textureCellWidth: 96,
  textureCellHeight: 144,
  idleFps: 4,
  autoStart: true,
  reducedMotion: true,
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;

function makePlaceholder(index, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const palettes = [['#f6e5dc', '#7b2943'], ['#f6ecd0', '#b1762d'], ['#e5edf7', '#607e9c']];
  const [paper, ink] = palettes[index % palettes.length];
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, width - 10, height - 10);
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.font = '24px Georgia, serif';
  ctx.fillText('✦', width / 2, height * 0.44);
  ctx.font = '600 9px sans-serif';
  ctx.fillText(`CARD ${String(index + 1).padStart(3, '0')}`, width / 2, height * 0.72);
  return canvas;
}

function loadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function createAtlas(urls, count, cellWidth, cellHeight) {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const canvas = document.createElement('canvas');
  canvas.width = columns * cellWidth;
  canvas.height = rows * cellHeight;
  const ctx = canvas.getContext('2d', { alpha: true });
  const images = await Promise.all(Array.from({ length: count }, (_, i) => loadImage(urls[i % Math.max(urls.length, 1)])));

  images.forEach((image, index) => {
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    const source = image || makePlaceholder(index, cellWidth, cellHeight);
    ctx.fillStyle = '#f8eee7';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    const scale = Math.min(cellWidth / source.width, cellHeight / source.height);
    const width = source.width * scale;
    const height = source.height * scale;
    ctx.drawImage(source, x + (cellWidth - width) / 2, y + (cellHeight - height) / 2, width, height);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return { texture, columns, rows };
}

/**
 * High-performance card convergence animation. One InstancedMesh is used for every card.
 * @param {HTMLElement|string} target mount element or selector
 * @param {Partial<typeof DEFAULTS> & { textureUrls?: string[], onComplete?: Function }} options
 */
export class CardBookConvergence {
  constructor(target, options = {}) {
    this.container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!(this.container instanceof HTMLElement)) throw new Error('CardBookConvergence: mount container not found.');
    this.config = { ...DEFAULTS, ...options };
    this.textureUrls = Array.isArray(options.textureUrls) ? options.textureUrls.filter(Boolean) : [];
    this.onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
    this.states = [];
    this.running = false;
    this.destroyed = false;
    this.hidden = document.hidden;
    this.raf = 0;
    this.lastIdleRender = 0;
    this.clockStart = 0;
    this.dummy = new THREE.Object3D();
    this.initPromise = this.init();
    if (this.config.autoStart) this.initPromise.then(() => this.restart());
  }

  async init() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: this.config.antialias, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.config.pixelRatioCap));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.prepend(renderer.domElement);
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.config.perspective, 1, 0.1, 100);
    this.camera.position.z = 10;

    const atlas = await createAtlas(this.textureUrls, this.config.cardCount, this.config.textureCellWidth, this.config.textureCellHeight);
    if (this.destroyed) { atlas.texture.dispose(); return; }
    this.texture = atlas.texture;
    this.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    this.texture.needsUpdate = true;
    const geometry = new THREE.PlaneGeometry(this.config.cardWidth, this.config.cardHeight);
    const offsets = new Float32Array(this.config.cardCount * 2);
    const scales = new Float32Array(this.config.cardCount * 2);
    const opacities = new Float32Array(this.config.cardCount).fill(1);
    for (let i = 0; i < this.config.cardCount; i += 1) {
      offsets[i * 2] = (i % atlas.columns) / atlas.columns;
      offsets[i * 2 + 1] = 1 - (Math.floor(i / atlas.columns) + 1) / atlas.rows;
      scales[i * 2] = 1 / atlas.columns;
      scales[i * 2 + 1] = 1 / atlas.rows;
    }
    geometry.setAttribute('atlasOffset', new THREE.InstancedBufferAttribute(offsets, 2));
    geometry.setAttribute('atlasScale', new THREE.InstancedBufferAttribute(scales, 2));
    geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacities, 1));
    const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec2 atlasOffset; attribute vec2 atlasScale; attribute float instanceOpacity; varying vec2 vAtlasUv; varying float vInstanceOpacity;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvAtlasUv = atlasOffset + uv * atlasScale; vInstanceOpacity = instanceOpacity;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vAtlasUv; varying float vInstanceOpacity;')
        .replace('#include <map_fragment>', 'diffuseColor *= texture2D(map, vAtlasUv);')
        .replace('#include <alphatest_fragment>', 'diffuseColor.a *= vInstanceOpacity;\n#include <alphatest_fragment>');
    };
    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.InstancedMesh(geometry, material, this.config.cardCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.visibilityHandler = () => { this.hidden = document.hidden; if (!this.hidden) this.requestFrame(); };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.resize();
    this.resetStates();
  }

  resetStates() {
    const { cardCount, flyDistance, delayMin, delayMax } = this.config;
    this.states = Array.from({ length: cardCount }, (_, index) => {
      const side = index % 4;
      const spreadX = (Math.random() - 0.5) * flyDistance * 1.5;
      const spreadY = (Math.random() - 0.5) * flyDistance;
      const edge = flyDistance * (0.72 + Math.random() * 0.55);
      return {
        start: new THREE.Vector3(side === 0 ? -edge : side === 1 ? edge : spreadX, side === 2 ? edge : side === 3 ? -edge : spreadY, (Math.random() - 0.5) * 5),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2),
        spin: 1.6 + Math.random() * 4,
        delay: lerp(delayMin, delayMax, Math.random()),
      };
    });
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  async restart() {
    await this.initPromise;
    if (this.destroyed) return;
    this.resetStates();
    this.clockStart = performance.now();
    this.running = true;
    this.container.dataset.animationState = 'running';
    this.requestFrame();
  }

  requestFrame() {
    if (!this.raf && !this.hidden && !this.destroyed) this.raf = requestAnimationFrame((time) => this.tick(time));
  }

  tick(now) {
    this.raf = 0;
    if (this.hidden || this.destroyed) return;
    if (!this.running) {
      if (now - this.lastIdleRender >= 1000 / this.config.idleFps) { this.render(); this.lastIdleRender = now; }
      return;
    }
    const elapsed = now - this.clockStart;
    let completed = 0;
    const opacity = this.geometry.getAttribute('instanceOpacity');
    this.states.forEach((state, index) => {
      const raw = Math.max(0, Math.min(1, (elapsed - state.delay) / this.config.duration));
      const travel = easeOutCubic(raw);
      const absorb = Math.max(0, (raw - 0.72) / 0.28);
      const scale = Math.max(0.001, 1 - absorb);
      this.dummy.position.copy(state.start).multiplyScalar(1 - travel);
      this.dummy.rotation.set(state.rotation.x * (1 - travel), state.rotation.y + state.spin * raw, state.rotation.z * (1 - travel));
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(index, this.dummy.matrix);
      opacity.setX(index, 1 - absorb);
      if (raw >= 1) completed += 1;
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    opacity.needsUpdate = true;
    this.render();
    if (completed === this.config.cardCount) {
      this.running = false;
      this.container.dataset.animationState = 'complete';
      const detail = { count: this.config.cardCount };
      this.container.dispatchEvent(new CustomEvent('cardbookcomplete', { detail }));
      this.onComplete?.(detail);
      return;
    }
    this.requestFrame();
  }

  render() { if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera); }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.scene?.remove(this.mesh);
    this.geometry?.dispose();
    this.material?.dispose();
    this.texture?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.domElement.remove();
    this.states = [];
  }
}

export default CardBookConvergence;
