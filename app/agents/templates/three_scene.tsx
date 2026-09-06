import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './styles.css';

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const rotating = useRef(!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [playing, setPlaying] = useState(rotating.current);
  const [color, setColor] = useState('#b8a0ff');
  const [shape, setShape] = useState('knot');
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setFallback(true); return; }
    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x11131c, 0);
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional sculpture');
    element.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 5.8);
    const geometry = shape === 'knot' ? new THREE.TorusKnotGeometry(1, .28, 128, 20) : new THREE.IcosahedronGeometry(1.3, 1);
    const material = new THREE.MeshStandardMaterial({color, metalness: .45, roughness: .28});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh, new THREE.HemisphereLight(0xe6deff, 0x202337, 2.5));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 4, 4); scene.add(light);
    const rim = new THREE.DirectionalLight(0x719dff, 3);
    rim.position.set(-3, 0, -2); scene.add(rim);
    const resize = () => {
      const {width, height} = element.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height); camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let frame = 0, last = 0;
    const animate = (time: number) => {
      const delta = Math.min((time - last) / 1000, .05); last = time;
      if (!document.hidden) {
        if (rotating.current) { mesh.rotation.y += delta * .35; mesh.rotation.x += delta * .12; }
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => { rotating.current = !motion.matches; setPlaying(!motion.matches); };
    motion.addEventListener('change', onMotion);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); motion.removeEventListener('change', onMotion);
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [color, shape]);
  return <main className="scene-app">
    <header><a href="#experience" className="wordmark">FORM / LAB</a><span>Interactive material study</span></header>
    <section className="experience" id="experience">
      <div className="scene-copy"><p className="eyebrow">STUDY 001 / PROCEDURAL OBJECTS</p><h1>A little space<br/>for curiosity.</h1><p>Explore the relationship between shape, light and material. Change the object. Make it yours.</p>
        <fieldset><legend>Choose a form</legend><div className="shape-options"><button aria-pressed={shape === 'knot'} onClick={() => setShape('knot')}>Torus knot</button><button aria-pressed={shape === 'crystal'} onClick={() => setShape('crystal')}>Crystal</button></div></fieldset>
        <label className="color-label">Material color <input type="color" value={color} onChange={event => setColor(event.target.value)} /></label>
        <button className="play-button" onClick={() => { rotating.current = !rotating.current; setPlaying(rotating.current); }}>{playing ? 'Pause rotation' : 'Resume rotation'}</button>
        <p className="scene-note">A local 3D demo. No model-generated assets or external services.</p>
      </div>
      <div className="scene-stage"><div className="canvas-host" ref={host}/>{fallback && <div className="fallback" role="status"><div className="fallback-object" style={{background: color}}/><h2>Your browser cannot display WebGL.</h2><p>The material and shape controls remain available. Try a browser with hardware acceleration for the live sculpture.</p></div>}<div className="scene-caption"><span>{shape === 'knot' ? '01 / Torus knot' : '02 / Crystal'}</span><span>Three.js / Realtime</span></div></div>
    </section><footer>FORM / LAB <span>Built to be explored.</span></footer>
  </main>;
}
