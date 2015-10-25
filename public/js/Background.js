function Background(svg, width, height) {
  this.name = "background colour component";
  this.svg = svg; // svg to draw to
  this.width = width; // width of canvas
  this.height = height; // height of canvas
  this.SIZE = 50; // number of frequencies to use [0, 1024]
  this.START = 400; // where to start reading array, SIZE + START must be < 1024
  this.THRESHOLD = 500; // amount sum of values over range has to change to trigger change
  this.PREV_VALUE = -1;
  this.back = null;
}

Background.prototype.init = function() {
    var d = 'M0,0L0' + ',' + this.height + 'L' + this.width + ',' + this.height + 'L' + this.width + ',0L0,0';
    var colour = chroma.random().hex();
    this.back = this.svg.path(d)
      .attr('stroke', 'none')
      .attr('fill', colour);
};

Background.prototype.getSum = function(audio_data) {
  var sum = 0;
  for (var i=this.START;i<this.START + this.SIZE;i++) {
    sum += audio_data[i];
  }
  return sum;
}

Background.prototype.trigger = function(audio_data) {
  var colour = chroma.random().hex();
  this.back.attr({'fill': colour});
}

Background.prototype.draw = function(audio_data) {
  var sum = this.getSum(audio_data);

  if (Math.abs(sum - this.PREV_VALUE) > this.THRESHOLD) {
      this.trigger(audio_data);
  }
  this.PREV_VALUE = sum;
};
