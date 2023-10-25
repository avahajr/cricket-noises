document.addEventListener("DOMContentLoaded", function (event) {
  // Create an AudioContext
  const audioContext = new AudioContext();

  // Inlets from Bronchi
  const leftBronchus = audioContext.createOscillator();
  leftBronchus.frequency.value = 440; // Set the frequency as needed
  const rightBronchus = audioContext.createOscillator();
  rightBronchus.frequency.value = 440; // Set the frequency as needed

  // Ring Modulator
  const ringModulator = audioContext.createGain();
  ringModulator.gain.value = 0.5; // Adjust the balance

  // Pulse Wave Oscillators
  const pulseOscillator1 = audioContext.createOscillator();
  pulseOscillator1.type = "square"; // Set to a square wave
  pulseOscillator1.frequency.value = 440; // Set the frequency as needed

  // Trachea Filters
  const filter1 = audioContext.createBiquadFilter();
  filter1.type = "bandpass";
  filter1.frequency.value = 1000; // Set the desired frequency
  filter1.Q.value = 1.0; // Adjust Q factor as needed

  // Control Parameters (envelopes)
  const paramEnvelope = audioContext.createGain();
  paramEnvelope.gain.setValueAtTime(0, audioContext.currentTime);
  paramEnvelope.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.5); // Adjust envelope parameters

  // Connect components
  leftBronchus.connect(ringModulator);
  rightBronchus.connect(ringModulator);
  pulseOscillator1.connect(audioContext.destination); // Connect to your output

  // Connect filters to the output
  ringModulator.connect(filter1);
  filter1.connect(audioContext.destination); // Connect to your output

  // Function to start the audio
  function startBirdcall() {
    leftBronchus.start();
    rightBronchus.start();
    pulseOscillator1.start();
  }

  // Function to stop the audio
  function stopBirdcall() {
    leftBronchus.stop();
    rightBronchus.stop();
    pulseOscillator1.stop();
  }

  // Get the Start and Stop buttons
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");

  // Add click event listeners to start and stop the sound
  startButton.addEventListener("click", () => {
    startBirdcall();
  });

  stopButton.addEventListener("click", () => {
    stopBirdcall();
  });
});
