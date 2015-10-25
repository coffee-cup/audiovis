function Background(svg, width, height) {
  this.name = "background colour component";
  this.svg = svg; // svg to draw to
  this.width = width; // width of canvas
  this.height = height; // height of canvas
  this.SIZE = 200; // number of frequencies to use [0, 1024]
  this.START = 800; // where to start reading array, SIZE + START must be < 1024
  this.THRESHOLD = 2000; // amount sum of values over range has to change to trigger change animates
  this.BLINK_THRESHOLD = 3500 // amount sum of values over range has to chnage to blink colour change
  this.PREV_VALUE = -1;
  this.back = null;
  this.ANIMATING = false;
  this.colours = ["#41F1F6", "#FFBF54", "#FBFF00", "#6BFF7C", "#FF74D8", "#A37FFA", "#CF7EEF",
    "#5EB8FF", "#FF81C2", "#00C3FF", "#FEFE66", "#4AFF5A"
  ];
}

// returns random value from array
randomColour = function (colours) {
  return colours[Math.floor(Math.random() * colours.length)];
}

Background.prototype.init = function () {
  var d = 'M0,0L0' + ',' + this.height + 'L' + this.width + ',' + this.height + 'L' + this.width +
    ',0L0,0';
  this.colour = randomColour(this.colours)
  this.back = this.svg.path(d)
    .attr('stroke', 'none')
    .attr('fill', this.colour);
};

Background.prototype.trigger = function (audio_data) {
  this.colour1 = randomColour(this.colours);
  this.colour2 = randomColour(this.colours);
}

// Takes one frame of audio data array and does its thing
// You are passed in audio_data, but not allowed to loop through it
// This ensures we are only looping through audio data array once
// for performance
Background.prototype.drawFrame = function (frame, i, audio_data) {
  if (i < this.START) {
    return;
  }
  if (i >= this.SIZE + this.START) {
    return;
  }

  this.sum += audio_data[i];
}

Background.prototype.endFrames = function (audio_data, sum) {
  // if the sum of frequencys is of difference THRESHOLD
  // to last chunk of data
  // then trigger to change background colour
  var animate = false;
  var triggered = false;
  var diff = Math.abs(this.sum - this.PREV_VALUE);
  if (diff > this.BLINK_THRESHOLD) {
    this.trigger(audio_data); // gets new colour
    animate = false;
    triggered = true;
    // console.log('BLINK TRIGGERED: ' + diff);
  } else if (diff > this.THRESHOLD) {
    this.trigger(audio_data);
    animate = true;
    triggered = true;
    // console.log('SMALL TRIGGERED: ' + diff);
  }

  var c1 = chroma(this.colour1);
  var c2 = chroma(this.colour2);
  var coors = "l(0, 0, 1, 1)";
  if (Math.floor(Math.random() * 3) == 1) {
    coors = "l(1, 0, 0, 1)";
  }

  if (triggered) {
    if (animate) {
      if (!this.ANIMATING) {
        var _this = this;
        _this.ANIMATING = true;
        this.back.animate({
          fill: c1.hex()
        }, 1250, function () {
          _this.ANIMATING = false;
        });
      }
    } else {
      this.back.attr({
        'fill': c1.hex()
      });
    }
  }

  // this.setBackground();
  this.PREV_VALUE = this.sum;
}

// Called with audio data before draw Frames are called
// do not loop through it
// ^ performance
Background.prototype.initFrame = function (audio_data) {
  this.sum = 0;
}

Background.prototype.draw = function (audio_data) {

};
