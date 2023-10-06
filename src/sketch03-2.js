const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const eases = require('eases');

document.body.style.backgroundColor = '#232323';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let minDb, maxDb;

const sketch = () => {
  const nbCircle = 5;
  const nbSlice = 1;
  const slice = Math.PI * 2 / nbSlice;
  const radius = 200;

  const bins = [];
  const lineWidths = [];
  const rotationOffsets = [];

  let lineWidth, bin, mapped, phi;

  for (let i = 0; i < nbCircle * nbSlice; i++) {
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  for (let i = 0; i < nbCircle; i++) {
    const t = i / (nbCircle - 1);

    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < nbCircle; i++) {
    rotationOffsets.push(random.range(Math.PI * -0.25, Math.PI * 0.25) - Math.PI * 0.5);
  }

  return ({ context, width, height }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return;
    }
    
    analyserNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width / 2, height / 2);
    context.scale(1, -1);

    let cRadius = radius;
    for (let i = 0; i < nbCircle; i++) {
      context.save();
      context.rotate(rotationOffsets[i]);

      cRadius += lineWidths[i] * 0.5 + 2;
      for (let j = 0; j < nbSlice; j++) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];
        context.strokeStyle = 'black';
    
        bin = bins[i * nbSlice + j];

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true);

        phi = slice * mapped;

        context.beginPath();
        context.arc(0, 0, cRadius, 0, phi);
        context.stroke();
      }
      cRadius += lineWidths[i] * 0.5;
      context.restore();
    }
    context.restore();
  };
};

const getAverage = (datas) => {
  let sum = 0;

  datas.forEach(data => {
    sum += data;
  });
  return sum / datas.length;
}

const createAudio = () => {
  audio = document.createElement('audio');
  audio.src = '../ressource/Derezzed.mp3';
  //audio.src = 'https://artlist.io/royalty-free-music/song/neon-skies/65423';

  audioContext = new AudioContext();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512; // always power of 2
  analyserNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyserNode);

  minDb = analyserNode.minDecibels;
  maxDb = analyserNode.maxDecibels;

  audioData = new Float32Array(analyserNode.frequencyBinCount);
}

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) {
      createAudio();
    }

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  });
}

const start = async () => {
  addListeners();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
}

start();