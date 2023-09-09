const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const risoColors = require('riso-colors');

document.body.style.backgroundColor = '#232323';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const sketch = ({context, width, height}) => {
  const bgColor = random.pick(risoColors).hex;
  const num = 60;
  const degrees = -30;
  const risoColorsTab = [
    random.pick(risoColors).hex,
    random.pick(risoColors).hex
  ]
  let x, y, w, h, fill, stroke, blend;
  let rects = [];


  for (let i = 0; i < num; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(600, width);
    h = random.range(40, 200);

    fill = random.pick(risoColorsTab);
    stroke = random.pick(risoColorsTab);

    blend = random.value() > 0.5 ? 'overlay' : 'source-over';

    rects.push({x, y, w, h, fill, stroke, blend});
  }

  return ({context, width, height}) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    
    context.save();
    context.translate(width * 0.5, height * 0.5);

    context.beginPath();
    context.moveTo(0, -300);
    context.lineTo(300, 200);
    context.lineTo(-300, 200);
    context.closePath();

    context.lineWidth = 10;
    context.strokeStyle = 'black';
    context.stroke();

    context.clip();

    rects.forEach(rect => {
      context.save();
      context.translate(width * -0.5, height * -0.5);
      context.translate(rect.x, rect.y);

      drawRectangle(context, rect, degrees);

      context.restore();
    });
  };
};

const drawRectangle = (context, rect, degrees) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * rect.w;
  const ry = Math.sin(angle) * rect.w;
  let shadowColor;
  
  context.save();

  context.lineWidth = 10;
  context.fillStyle = rect.fill;
  context.strokeStyle = rect.stroke;

  shadowColor = color.offsetHSL(rect.fill, 0, 0, -20);
  shadowColor.rgba[3] = 0.5;

  context.shadowColor = color.style(shadowColor.rgba);
  context.shadowOffsetX = -10;
  context.shadowOffsetY = 20;

  context.translate(rx * -0.5, (ry + rect.h) * -0.5);

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + rect.h);
  context.lineTo(0, rect.h);
  context.closePath();
  context.stroke();
  context.shadowColor = null;
  context.fill();

  context.globalCompositeOperation = rect.blend;

  context.lineWidth = 2;
  context.strokeStyle = 'black';
  context.stroke();

  context.restore();
}

canvasSketch(sketch, settings);
