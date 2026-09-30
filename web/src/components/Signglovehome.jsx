// SignGloveHome.jsx  (single file)
// Install:  npm i three gsap
// Use:      import SignGloveHome from "./SignGloveHome";  ->  <SignGloveHome />
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap");
body{margin:0}
.sg{--bg1:#2a3540;--bg2:#12161b;--tx:#ece8df;--mu:#a3adb8;--or:#e0782c;--pn:rgba(18,22,27,.78);
 color-scheme:dark;background:radial-gradient(120% 90% at 70% 30%,var(--bg1),var(--bg2));background-color:var(--bg2);
 color:var(--tx);font-family:"Bricolage Grotesque",system-ui,-apple-system,"Segoe UI",sans-serif}
.sg *,.sg *::before,.sg *::after{box-sizing:border-box}
.sg-stage{position:fixed;inset:0;z-index:0}
.sg-stage canvas{display:block}
.sg header{position:fixed;top:0;left:0;z-index:5;padding:18px clamp(20px,4vw,48px) 0;font-weight:800;font-size:1.05rem;letter-spacing:.01em}
.sg-hud{position:fixed;top:0;right:0;z-index:5;padding:16px clamp(16px,4vw,48px) 0;width:190px;font-size:.78rem;color:var(--mu)}
.sg-hud b{display:block;color:var(--tx);font-size:1.5rem;font-weight:800;margin-bottom:6px;min-height:1.6rem}
.sg .bar{display:flex;align-items:center;gap:8px;margin-top:5px}
.sg .bar span{width:46px}
.sg .bar i{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}
.sg .bar u{display:block;height:100%;width:0;background:var(--or)}
.sg-track{position:relative;z-index:2}
.sg section{min-height:100vh;min-height:100svh;display:flex;align-items:center}
.sg .card{width:min(460px,88vw);margin-left:clamp(20px,7vw,110px);opacity:0;transform:translateY(20px);transition:opacity .6s,transform .6s}
.sg section.on .card{opacity:1;transform:none}
.sg h1{font-size:clamp(2.7rem,6.4vw,5.2rem);line-height:.98;margin:0 0 18px;font-weight:800;letter-spacing:-.02em}
.sg h2{font-size:clamp(1.8rem,3.6vw,2.9rem);line-height:1.05;margin:0 0 14px;font-weight:800;letter-spacing:-.015em}
.sg p{margin:0 0 22px;color:var(--mu);font-size:1.06rem;line-height:1.6;max-width:44ch}
.sg .btns{display:flex;gap:12px;flex-wrap:wrap}
.sg .btn{display:inline-block;padding:13px 22px;border-radius:999px;font:600 1rem "Bricolage Grotesque",system-ui,sans-serif;text-decoration:none;color:var(--tx);border:1.5px solid rgba(255,255,255,.28)}
.sg .btn.p{background:var(--or);border-color:var(--or);color:#1a1108}
.sg .btn:hover{filter:brightness(1.12)}
.sg .btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
.sg .last{align-items:flex-end;justify-content:center}
.sg .last .card{margin:0 auto 10vh;text-align:center}
.sg .last p{margin-inline:auto}
.sg .last .btns{justify-content:center}
@media(max-width:800px){
 .sg section{align-items:flex-end}
 .sg .card{margin:0 auto 5vh;background:var(--pn);backdrop-filter:blur(10px);padding:20px;border-radius:16px}
 .sg .last .card{margin-bottom:5vh}
 .sg-hud{width:150px}.sg .bar span{width:40px}
}
@media(prefers-reduced-motion:reduce){.sg .card{transition:none}}
`;

const FINGER_NAMES = ["Index", "Middle", "Ring", "Pinky"];
// finger bend: 0 = straight, 1 = curled
const SIGNS = [
  ["HELLO", [0, 0, 0, 0]],
  ["YES", [1, 1, 1, 1]],
  ["I", [1, 1, 1, 0]],
  ["WATER", [0, 0, 0, 1]],
  ["LOVE", [0, 1, 1, 0]],
];

export default function SignGloveHome() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const wordRef = useRef(null);
  const barRefs = useRef([]);

  useEffect(() => {
    const mobile = innerWidth < 800;
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    stageRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
    cam.position.set(0, 0, 10);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x4a6bff, 1.3, 30);
    rim.position.set(-5, 2, -3);
    scene.add(rim);

    const M = (c, r = 0.8, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const fabric = M(0xeeeae2, 0.95);
    const black = M(0x1a1c20, 0.7);

    const stripTex = (() => {
      const c = document.createElement("canvas");
      c.width = 64; c.height = 256;
      const x = c.getContext("2d");
      x.fillStyle = "#d9772b"; x.fillRect(0, 0, 64, 256);
      x.fillStyle = "#5a3a1e";
      for (let y = 6; y < 256; y += 10) x.fillRect(12, y, 40, 4);
      return new THREE.CanvasTexture(c);
    })();
    const sensorMat = new THREE.MeshStandardMaterial({ map: stripTex, roughness: 0.5, emissive: 0xe0782c, emissiveIntensity: 0 });

    const R = new THREE.Group();
    const G = new THREE.Group();
    R.add(G);
    scene.add(R);
    G.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.3, 0.42), fabric));
    const cuff = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.5), black);
    cuff.position.y = -1.6;
    G.add(cuff);

    // fingers
    const fingers = [];
    function finger(x, y, len, thumb) {
      const p = new THREE.Group();
      p.position.set(x, y, 0);
      G.add(p);
      const r = 0.25, l1 = len * 0.55, l2 = len * 0.45;
      const seg = (l, par) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 20), fabric);
        m.position.y = l / 2;
        par.add(m);
        par.add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), fabric));
        if (!thumb) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(0.17, l * 0.86, 0.03), sensorMat);
          s.position.set(0, l / 2, r + 0.01);
          par.add(s);
        }
      };
      seg(l1, p);
      const q = new THREE.Group();
      q.position.y = l1;
      p.add(q);
      seg(l2, q);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), fabric);
      tip.position.y = l2;
      q.add(tip);
      const f = { p, q, b: thumb ? 0.15 : 0, thumb };
      fingers.push(f);
      return f;
    }
    [[-0.9, 1.7], [-0.3, 1.95], [0.3, 1.8], [0.9, 1.4]].forEach(([x, l]) => finger(x, 1.15, l));
    finger(-1.2, -0.45, 1.3, true).p.rotation.z = 0.95;
    const hand = fingers.filter((f) => !f.thumb);

    // LCD
    const lc = document.createElement("canvas");
    lc.width = 320; lc.height = 96;
    const lx = lc.getContext("2d");
    const lt = new THREE.CanvasTexture(lc);
    const lcd = (a, b) => {
      lx.fillStyle = "#2b46d8"; lx.fillRect(0, 0, 320, 96);
      lx.fillStyle = "#dfe8ff";
      lx.font = 'bold 30px "Courier New",monospace';
      lx.textBaseline = "middle";
      lx.fillText(a.padEnd(16).slice(0, 16), 10, 26);
      lx.fillText(b.padEnd(16).slice(0, 16), 10, 68);
      lt.needsUpdate = true;
    };
    lcd("SIGN TO TEXT", "READY");
    const L = new THREE.Group();
    L.position.set(0, 0.1, 0.24);
    G.add(L);
    L.add(new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.85, 0.06), M(0x1f6b3a, 0.6)));
    const lcdMat = new THREE.MeshBasicMaterial({ map: lt });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.53), lcdMat);
    scr.position.z = 0.04;
    L.add(scr);
    const bp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.05), black);
    bp.position.set(0, 0.55, 0.02);
    L.add(bp);
    const pot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.07), M(0x2d6cff, 0.5));
    pot.position.set(-0.3, 0.55, 0.04);
    L.add(pot);

    // Arduino Nano
    const nanoMat = new THREE.MeshStandardMaterial({ color: 0x1b3d8f, roughness: 0.5, emissive: 0x2a5cff, emissiveIntensity: 0 });
    const N = new THREE.Group();
    N.position.set(0, -0.95, 0.24);
    G.add(N);
    N.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.06), nanoMat));
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.05), black);
    chip.position.z = 0.05;
    N.add(chip);
    [0.21, -0.21].forEach((y) => {
      const pn = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.07), M(0xc9a94a, 0.3, 0.8));
      pn.position.set(0, y, 0.04);
      N.add(pn);
    });
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.12), M(0xbfc4cc, 0.3, 0.9));
    usb.position.set(0.8, 0, 0.05);
    N.add(usb);

    // wires from sensors to the Nano
    [[-0.9, 0x7a3fc0, -1.1, -0.5], [-0.3, 0x2fae4a, -1.15, -0.2], [0.3, 0xf0c020, 1.1, 0.2], [0.9, 0xf4f4f4, 1.15, 0.5]].forEach(([x, c, sx, nx]) => {
      const pts = [[x, 1.12, 0.25], [x, 0.95, 0.26], [sx, 0.75, 0.26], [sx, -0.45, 0.26], [nx, -0.68, 0.27]].map((a) => new THREE.Vector3(...a));
      G.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.028, 6), M(c, 0.6)));
    });

    // gsap: sign loop + scroll choreography (context = automatic cleanup)
    let hl = "";
    const ctx = gsap.context(() => {
      const play = (i) => {
        const [w, b] = SIGNS[i % SIGNS.length];
        const tl = gsap.timeline({ onComplete: () => play(i + 1) });
        hand.forEach((f, k) => tl.to(f, { b: b[k], duration: 0.7, ease: "power2.inOut" }, 0));
        tl.call(() => {
          lcd("SIGN TO TEXT", w);
          if (wordRef.current) wordRef.current.textContent = w;
        }, null, 0.7);
        tl.to({}, { duration: 1.5 });
      };
      if (!rm) play(0);

      const X = mobile ? 0 : innerWidth > 1000 ? 2.3 : 1.9;
      const Y = mobile ? 0.9 : 0;
      const S = mobile ? 0.68 : 1;
      const st = [
        { x: X, y: Y, rx: -0.55, ry: -0.45, rz: 0.1, s: S },
        { x: X, y: Y - 1.5 * S, rx: -0.85, ry: 0.35, rz: 0, s: 1.1 * S },
        { x: X, y: Y - 0.15, rx: -0.12, ry: 0.12, rz: 0, s: 1.4 * S },
        { x: X, y: Y + 1.3 * S, rx: -0.7, ry: -0.5, rz: 0.05, s: 1.35 * S },
        { x: 0, y: mobile ? 1.1 : 0.9, rx: -0.3, ry: Math.PI * 2 - 0.4, rz: 0, s: 0.8 * S },
      ];
      const s0 = st[0];
      G.position.set(s0.x, s0.y, 0);
      G.rotation.set(s0.rx, s0.ry, s0.rz);
      G.scale.setScalar(s0.s);

      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: { trigger: ".sg-track", start: "top top", end: "bottom bottom", scrub: rm ? true : 1 },
      });
      st.slice(1).forEach((s, i) => {
        tl.to(G.position, { x: s.x, y: s.y, duration: 1 }, i);
        tl.to(G.rotation, { x: s.rx, y: s.ry, z: s.rz, duration: 1 }, i);
        tl.to(G.scale, { x: s.s, y: s.s, z: s.s, duration: 1 }, i);
      });

      gsap.utils.toArray(".sg section").forEach((sec) =>
        ScrollTrigger.create({
          trigger: sec,
          start: "top 55%",
          end: "bottom 55%",
          toggleClass: { targets: sec, className: "on" },
          onToggle: (self) => { if (self.isActive) hl = sec.dataset.hl; },
        })
      );
    }, rootRef);

    // render loop
    const px = { x: 0, y: 0 };
    const onMove = (e) => { px.x = e.clientX / innerWidth - 0.5; px.y = e.clientY / innerHeight - 0.5; };
    const onResize = () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    };
    addEventListener("pointermove", onMove);
    addEventListener("resize", onResize);

    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      R.rotation.y += ((rm ? 0 : Math.sin(t * 0.6) * 0.18) + px.x * 0.35 - R.rotation.y) * 0.06;
      R.rotation.x += (px.y * 0.15 - R.rotation.x) * 0.06;
      R.position.y = rm ? 0 : Math.sin(t * 1.2) * 0.06;
      fingers.forEach((f) => {
        f.p.rotation.x = -f.b * 1.25;
        f.q.rotation.x = -f.b * 1.45;
      });
      hand.forEach((f, k) => {
        const bar = barRefs.current[k];
        if (bar) bar.style.width = (f.b * 100).toFixed(0) + "%";
      });
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      sensorMat.emissiveIntensity = hl === "sensors" ? 0.15 + 0.4 * pulse : 0;
      nanoMat.emissiveIntensity = hl === "nano" ? 0.2 + 0.5 * pulse : 0;
      lcdMat.color.setScalar(hl === "lcd" ? 1.15 + 0.2 * pulse : 1);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      ctx.revert();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      stripTex.dispose();
      lt.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="sg" ref={rootRef}>
      <style>{CSS}</style>
      <header>Sign-to-Text Glove</header>
      <aside className="sg-hud" aria-label="Live flex sensor readout">
        <b ref={wordRef}>READY</b>
        {FINGER_NAMES.map((n, i) => (
          <div className="bar" key={n}>
            <span>{n}</span>
            <i><u ref={(el) => (barRefs.current[i] = el)} /></i>
          </div>
        ))}
      </aside>
      <div className="sg-stage" ref={stageRef} aria-hidden="true" />

      <main className="sg-track">
        <section data-hl="">
          <div className="card">
            <h1>Signs in. Words out.</h1>
            <p>A glove that reads how your fingers bend and turns each sign into text, on the glove and in your browser.</p>
            <div className="btns">
              <a className="btn p" href="#s1">See how it works</a>
              <a className="btn" href="#app">Open the web app</a>
            </div>
          </div>
        </section>

        <section id="s1" data-hl="sensors">
          <div className="card">
            <h2>Four flex sensors read every bend</h2>
            <p>One sensor runs along each finger, index to pinky. When a finger curls, the sensor's resistance changes and the Arduino reads it as a number from 0 to 1023.</p>
          </div>
        </section>

        <section data-hl="lcd">
          <div className="card">
            <h2>The word appears as you sign it</h2>
            <p>A 16×2 LCD on the back of the hand shows the recognised text. An I²C backpack keeps the wiring to four wires.</p>
          </div>
        </section>

        <section data-hl="nano">
          <div className="card">
            <h2>An Arduino Nano does the matching</h2>
            <p>It samples the four sensors, matches the finger pattern to a sign, and sends the text to the display and over serial to the web app.</p>
          </div>
        </section>

        <section className="last" id="app" data-hl="">
          <div className="card">
            <h2>Read it in your browser</h2>
            <p>The web app receives text from the glove and shows it live, ready to read aloud or share.</p>
            <div className="btns">
              <a className="btn p" href="/app">Launch the web app</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}