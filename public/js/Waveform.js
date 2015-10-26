function Waveform(svg, width, height) {
  this.name = "sine wave";
  this.svg = svg; // svg to draw to
  this.width = width; // width of canvas
  this.height = height; // height of canvas
  this.position_y = (this.height / 2) + (this.height / 4);

  this.SIZE = 200; // number of frequencies to use [0, 1024]
  this.START = 300; // where to start reading array, SIZE + START must be < 1024
  this.COLOUR = 'rgba(138, 3, 255, 1.0)';
  this.STROKE_WIDTH = 4;
  this.MAX_HEIGHT = this.height * 0.9;

  this.sin_index = 0;
  this.point_separation = this.width / this.SIZE;
  this.points = [];
  this.lines = [];
}

Waveform.prototype.init = function () {

  this.line_length_map = d3.scale.linear()
    .domain([0, 255])
    .range([0, this.MAX_HEIGHT]); // map strength of frequency to a length
  this.c_map = d3.scale.linear() // map between size number of frequencies and radius of cirlce
    .domain([0, this.SIZE])
    .range([0, 2 * Math.PI]);
  this.y = d3.scale.linear()
    .domain([0, this.height])
    .range([this.height, 0]);

  // init it line

  for (var i = 0; i < this.SIZE; i++) {
    var d = this.getLine(i, 100);
    var l = this.svg.path(d)
      .attr('class', 'waveform-line')
      .attr('fill', 'none')
      .attr('stroke', this.COLOUR)
      .attr('stroke-width', this.STROKE_WIDTH);
    this.lines.push(l);
  }
};

// returns a line for the ith spot and strength
Waveform.prototype.getLine = function (i, strength) {
  var line_length = this.line_length_map(strength);
  var start = 'M' + (i * this.point_separation) + ',' + this.y(this.position_y - line_length / 2);
  var end = 'T' + (i * this.point_separation) + ',' + this.y(this.position_y + line_length / 2);
  var d = start += end;
  return d;
};

Waveform.prototype.getPath = function (audio_data) {
  var d = 'M' + 0 + ',' + this.position_y;
  for (var i = 1; i < this.SIZE; i++) {
    var length = this.line_length_map(audio_data[i + this.START]);
    d += 'L' + (i * this.point_separation) + ',' + this.y(this.position_y + length);
  }
  return d;
};

Waveform.prototype.initFrame = function (audio_data) {

};

Waveform.prototype.drawFrame = function (frame, i, audio_data) {
  if (i >= this.SIZE) {
    return;
  }

  var l = this.lines[i];
  var d = this.getLine(i, audio_data[i + this.START]);
  l.attr({
    'd': d
  });
};

Waveform.prototype.draw = function (audio_data) {};
