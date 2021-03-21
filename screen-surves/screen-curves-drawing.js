class Renderer {

  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.rand = this.mulberry32(42);
  }
  
  mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
  }

  makeSplinePoints(nPoints = 10) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    let pointsX = [], pointsY = [];
    for (let i = 0; i <= nPoints; ++i) {
      pointsX.push(i * (w / nPoints));
      pointsY.push(this.randomInt(0, h-1));
    }
    return [pointsX, pointsY];
  }

  prepare() {

    this.points = [];
    this.currPoint = 1;
    this.resolution = canvas.width / 5;
    this.lineWidth = 2;

    const [xs, ys] = this.makeSplinePoints();
    this.spline = new Spline(xs, ys);
    for (let i = 0; i < this.resolution; i++) {
      const x = i * (this.canvas.width / this.resolution);
      const y = this.spline.at(x);
      this.points.push({
        x: x,
        y: y
      });
    }
    // Correction for the cubic spline overshoot
    let max = this.canvas.height - this.lineWidth;
    let min = 0 + this.lineWidth;
    let minY = +1000000;
    let maxY = -1000000;
    for (let i = 0; i < this.points.length; ++i) {
      const y = this.points[i].y;
      if (y > maxY) { maxY = y; }
      if (y < minY) { minY = y; }
    }
    if (maxY < max) { max = maxY; }
    if (minY > min) { min = minY; }
    for (let i = 0; i < this.points.length; ++i) {
      const y = this.points[i].y;
      this.points[i].y = min + (max - min)*(y - minY)/(maxY - minY);
    }
  }

  draw() {
    
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = '#0000FF';
    this.ctx.fillStyle = '#0000FF';

    for (let p = 1; p < this.currPoint - 1; p++) {
      this.ctx.lineTo(this.points[p].x, this.points[p].y);
    }
    this.ctx.stroke();
    this.currPoint++;
    if (this.currPoint >= this.points.length) {
      this.currPoint = 1;
      this.prepare();
    }
  }

}
