const canvasSketch = require('canvas-sketch');

document.body.style.backgroundColor = '#232323';

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let canvaRef;
let points;

const sketch = ({ canvas }) => {
  points = [
    new Point({ x: 200, y: 540 }),
    new Point({ x: 400, y: 700 }),
    new Point({ x: 880, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
  ];

  canvas.addEventListener('mousedown', onMouseDown);

  canvaRef = canvas;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // draw grey line
    context.strokeStyle = '#999';
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
    
    // draw curve line
    context.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i+1];
      const mx = curr.x + (next.x - curr.x) * 0.5;
      const my = curr.y + (next.y - curr.y) * 0.5;

      // reset line with begin and end points
      if (i == 0) {
        context.moveTo(curr.x, curr.y);
      } else if (i == points.length - 2) {
        context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
      } else {
        context.quadraticCurveTo(curr.x, curr.y, mx, my);
      }
    }
    context.lineWidth = 4;
    context.strokeStyle = 'blue';
    context.stroke;
    context.stroke();

    points.forEach(point => {
      point.draw(context);
    });
  };
};

const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  
  // real position on canva scale
  const x = (e.offsetX / canvaRef.offsetWidth) * canvaRef.width;
  const y = (e.offsetY / canvaRef.offsetHeight) * canvaRef.height;

  let hit = false;
  points.forEach(point => {
    point.isDragging = point.hitTest(x, y);

    if (point.isDragging) {
      hit = true;
    }
  });
  if (!hit) {
    points.push(new Point({x, y}));
  }
};

const onMouseMove = (e) => {
  // real position on canva scale
  const x = (e.offsetX / canvaRef.offsetWidth) * canvaRef.width;
  const y = (e.offsetY / canvaRef.offsetHeight) * canvaRef.height;

  points.forEach(point => {
    if (point.isDragging) {
      point.x = x;
      point.y = y;
    }
  });
}

const onMouseUp = (e) => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

canvasSketch(sketch, settings);

class Point {
  constructor({x, y, control = false}) {
    this.x = x;
    this.y = y;
    this.control = control;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.control ? 'red' : 'black';

    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dd = Math.sqrt(dx * dx + dy * dy);

    return dd < 20;
  }
}