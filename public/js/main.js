window.onload = function () {

  // load audio data
  var audio = document.getElementById('myAudio');
  audio.setAttribute('src', 'song3.mp3');
  audio.controls = true;
  audio.load();
  // audio.play();

  // setup audio processing
  var context = new AudioContext();
  var source = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();

  // connect the analyser between source and destination
  source.connect(analyser);
  analyser.connect(context.destination);

  // create frequency array to hold audio data
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  var lines = [];
  var count = 800;

  var width = $('#svg-vis').width();
  var height = $('#svg-vis').height();


  // map pixel units to percents
  var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, 100])
    .range([height, 0]);

  var s = Snap('#svg-vis');

  // create play / pause buttons

  // setup visual components to render audio data
  var visualComponents = [];

  var centerVisual = new CircleVisual(s, width, height);
  centerVisual.position = {
    x: x(10),
    y: height / 2
  };

  var centerVisual_2 = new CircleVisual(s, width, height);
  centerVisual.position = {
    x: x(75),
    y: height / 2
  }

  var mainBass = new BassWave(s, width, height);
  mainBass.COLOUR = '#1EFF00';

  var highAngleVisual = new CircleVisual(s, width, height);
  highAngleVisual.position = {
    x: 0,
    y: 0
  };
  highAngleVisual.ANGLE_START = 0.1;
  highAngleVisual.ANGLE_END = (Math.PI / 2) - 0.1;
  highAngleVisual.COLOUR = 'rgb(139, 20, 244)';
  highAngleVisual.START = 5;
  highAngleVisual.SIZE = 50;
  highAngleVisual.STROKE_WIDTH = 3;
  highAngleVisual.MAX_LENGTH = width * 0.8;

  var largeBass = new BassWave(s, width, height);
  largeBass.COLOUR = 'red';
  largeBass.position = {
    x: x(80),
    y: y(90)
  };
  largeBass.START = 800;
  largeBass.SIZE = 50;

  var waveform = new Waveform(s, width, height);

  // visualComponents.push(new Background(s, width, height));
  visualComponents.push(mainBass);
  visualComponents.push(centerVisual);
  visualComponents.push(centerVisual_2);
  visualComponents.push(highAngleVisual);
  visualComponents.push(waveform);

  // init all visual components
  visualComponents.forEach(function (c, i) {
    c.init();
  });

  // returns svg path for start x and y points, and array of points to connect to
  function buildPath(points) {
    var d = 'M' + x(points[0].x) + ',' + y(points[0].y);
    for (var j = 1; j < points.length; j++) {
      d += 'L' + x(points[j].x) + ',' + y(points[j].y);
    }
    return d;
  }

  function renderFrame() {
    // check if analyser has any audio data before trying to render anything
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(frequencyData);
    // analyser.getByteTimeDomainData(frequencyData);

    // draw all visual components
    visualComponents.forEach(function (c, i) {
      c.draw(frequencyData);
    });
  }

  renderFrame();
};
