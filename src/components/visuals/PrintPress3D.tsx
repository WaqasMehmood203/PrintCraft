import { RotateCcw, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cn } from '@/lib/utils';

interface PrintPress3DProps {
  className?: string;
}

/** Builds a crisp high-DPI CMYK artwork layer texture for the progressive 4-pass print shader. */
function createLayerTexture(layer: 'c' | 'm' | 'y' | 'k'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (layer === 'c') {
    // Cyan graphic layer + registration bars
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(178, 175, 76, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
    for (let x = 310; x < 450; x += 14) {
      for (let y = 78; y < 140; y += 14) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(42, 326, 92, 16);
  } else if (layer === 'm') {
    // Magenta overlapping circle + geometric accent
    ctx.fillStyle = '#e4237e';
    ctx.beginPath();
    ctx.arc(246, 175, 76, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e4237e';
    ctx.lineWidth = 6;
    ctx.strokeRect(306, 162, 152, 48);
    ctx.fillStyle = '#e4237e';
    ctx.fillRect(142, 326, 92, 16);
  } else if (layer === 'y') {
    // Yellow overlapping circle + highlights
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(212, 232, 74, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(242, 326, 92, 16);
  } else {
    // Key black: crop marks, border, crisp typography & garment emblem
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 464, 336);

    // Corner crop marks
    const corners: [number, number, number, number][] = [
      [14, 24, 1, 1],
      [498, 24, -1, 1],
      [14, 360, 1, -1],
      [498, 360, -1, -1],
    ];
    for (const [cx, cy, sx, sy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 12 * sx, cy);
      ctx.moveTo(cx + 10 * sx, cy - 10 * sy);
      ctx.lineTo(cx + 10 * sx, cy + 2 * sy);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('PRINTCRAFT', 306, 198);
    ctx.font = '600 14px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('CMYK · 300 DPI · PANTONE', 306, 236);
    ctx.fillText('EDITION 01 · FAISALABAD', 306, 258);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(342, 326, 118, 16);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Creates a procedural shader material that reveals C, M, Y, K layers as the sheet passes each tower X position. */
function createSheetMaterial(
  texC: THREE.CanvasTexture,
  texM: THREE.CanvasTexture,
  texY: THREE.CanvasTexture,
  texK: THREE.CanvasTexture,
  towerXs: [number, number, number, number],
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexC: { value: texC },
      uTexM: { value: texM },
      uTexY: { value: texY },
      uTexK: { value: texK },
      uTowerX: { value: new THREE.Vector4(...towerXs) },
      uLightDir: { value: new THREE.Vector3(0.45, 0.85, 0.35).normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexC;
      uniform sampler2D uTexM;
      uniform sampler2D uTexY;
      uniform sampler2D uTexK;
      uniform vec4 uTowerX;
      uniform vec3 uLightDir;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;

      vec3 blendInk(vec3 base, vec4 ink, float mask) {
        float a = ink.a * mask;
        // Subtractive-inspired vivid blend on white paper
        vec3 mult = base * mix(vec3(1.0), ink.rgb * 1.08, a);
        return mix(base, mix(mult, ink.rgb, 0.55), a);
      }

      void main() {
        vec3 paper = vec3(0.97, 0.96, 0.935);
        float x = vWorldPos.x;
        float mC = smoothstep(uTowerX.x - 0.04, uTowerX.x + 0.04, x);
        float mM = smoothstep(uTowerX.y - 0.04, uTowerX.y + 0.04, x);
        float mY = smoothstep(uTowerX.z - 0.04, uTowerX.z + 0.04, x);
        float mK = smoothstep(uTowerX.w - 0.04, uTowerX.w + 0.04, x);

        vec3 col = paper;
        col = blendInk(col, texture2D(uTexC, vUv), mC);
        col = blendInk(col, texture2D(uTexM, vUv), mM);
        col = blendInk(col, texture2D(uTexY, vUv), mY);
        col = blendInk(col, texture2D(uTexK, vUv), mK);

        float diff = max(dot(normalize(vNormalW), uLightDir), 0.0);
        vec3 lit = col * (0.72 + 0.34 * diff);
        gl_FragColor = vec4(lit, 1.0);
      }
    `,
  });
}

export function PrintPress3D({ className }: PrintPress3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fast, setFast] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [activeTower, setActiveTower] = useState(0);

  const fastRef = useRef(fast);
  fastRef.current = fast;
  const resetCamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    const defaultCamPos = new THREE.Vector3(5.6, 7.4, 6.0);
    const defaultTarget = new THREE.Vector3(0, 0.05, 0);
    camera.position.copy(defaultCamPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(defaultTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 15.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.minPolarAngle = 0.35;
    controls.update();

    resetCamRef.current = () => {
      camera.position.copy(defaultCamPos);
      controls.target.copy(defaultTarget);
      controls.update();
    };

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xdbeafe, 0.65));

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x12b5e5, 6, 12);
    cyanRim.position.set(-4.2, 2.4, -2.5);
    scene.add(cyanRim);

    const magentaRim = new THREE.PointLight(0xe4237e, 5.5, 12);
    magentaRim.position.set(4.2, 2.2, 2.6);
    scene.add(magentaRim);

    // Materials
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.72, roughness: 0.34 });
    const frameMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.38 });
    const brushedSteel = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.22 });
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.15, roughness: 0.85 });

    const pressGroup = new THREE.Group();
    scene.add(pressGroup);

    // Subtle reflective stage disc under the machine
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 4.8, 0.06, 64),
      new THREE.MeshStandardMaterial({ color: 0x090d1a, metalness: 0.35, roughness: 0.6 }),
    );
    floor.position.y = -0.78;
    floor.receiveShadow = true;
    pressGroup.add(floor);

    const floorRing = new THREE.Mesh(
      new THREE.RingGeometry(4.74, 4.8, 64),
      new THREE.MeshBasicMaterial({ color: 0x12b5e5, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    );
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = -0.745;
    pressGroup.add(floorRing);

    // Main Conveyor Bed & Side Rails
    const bed = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.22, 2.15), darkMetal);
    bed.position.set(0, -0.32, 0);
    bed.castShadow = true;
    bed.receiveShadow = true;
    pressGroup.add(bed);

    const belt = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.04, 1.56), conveyorMat);
    belt.position.set(0, -0.19, 0);
    belt.receiveShadow = true;
    pressGroup.add(belt);

    // Side structural cheeks
    for (const z of [-1.14, 1.14]) {
      const sidePlate = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.38, 0.12), frameMetal);
      sidePlate.position.set(0, 0.36, z);
      sidePlate.castShadow = true;
      sidePlate.receiveShadow = true;
      pressGroup.add(sidePlate);

      // Brushed steel trim bar
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.2, 16), brushedSteel);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 1.08, z * 0.88);
      pressGroup.add(rail);
    }

    // Conveyor guide rollers at ends
    for (const x of [-3.25, 3.25]) {
      const endRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.66, 20), brushedSteel);
      endRoller.rotation.x = Math.PI / 2;
      endRoller.position.set(x, -0.22, 0);
      pressGroup.add(endRoller);
    }

    // Input & Output paper trays
    const inputStack = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.14, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.75 }),
    );
    inputStack.position.set(-2.78, -0.1, 0);
    inputStack.castShadow = true;
    pressGroup.add(inputStack);

    // 4 CMYK Printing Towers
    const towerXs: [number, number, number, number] = [-1.35, -0.45, 0.45, 1.35];
    const towerColors = [0x12b5e5, 0xe4237e, 0xffc629, 0x1e293b];
    const spinningCylinders: THREE.Mesh[] = [];
    const spinningGears: THREE.Mesh[] = [];
    const towerLeds: THREE.MeshBasicMaterial[] = [];

    towerXs.forEach((x, idx) => {
      const color = towerColors[idx];
      // Lower impression cylinder (metallic)
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.64, 28), brushedSteel);
      lower.rotation.x = Math.PI / 2;
      lower.position.set(x, -0.25, 0);
      pressGroup.add(lower);

      // Upper CMYK Ink Roller
      const inkMat = new THREE.MeshStandardMaterial({
        color,
        metalness: idx === 3 ? 0.45 : 0.2,
        roughness: 0.24,
        emissive: idx === 3 ? 0x000000 : color,
        emissiveIntensity: 0.16,
      });
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.62, 32), inkMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(x, 0.11, 0);
      roller.castShadow = true;
      pressGroup.add(roller);
      spinningCylinders.push(roller);

      // Transfer roller above main cylinder
      const subRoller = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.56, 24), inkMat);
      subRoller.rotation.x = Math.PI / 2;
      subRoller.position.set(x, 0.5, 0);
      subRoller.castShadow = true;
      pressGroup.add(subRoller);
      spinningCylinders.push(subRoller);

      // Side drive gear
      const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 14), brushedSteel);
      gear.rotation.x = Math.PI / 2;
      gear.position.set(x, 0.11, 1.23);
      pressGroup.add(gear);
      spinningGears.push(gear);

      // Ink reservoir bar & glowing status LED
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 1.68), darkMetal);
      bar.position.set(x, 0.76, 0);
      pressGroup.add(bar);

      const ledMat = new THREE.MeshBasicMaterial({ color });
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.06), ledMat);
      led.position.set(x, 0.85, 0.88);
      pressGroup.add(led);
      towerLeds.push(ledMat);
    });

    // Overhead Reciprocating Squeegee / Curing Carriage
    const carriage = new THREE.Group();
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 2.25), darkMetal);
    bridge.position.y = 1.18;
    bridge.castShadow = true;
    carriage.add(bridge);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.65), frameMetal);
    head.position.set(0, 0.96, 0);
    carriage.add(head);

    const uvBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 1.45),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    uvBar.position.set(0, 0.84, 0);
    carriage.add(uvBar);

    pressGroup.add(carriage);

    // Progressive CMYK Paper Sheets moving along the conveyor
    const texC = createLayerTexture('c');
    const texM = createLayerTexture('m');
    const texY = createLayerTexture('y');
    const texK = createLayerTexture('k');
    const sheetMat = createSheetMaterial(texC, texM, texY, texK, towerXs);
    const sheetGeo = new THREE.PlaneGeometry(1.18, 0.88);
    sheetGeo.rotateX(-Math.PI / 2);

    const SHEET_COUNT = 3;
    const sheets: THREE.Mesh[] = [];
    for (let i = 0; i < SHEET_COUNT; i++) {
      const m = new THREE.Mesh(sheetGeo, sheetMat);
      m.position.y = -0.155 + i * 0.002;
      m.receiveShadow = true;
      pressGroup.add(m);
      sheets.push(m);
    }

    // Resize handling
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Animation Loop
    let raf = 0;
    let simTime = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      const speed = fastRef.current ? 2.0 : 1.0;
      simTime += dt * speed;

      // Spin CMYK cylinders & gears
      const angDelta = dt * speed * 3.4;
      for (let i = 0; i < spinningCylinders.length; i++) {
        spinningCylinders[i].rotation.y += i % 2 === 0 ? -angDelta : angDelta * 1.4;
      }
      for (const g of spinningGears) g.rotation.y -= angDelta;

      // Move sheets continuously from intake (-2.75) to output (+2.75)
      const span = 5.5;
      const minX = -2.75;
      let leadSheetX = minX;
      for (let i = 0; i < sheets.length; i++) {
        const phase = ((simTime * 0.32 + i / sheets.length) % 1 + 1) % 1;
        const x = minX + phase * span;
        sheets[i].position.x = x;
        // Subtle lift onto output tray at the end
        sheets[i].position.y = phase > 0.9 ? -0.155 - (phase - 0.9) * 0.18 : -0.155 + i * 0.0015;
        if (i === 0) leadSheetX = x;
      }

      // Update active tower indicator
      let nearestIdx = 0;
      let bestDist = Infinity;
      towerXs.forEach((tx, idx) => {
        const d = Math.abs(leadSheetX - tx);
        if (d < bestDist) {
          bestDist = d;
          nearestIdx = idx;
        }
      });
      setActiveTower((prev) => (prev === nearestIdx ? prev : nearestIdx));

      // Reciprocate carriage head smoothly across the 4 towers
      carriage.position.x = Math.sin(simTime * 1.45) * 1.55;
      head.position.z = Math.cos(simTime * 2.9) * 0.34;

      // Gentle ambient idle float on the press stage when playing
      pressGroup.rotation.y = Math.sin(simTime * 0.25) * 0.06;

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      sheetGeo.dispose();
      sheetMat.dispose();
      texC.dispose();
      texM.dispose();
      texY.dispose();
      texK.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  const channels = [
    { label: 'F', color: 'bg-[#12b5e5]' },
    { label: 'A', color: 'bg-[#e4237e]' },
    { label: 'I', color: 'bg-[#ffc629]' },
    { label: 'Z', color: 'bg-slate-600' },
  ];

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-900/90 to-ink-950 shadow-lift', className)}>
      {/* Top status bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-end px-4 py-3">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/75 px-2.5 py-1 backdrop-blur">
          {channels.map((c, idx) => (
            <span
              key={c.label}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white transition-transform',
                c.color,
                activeTower === idx ? 'scale-115 ring-2 ring-white/80' : 'opacity-60',
              )}
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* WebGL Canvas Mount */}
      {webglError ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center text-white/70">
          <p className="text-sm font-semibold text-white">Interactive 3D FAIZ Press</p>
          <p className="mt-1 text-xs text-white/50">Enable WebGL in your browser to inspect the 3D printing machine.</p>
        </div>
      ) : (
        <div ref={containerRef} className="h-full w-full min-h-[300px] cursor-grab active:cursor-grabbing" aria-label="Interactive 3D FAIZ printing press animation" />
      )}

      {/* Bottom Interactive Controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 px-4 py-3">
        <p className="hidden text-[11px] font-medium text-white/55 sm:block">Drag to rotate · Scroll to zoom</p>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFast((f) => !f)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur transition',
              fast ? 'border-cyan/60 bg-cyan/20 text-cyan' : 'border-white/15 bg-ink-950/80 text-white hover:bg-white/10',
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {fast ? '2×' : '1×'}
          </button>
          <button
            type="button"
            onClick={() => resetCamRef.current?.()}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-ink-950/80 p-1.5 text-white backdrop-blur transition hover:bg-white/10"
            title="Reset 3D camera"
            aria-label="Reset 3D camera"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
