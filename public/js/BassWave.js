function BassWave(svg, width, height) {
  this.name = "bass wave thing";
  this.svg = svg; // svg to draw to
  this.width = width; // width of canvas
  this.height = height; // height of canvas
  this.position = {
    x: this.width / 2,
    y: this.height / 2
  };

  this.SIZE = 50; // number of frequencies to use [0, 1024]
  this.START = 400; // where to start reading array, SIZE + START must be < 1024
  this.COLOUR = 'red';
  this.MAX_LENGTH = (this.height * 0.8);

  this.line = null;
  this.average = 0;
}

BassWave.prototype.getPath = function (i, strength) {
  var angle = this.c_map(i);
  var length = this.line_length_map(strength);
  var end_pos = {
    x: (Math.cos(angle) * length) + this.position.x,
    y: (Math.sin(angle) * length) + this.position.y
  };
  var d = "M" + this.position.x + "," + this.position.y + "L" + end_pos.x + "," + end_pos.y;
  return d;
};

BassWave.prototype.getPoint = function (i, strength) {
  var angle = this.c_map(i);
  var length = this.line_length_map(strength);
  var pos = {
    x: (Math.cos(angle) * length) + this.position.x,
    y: (Math.sin(angle) * length) + this.position.y
  };
  return pos;
};

BassWave.prototype.init = function () {

  this.line_length_map = d3.scale.linear()
    .domain([0, 255])
    .range([0, this.MAX_LENGTH]); // map strength of frequency to a length
  this.c_map = d3.scale.linear() // map between size number of frequencies and radius of cirlce
    .domain([0, this.SIZE])
    .range([0, 2 * Math.PI]);

  // init it line
  var s = this.getPoint(0, 200);
  var d = 'M' + s.x + ',' + s.y;
  for (var i = 1; i < this.SIZE; i++) {
    var p = this.getPoint(i, 200);
    d += 'T' + p.x + ',' + p.y;
  }

  this.line = this.svg.path(d)
    .attr('class', 'bass-line')
    .attr('fill', this.COLOUR)
    .attr('stroke', 'none')
    .attr('stroke-width', 1);
};

BassWave.prototype.initFrame = function (audio_data) {
  this.s = this.getPoint(0, audio_data[this.START]);
  this.d = 'M' + this.s.x + ',' + this.s.y;
  this.sum = 0;
}

BassWave.prototype.endFrames = function (audio_data, sum) {
  var colour = '#7ee8fa';
  var dif = Math.abs(this.sum - this.average);
  if (Math.abs(this.sum - this.average) > 300) {
    colour = '#2de1c2';
  }

  if (this.sum + this.average > 0) {
    this.average = (this.sum + this.average) / 2
  }

  this.d += 'T' + this.s.x + ',' + this.s.y; // close path
  this.line.attr({
    'd': this.d,
    'fill': colour
  });
}

BassWave.prototype.drawFrame = function (frame, i, audio_data) {
  if (i < this.START) {
    return;
  }

  if (i >= this.SIZE + this.START) {
    return;
  }

  for (var i = 1; i < this.SIZE; i++) {
    var p = this.getPoint(i, audio_data[i + this.START]);
    this.sum += audio_data[i + this.START];
    this.d += 'T' + p.x + ',' + p.y;
  }
}

BassWave.prototype.draw = function (audio_data) {

};
