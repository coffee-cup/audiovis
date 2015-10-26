function CircleVisual(svg, width, height) {
  this.name = "circle main component";
  this.svg = svg; // svg to draw to
  this.width = width; // width of canvas
  this.height = height; // height of canvas
  this.position = {
    x: this.width / 2,
    y: this.height / 2
  }; // where the center of the circle is

  this.MAX_LENGTH = (this.width / 2);
  this.SIZE = 200; // number of frequencies to use [0, 1024]
  this.START = 50; // where to start reading array, SIZE + START must be < 1024
  this.ANGLE_START = 0;
  this.ANGLE_END = 2 * Math.PI;
  this.STROKE_WIDTH = 5;
  this.colour = '#fe64a3';
  this.THRESHOLD = 10000;
  this.NEED_ANIMATE = false;
  this.PREV_VALUE = -1;
  this.ANIMATING = false;
  this.crazy = false;
  this.colours = ["#E91E63", "#03A9F4", "#FFEB3B"];

  this.lines = []; // array of lines that are dancing to music, size this.SIZE
}

CircleVisual.prototype.getPath = function (i, strength) {
  var angle = this.c_map(i);
  var length = this.line_length_map(strength);
  var end_pos = {
    x: (Math.cos(angle) * length) + this.position.x,
    y: (Math.sin(angle) * length) + this.position.y
  };
  var d = "M" + this.position.x + "," + this.y(this.position.y) + "L" + end_pos.x + "," + this.y(
    end_pos.y);
  return d;
};

CircleVisual.prototype.init = function () {

  // create all properties that are based off others
  this.line_length_map = d3.scale.linear()
    .domain([0, 255])
    .range([0, this.MAX_LENGTH]); // map strength of frequency to a length
  this.c_map = d3.scale.linear() // map between size number of frequencies and radius of cirlce
    .domain([0, this.SIZE])
    .range([this.ANGLE_START, this.ANGLE_END]);
  this.y = d3.scale.linear()
    .domain([0, this.height])
    .range([this.height, 0]);

  for (var i = 0; i < this.SIZE; i++) {
    var d = this.getPath(i, 0);
    var l = this.svg.path(d)
      .attr('class', 'circle-line')
      .attr('fill', 'none')
      .attr('stroke', this.colour)
      .attr('stroke-width', this.STROKE_WIDTH);
    l.transform('t' + this.position.x + ',-' + this.position.y);

    this.lines.push(l);
  }
};

CircleVisual.prototype.initFrame = function (audio_data) {

};

CircleVisual.prototype.endFrames = function (audio_data, sum) {
  var diff = Math.abs(sum - this.PREV_VALUE);
  if (diff >= this.THRESHOLD && !this.ANIMATING) {
    this.colour = this.colours[Math.floor(Math.random() * this.colours.length)];
    this.NEED_ANIMATE = true;
  } else {
    this.NEED_ANIMATE = false;
  }

  this.PREV_VALUE = sum;
}

CircleVisual.prototype.drawFrame = function (frame, i, audio_data) {
  if (i >= this.SIZE) {
    return;
  }

  var l = this.lines[i];
  var d = this.getPath(i, audio_data[i + this.START]);
  var angle = this.c_map(i);

  var strokeWidth = this.STROKE_WIDTH;
  var c = chroma(this.colour);

  if (this.crazy) {
    if (Math.floor(Math.random() * (450 - audio_data[i])) == 1) {
      // c = this.colours[Math.floor(Math.random() * this.colours.length)];
      c = c.saturate(10).darken(10);
    }
  }

  l.attr({
    'd': d,
    'stroke': c.hex(),
    'stroke-width': strokeWidth
  });
};

CircleVisual.prototype.draw = function (audio_data) {};
