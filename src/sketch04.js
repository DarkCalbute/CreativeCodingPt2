const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const eases = require('eases');
const colormap = require('colormap');

document.body.style.backgroundColor = '#232323';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const particles = [];

const cursor = {x: 9999, y: 9999};

const colors = colormap({
  colormap: 'viridis',
  nshades: 20
});

let canvasRef;
let imgA;

const sketch = ({ width, height, canvas }) => {
  let x, y, radius;

  const imgACanvas = document.createElement('canvas');
  const imgAContext = imgACanvas.getContext('2d');

  imgACanvas.width = canvas.width;
  imgACanvas.height = canvas.height;

  imgAContext.drawImage(imgA, 0, 0);

  const imgAData = imgAContext.getImageData(0, 0, imgA.width, imgA.height).data;

  const nbCircles = 30;
  const gapCircle = 2;
  const gapDot = 2;
  let dotRadius = 12;
  let circRadius = 0;
  const fitRadius = dotRadius;

  canvasRef = canvas;
  canvas.addEventListener('mousedown', onMouseDown);

  for (let i = 0; i < nbCircles; i++) {
    const circumference = Math.PI * 2 * circRadius;
    const nbFit = i != 0 ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
    const fitSlice = Math.PI * 2 / nbFit;
    let ix, iy, idx, r, g, b, colA;

    for (let j = 0; j < nbFit; j++) {
      const theta = fitSlice * j;

      x = Math.cos(theta) * circRadius;
      y = Math.sin(theta) * circRadius;

      x += width * 0.5;
      y += height * 0.5;

      ix = Math.floor((x / width) * imgA.width);
      iy = Math.floor((y / height) * imgA.height);
      idx = (iy * imgA.width + ix) * 4;

      r = imgAData[idx];
      g = imgAData[idx + 1];
      b = imgAData[idx + 2];
      colA = `rgb(${r}, ${g}, ${b})`;

      //radius = dotRadius;
      radius = math.mapRange(r, 0, 255, 1, 12);

      particles.push(new Particle({x, y, radius, colA}))
    }

    circRadius += fitRadius * 2 + gapCircle;
    dotRadius = (1 - eases.quadOut(i / nbCircles)) * fitRadius;
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    //context.drawImage(imgACanvas, 0, 0);

    particles.sort((a, b) => a.scale - b.scale);

    particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });
  };
};

const onMouseDown = (e) => {
  canvasRef.addEventListener('mousemove', onMouseMove);
  canvasRef.addEventListener('mouseup', onMouseUp);

  onMouseMove(e);
}

const onMouseMove = (e) => {
  // real position on canva scale
  const x = (e.offsetX / canvasRef.offsetWidth) * canvasRef.width;
  const y = (e.offsetY / canvasRef.offsetHeight) * canvasRef.height;

  cursor.x = x;
  cursor.y = y;
}

const onMouseUp = (e) => {
  canvasRef.removeEventListener('mousemove', onMouseMove);
  canvasRef.removeEventListener('mouseup', onMouseUp);
  
  cursor.x = 9999;
  cursor.y = 9999;
}

const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image;

    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}

const start = async () => {
  imgA = await loadImage("../ressource/deer.png");

  canvasSketch(sketch, settings);
}

start();

class Particle {
  constructor({x, y, radius = 10, colA}) {
    // position
    this.x = x;
    this.y = y;

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // velocity
    this.vx = 0;
    this.vy = 0;

    // initial pos
    this.ix = x;
    this.iy = y;

    this.radius = radius;
    this.scale = 1;
    this.color = colA;

    this.minDist = random.range(100, 200);
    this.pushFactor = random.range(0.01, 0.02);
    this.pullFactor = random.range(0.002, 0.006);
    this.dampFactor = random.range(0.90, 0.95);
  }

  update() {
    let dx, dy, dd, distDelta;
    let idxColor;

    // pull force
    dx = this.ix - this.x;
    dy = this.iy - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;

    this.scale = math.mapRange(dd, 0, 200, 1, 5);

    // push force
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    distDelta = this.minDist - dd;

    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }

    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}