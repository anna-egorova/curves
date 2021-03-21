class Renderer {

  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.rand = this.mulberry32(42);
    this.needToRender = true;
  }

  mulberry32(a) {
    return function () {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  shuffleConstrained(n, minJump = 3) { 
    const CNTR = 10000;
    let cntr = 0;
    let arr = undefined;
    while (cntr < CNTR) {
      arr = [...Array(n).keys()];
      arr = this.shuffleArray(arr);
      let foundUnaccepted = false;
      for (let i = 1; i < arr.length; ++i) {
        const prev = arr[i-1];
        const curr = arr[i];
        if (Math.abs(curr - prev) < minJump) {
          foundUnaccepted = true;
          break;
        }
      }
      if (!foundUnaccepted) {
        return arr;
      }
      cntr++;
    }
    return arr;
  }

  makeSplinePoints(nSegments = 20) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    let pointsX = [],
    pointsY = [];
    let indicesY = this.shuffleConstrained(nSegments + 1);
    for (let i = 0; i <= nSegments; ++i) {
      pointsX.push(i * (w / nSegments));
      pointsY.push(indicesY[i] * (h / nSegments));
    }
    return [pointsX, pointsY];
  }

  prepare() {

    this.points = [];
    this.currPoint = 1;
    this.resolution = canvas.width / 3;
    this.lineWidth = 2;

    const[xs, ys] = this.makeSplinePoints();
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
      if (y > maxY) {
        maxY = y;
      }
      if (y < minY) {
        minY = y;
      }
    }
    if (maxY < max) {
      max = maxY;
    }
    if (minY > min) {
      min = minY;
    }
    for (let i = 0; i < this.points.length; ++i) {
      const y = this.points[i].y;
      this.points[i].y = min + (max - min) * (y - minY) / (maxY - minY);
    }
  }
  
  resize() {
    var width = this.canvas.clientWidth;
    var height = this.canvas.clientHeight;
    if (this.canvas.width != width ||
        this.canvas.height != height) {
       this.canvas.width = width;
       this.canvas.height = height;
       return true;
  }
  return false;
}

  draw() {

    if (this.resize())
    {
      // handle window resize
    }
    
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
