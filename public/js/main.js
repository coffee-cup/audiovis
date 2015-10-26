window.onload = function () {

  // load audio data
  var audio = document.getElementById('myAudio');
  audio.setAttribute('src', 'cold.mp3');
  audio.controls = true;
  audio.load();

  var emptyCount = 0;

  // event listeners
  addEventHandler(audio, "playing", function () {
    $('#desc').fadeOut();
  });

  addEventHandler(audio, "pause", function () {
    $('#desc').fadeIn();
  });

  var loadAudioSource = function (src) {
    audio.pause();
    audio.setAttribute('src', src);
    audio.load();
    audio.play();
  };

  $('body').on('dragover', function (e) {
    e.preventDefault();
  });

  $('body').on('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.originalEvent.dataTransfer.files;
    if (files.length > 0) {
      var url = URL.createObjectURL(files[0]);
      var name = files[0].name;
      loadAudioSource(url);
    }
  });

  $('body').on('click', '.song', function (e) {
    var id = e.target.id;
    if (id) {
      loadAudioSource(id);
    }
  });

  // audio.play();

  // setup audio processing
  var context = new AudioContext();
  var source = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();

  // connect the analyser between source and destination
  source.connect(analyser);
  analyser.connect(context.destination);

  // returns if audio is playing
  var isPlaying = function () {
    return !audio.paused;
  }

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
    x: x(35),
    y: y(75)
  };
  centerVisual.crazy = true;

  var centerVisual_2 = new CircleVisual(s, width, height);
  centerVisual_2.position = {
    x: x(0),
    y: y(55)
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
  highAngleVisual.STROKE_WIDTH = 4;
  highAngleVisual.MAX_LENGTH = width * 0.4;
  highAngleVisual.colours = ["#D21A11", "#03FF80", "#24FF03"];
  highAngleVisual.THRESHOLD = 10000;
  highAngleVisual.colour = "#03FF80";
  highAngleVisual.crazy = true;

  var largeBass = new BassWave(s, width, height);
  largeBass.COLOUR = 'red';
  largeBass.position = {
    x: x(80),
    y: y(90)
  };
  largeBass.START = 800;
  largeBass.SIZE = 50;

  var waveform = new Waveform(s, width, height);

  var background = new Background(s, width, height);

  visualComponents.push(background);
  visualComponents.push(highAngleVisual);
  visualComponents.push(waveform);
  visualComponents.push(centerVisual);
  visualComponents.push(mainBass);
  // visualComponents.push(centerVisual_2);

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
    requestAnimationFrame(renderFrame);
    // check if analyser has any audio data before trying to render anything

    // buffer to let visualizer cool down
    if (!isPlaying() && emptyCount < 50) {
      emptyCount++;
    } else if (!isPlaying()) {
      return;
    }
    if (isPlaying()) {
      emptyCount = 0;
    }

    analyser.getByteFrequencyData(frequencyData);
    // analyser.getByteTimeDomainData(frequencyData);

    // draw all visual components
    // visualComponents.forEach(function (c, i) {
    //   c.draw(frequencyData);
    // });

    // initialize components with audio data
    for (var i = 0; i < visualComponents.length; i++) {
      var c = visualComponents[i];
      if (c.initFrame) {
        c.initFrame(frequencyData);
      }
    }

    // loop through frequency data and send each index to the component
    // this is convient because we ony have to run through this loop once
    var sum = 0;
    for (var i = 0; i < frequencyData.length; i++) {
      for (var j = 0; j < visualComponents.length; j++) {
        var c = visualComponents[j];
        if (c.drawFrame) {
          c.drawFrame(frequencyData[i], i, frequencyData);
        }
      }
      sum += frequencyData[i];
    }

    // call endFrames on all compoents with audio data and sum
    for (var i = 0; i < visualComponents.length; i++) {
      var c = visualComponents[i];
      if (c.endFrames) {
        c.endFrames(frequencyData, sum);
      }
    }
  }

  renderFrame();
};

function addEventHandler(obj, evt, handler) {
  if (obj.addEventListener) {
    // W3C method
    obj.addEventListener(evt, handler, false);
  } else if (obj.attachEvent) {
    // IE method.
    obj.attachEvent('on' + evt, handler);
  } else {
    // Old school method.
    obj['on' + evt] = handler;
  }
}
