/*
{RHPF.ar(LPF.ar(BrownNoise.ar(), 400), LPF.ar(BrownNoise.ar(), 14) * 400 + 500, 0.03, 0.1)}.play

LPF.ar(in: 0.0, freq: 440.0, mul: 1.0, add: 0.0)

Arguments:
  in: The input signal.
  freq: Cutoff frequency in Hertz. 
  mul: Output will be multiplied by this value.
  add:	This value will be added to the output.

RHPF.ar(in: 0.0, freq: 440.0, rq: 1.0, mul: 1.0, add: 0.0)

Arguments:
  in: The input signal.
  freq: Cutoff frequency in Hertz.
  rq: The reciprocal of Q (bandwidth / cutoffFreq).
  mul: Output will be multiplied by this value.
  add: This value will be added to the output.

*/
var globalAnalyser;
var audioCtx;
var LPFInput;
var LPFModFreq;
var additiveModFreq;
var rHPF;
var brownNoise;
var compressor;

var isPlayingBrook = false;
var isPlayingCrickets = false;

document.addEventListener("DOMContentLoaded", function (event) {
  document.getElementById("brookButton").addEventListener("click", startBrook);

  function startBrook() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.value = 0.3;
    if (!isPlayingBrook) {
      // LPF that is the input to the RHPF
      LPFInput = audioCtx.createBiquadFilter();
      LPFInput.type = "lowpass";
      LPFInput.frequency.value = 275;
      LPFInput.Q.value = 4;

      // LPF to control the freq of the RHPF
      LPFModFreq = audioCtx.createBiquadFilter();
      LPFModFreq.type = "lowpass";
      LPFModFreq.frequency.value = 14;
      LPFModFreq.Q.value = 9;

      // GainNode for multiplying
      var multiplier = audioCtx.createGain();
      multiplier.gain.value = 600;

      rHPF = audioCtx.createBiquadFilter();
      rHPF.type = "highpass";
      rHPF.frequency.value = 500;
      rHPF.Q.value = 1 / 0.03;
      globalGain.gain.value = 0.3;
      var bufferSize = 10 * audioCtx.sampleRate,
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
        output = noiseBuffer.getChannelData(0);

      var lastOut = 0;
      for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;

        output[i] = (lastOut + 0.02 * brown) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      brownNoise = audioCtx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;

      // connect the audio bits
      brownNoise
        .connect(LPFInput)
        .connect(rHPF)
        .connect(globalGain)
        .connect(audioCtx.destination);

      brownNoise
        .connect(LPFModFreq)
        .connect(multiplier)
        .connect(rHPF.frequency);
      // brownNoise.connect(additiveModFreq).connect(rHPF.frequency);

      brownNoise.start(0);

      console.log("start brook");
    } else {
      console.log("stop Brook");
      audioCtx.close();
    }
    isPlayingBrook = !isPlayingBrook;
  }

  document
    .getElementById("cricketButton")
    .addEventListener("click", startCrickets);

  function startCrickets() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain();
    globalGain.gain.value = 0.3;
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -10;
    compressor.connect(audioCtx.destination);

    const lowpass = audioCtx.createBiquadFilter();
    const highpass = audioCtx.createBiquadFilter();

    highpass.type = "highpass";
    highpass.frequency = 8000;

    lowpass.type = "lowpass";
    lowpass.frequency.value = 2000;

    const noiseGain = audioCtx.createGain();
    noiseGain.connect(globalGain).connect(lowpass);

    var bandpassFilters = [];
    const bandpassFreqs = [
      (4500 + 1200) / 2,
      (9000 + 500) / 2,
      (4550 + 1200) / 2,
      (4600 + 1200) / 2,
    ];
    var bandpassGainVals = [100, 22, 100, 100];
    for (var i = 0; i < 4; i++) {
      var bandpass = audioCtx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = bandpassFreqs[i];
      bandpass.Q.value = 200;
      const bandpassGain = audioCtx.createGain();
      bandpassGain.gain.value = bandpassGainVals[i];
      bandpassFilters.push(bandpass);
      lowpass.connect(bandpass).connect(bandpassGain).connect(highpass);
    }
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds of noise
    highpass.connect(compressor);
    const noiseBuffer = audioCtx.createBuffer(
      1,
      bufferSize,
      audioCtx.sampleRate
    );
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // Generate random noise values between -1 and 1
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Connect the noise source to the noise gain node
    noiseSource.connect(noiseGain);

    const clicker = audioCtx.createOscillator();
    clicker.type = "triangle";
    clicker.frequency.value = 6;

    clicker.connect(noiseGain.gain);

    // Start the noise source and clicker
    noiseSource.start();

    clicker.start();
    globalAnalyser = audioCtx.createAnalyser();
    globalGain.connect(globalAnalyser);
    draw();

    document.getElementById("answer").removeAttribute("hidden");
    document.getElementById("stopCrickets").removeAttribute("hidden");
    document.getElementById("answer").classList.add("animate__animated");
  }
  document
    .getElementById("stopCrickets")
    .addEventListener("click", stopCrickets);

  function stopCrickets() {
    audioCtx.close();
    document.getElementById("stopCrickets").setAttribute("hidden", true);
    document.getElementById("answer").setAttribute("hidden", true);
  }
  function draw() {
    globalAnalyser.fftSize = 2048;
    var bufferLength = globalAnalyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    globalAnalyser.getByteTimeDomainData(dataArray);

    var canvas = document.querySelector("#globalVisualizer");
    var canvasCtx = canvas.getContext("2d");

    requestAnimationFrame(draw);

    globalAnalyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    var sliceWidth = (canvas.width * 1.0) / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * canvas.height) / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
});
