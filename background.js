// ===== THREE.JS SCENE SETUP =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// Make sure the background canvas covers the full window
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
document.body.appendChild(renderer.domElement);

// ===== STARFIELD BACKGROUND =====
const starGeometry = new THREE.BufferGeometry();
const starCount = 2500;
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 3000;
  const y = (Math.random() - 0.5) * 3000;
  const z = (Math.random() - 0.5) * 3000;
  starPositions.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1.2,
  transparent: true,
  opacity: 1.0,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ===== GLOWING 3D ENERGY SPHERE =====
const lineGroup = new THREE.Group();
const sphereRadius = 6;
const lineCount = 80; // number of energy lines

function createEnergyLine(radius, color, speed, direction) {
  const points = [];
  const detail = 80;
  const tilt = Math.random() * Math.PI;
  const twist = Math.random() * Math.PI * 2;

  for (let i = 0; i <= detail; i++) {
    const theta = (i / detail) * Math.PI * 2;
    const x = radius * Math.sin(tilt) * Math.cos(theta);
    const y = radius * Math.cos(tilt) + Math.sin(theta * 2) * 0.3;
    const z = radius * Math.sin(tilt) * Math.sin(theta);
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.7,
    linewidth: 2,
  });

  const line = new THREE.LineLoop(geometry, material);
  line.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  line.userData = { speed, direction };
  lineGroup.add(line);
}

// ===== CREATE ENERGY LAYERS =====
const colors = [0xff33cc, 0xaa66ff, 0x3399ff]; // pink, purple, blue
for (let i = 0; i < lineCount; i++) {
  const color = colors[i % colors.length];
  const speed = 0.001 + Math.random() * 0.002;
  const dir = ["clockwise", "counter", "updown"][i % 3];
  createEnergyLine(sphereRadius + Math.random() * 0.3, color, speed, dir);
}

scene.add(lineGroup);
camera.position.z = 20;

// ===== LIGHTING =====
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const pointLight = new THREE.PointLight(0xff88ff, 2, 50);
pointLight.position.set(0, 0, 20);
scene.add(pointLight);

// ===== ANIMATION LOOP =====
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  // soft star motion
  stars.rotation.y += 0.0002;
  stars.rotation.x += 0.0001;

  // animate lines on the sphere
  lineGroup.children.forEach((line, i) => {
    const { speed, direction } = line.userData;
    if (direction === "clockwise") line.rotation.y += speed;
    else if (direction === "counter") line.rotation.y -= speed;
    else if (direction === "updown") {
      line.rotation.x = Math.sin(time * 0.5 + i) * 0.4;
      line.rotation.z = Math.cos(time * 0.3 + i) * 0.4;
    }
  });

  // calm pulsing motion
  const pulse = 1 + Math.sin(time * 0.8) * 0.05;
  lineGroup.scale.set(pulse, pulse, pulse);
  lineGroup.rotation.y += 0.001;

  renderer.render(scene, camera);
}

animate();

// ===== HANDLE RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
